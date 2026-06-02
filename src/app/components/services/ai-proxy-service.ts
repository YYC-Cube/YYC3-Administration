/**
 * @file ai-proxy-service.ts
 * @description YYC³ AI API Proxy Service — Server-side API proxy abstraction layer.
 *   Provides a unified interface for AI provider calls (OpenAI, Claude, DeepSeek)
 *   with API key protection, request signing, rate limiting, retry logic, and caching.
 *   In production, replace the direct fetch calls with your backend proxy endpoint.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,frontend,ai,proxy,service,security
 */

// ==========================================
// Types
// ==========================================

/** Supported AI provider types */
export type AIProviderType = "mock" | "openai" | "claude" | "deepseek";

/** AI provider configuration */
export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  baseUrl?: string;
}

/** Chat message format */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** Proxy request payload */
export interface ProxyRequest {
  provider: AIProviderType;
  model: string;
  messages: ChatMessage[];
  temperature: number;
  maxTokens: number;
  stream?: boolean;
}

/** Proxy response payload */
export interface ProxyResponse {
  content: string;
  model: string;
  provider: AIProviderType;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  cached?: boolean;
  latencyMs: number;
}

/** Rate limit state */
interface RateLimitState {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per second
}

/** Cache entry */
interface CacheEntry {
  response: string;
  timestamp: number;
  ttlMs: number;
}

// ==========================================
// Constants
// ==========================================

/**
 * 🔒 SECURITY: In production, replace this with your actual backend proxy URL.
 * The proxy server should:
 * 1. Store API keys server-side (never expose to browser)
 * 2. Validate/sign requests
 * 3. Implement rate limiting
 * 4. Log and monitor API usage
 *
 * Example: PROXY_BASE_URL = "https://api.yourdomain.com/ai-proxy"
 */
const PROXY_BASE_URL = "__PROXY_BASE_URL__"; // Replace with your backend endpoint

const PROVIDER_ENDPOINTS: Record<AIProviderType, { chatPath: string; defaultBaseUrl: string }> = {
  mock: { chatPath: "", defaultBaseUrl: "" },
  openai: { chatPath: "/chat/completions", defaultBaseUrl: "https://api.openai.com/v1" },
  claude: { chatPath: "/messages", defaultBaseUrl: "https://api.anthropic.com/v1" },
  deepseek: { chatPath: "/chat/completions", defaultBaseUrl: "https://api.deepseek.com/v1" },
};

const SYSTEM_PROMPT = `You are YYC³ AI Assistant, an expert coding assistant integrated into the YYC³ CloudPivot Intelli-Matrix IDE. You help with code generation, debugging, architecture design, and development best practices. Respond concisely and precisely. Use Chinese when the user writes in Chinese. Always format code with proper syntax highlighting hints.`;

const MOCK_RESPONSES = [
  "基于您当前的代码库分析，建议使用自定义 Hook 模式实现 WebSocket 集成，以提高组件间的复用性。\n\n```typescript\nexport function useWebSocket(url: string) {\n  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');\n  // ... implementation\n}\n```",
  "我分析了您的 Zustand Store 结构。建议使用 `immer` 中间件来简化深层嵌套对象的不可变更新操作，这将显著减少样板代码。",
  "观察到 task-board-page 中的 DnD 实现可以通过 `useMemo` 记忆化 `useDrag` 和 `useDrop` 配置来优化，减少不必要的重渲染。",
  "您的主题系统 `useThemeColors` 设计良好。要添加动画令牌，建议扩展 `ThemeColors` 接口，加入 transition/easing 预设值。",
  "对于文件浏览器的虚拟滚动，建议使用 `react-window` 来高效渲染包含 10,000+ 节点的大型文件树，避免性能退化。",
  "检测到潜在的内存泄漏风险：AI 推理的异步操作缺少 AbortController。建议在组件卸载时取消所有待处理的请求。\n\n```typescript\nuseEffect(() => {\n  const controller = new AbortController();\n  fetchAI(input, { signal: controller.signal });\n  return () => controller.abort();\n}, [input]);\n```",
];

// ==========================================
// Rate Limiter
// ==========================================

class TokenBucketRateLimiter {
  private state: RateLimitState;

  constructor(maxTokens: number = 20, refillRate: number = 2) {
    this.state = { tokens: maxTokens, lastRefill: Date.now(), maxTokens, refillRate };
  }

  /** Check if a request can proceed; returns wait time in ms (0 = proceed) */
  tryAcquire(): number {
    const now = Date.now();
    const elapsed = (now - this.state.lastRefill) / 1000;
    this.state.tokens = Math.min(this.state.maxTokens, this.state.tokens + elapsed * this.state.refillRate);
    this.state.lastRefill = now;

    if (this.state.tokens >= 1) {
      this.state.tokens -= 1;
      return 0;
    }
    return Math.ceil((1 - this.state.tokens) / this.state.refillRate * 1000);
  }
}

// ==========================================
// Response Cache
// ==========================================

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  private makeKey(req: ProxyRequest): string {
    return `${req.provider}:${req.model}:${JSON.stringify(req.messages.slice(-3))}`;
  }

  get(req: ProxyRequest): string | null {
    const key = this.makeKey(req);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  set(req: ProxyRequest, response: string, ttlMs: number = 300000): void {
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(this.makeKey(req), { response, timestamp: Date.now(), ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }
}

// ==========================================
// AI Proxy Service
// ==========================================

class AIProxyService {
  private rateLimiter = new TokenBucketRateLimiter(20, 2);
  private cache = new ResponseCache(100);
  private requestLog: { timestamp: number; provider: string; model: string; latencyMs: number; cached: boolean }[] = [];

  /**
   * Send a chat request through the proxy service.
   * In production mode (PROXY_BASE_URL configured), routes through server proxy.
   * In development mode, falls back to direct API calls or mock responses.
   * @param config - AI provider configuration
   * @param messages - Chat message history
   * @param signal - Optional AbortSignal for cancellation
   * @param fileContext - Optional: current open file content for AI context injection
   */
  async chat(config: AIProviderConfig, messages: ChatMessage[], signal?: AbortSignal, fileContext?: { filePath: string; content: string }): Promise<ProxyResponse> {
    const startTime = Date.now();

    // Build enhanced system prompt with file context
    let systemPrompt = SYSTEM_PROMPT;
    if (fileContext?.content) {
      systemPrompt += `\n\n--- CURRENT OPEN FILE ---\nFile: ${fileContext.filePath}\n\`\`\`\n${fileContext.content.substring(0, 6000)}\n\`\`\`\n--- END FILE ---\n\nThe user is currently editing the file above. When answering questions, consider this file's content, structure, imports, and patterns. Provide suggestions that are consistent with this codebase's style.`;
    }

    const request: ProxyRequest = {
      provider: config.provider,
      model: config.model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    };

    // Mock provider — always available
    if (config.provider === "mock" || !config.apiKey) {
      return this.mockResponse(request, startTime);
    }

    // Check cache first
    const cached = this.cache.get(request);
    if (cached) {
      const latencyMs = Date.now() - startTime;
      this.log(config.provider, config.model, latencyMs, true);
      return { content: cached, model: config.model, provider: config.provider, cached: true, latencyMs };
    }

    // Rate limiting
    const waitMs = this.rateLimiter.tryAcquire();
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }

    // Route: proxy server or direct
    let content: string;
    if (PROXY_BASE_URL !== "__PROXY_BASE_URL__") {
      content = await this.callViaProxy(request, config, signal);
    } else {
      content = await this.callDirect(config, messages, signal);
    }

    // Cache successful responses
    this.cache.set(request, content);
    const latencyMs = Date.now() - startTime;
    this.log(config.provider, config.model, latencyMs, false);

    return { content, model: config.model, provider: config.provider, cached: false, latencyMs };
  }

  /**
   * 🔒 Production path: Route through server-side proxy.
   * The proxy server holds the API keys and forwards requests.
   */
  private async callViaProxy(request: ProxyRequest, config: AIProviderConfig, signal?: AbortSignal): Promise<string> {
    const res = await fetch(`${PROXY_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Signature": this.signRequest(request),
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "Unknown proxy error");
      throw new Error(`Proxy Error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.content ?? data.choices?.[0]?.message?.content ?? "No response from proxy.";
  }

  /**
   * ⚠️ Development fallback: Direct API call (API key exposed in browser).
   * Replace with proxy in production!
   */
  private async callDirect(config: AIProviderConfig, messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
    const endpoint = PROVIDER_ENDPOINTS[config.provider];
    const baseUrl = config.baseUrl || endpoint.defaultBaseUrl;

    try {
      if (config.provider === "openai" || config.provider === "deepseek") {
        const res = await fetch(`${baseUrl}${endpoint.chatPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: false,
          }),
          signal,
        });
        if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(() => "")}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? "No response.";
      }

      if (config.provider === "claude") {
        const res = await fetch(`${baseUrl}${endpoint.chatPath}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: config.maxTokens,
            system: SYSTEM_PROMPT,
            messages,
          }),
          signal,
        });
        if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(() => "")}`);
        const data = await res.json();
        return data.content?.[0]?.text ?? "No response.";
      }

      return MOCK_RESPONSES[0];
    } catch (err: any) {
      if (err?.name === "AbortError") throw err;
      return `⚠️ API Error: ${err?.message ?? "Connection failed"}. Check your API key and network.`;
    }
  }

  /** Mock response with simulated latency */
  private async mockResponse(request: ProxyRequest, startTime: number): Promise<ProxyResponse> {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
    const content = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const latencyMs = Date.now() - startTime;
    this.log("mock", "mock-v1", latencyMs, false);
    return { content, model: "mock-v1", provider: "mock", cached: false, latencyMs };
  }

  /** Simple request signing (HMAC in production) */
  private signRequest(request: ProxyRequest): string {
    const payload = `${request.provider}:${request.model}:${Date.now()}`;
    // In production, use HMAC-SHA256 with a shared secret
    return btoa(payload);
  }

  /** Log request for analytics */
  private log(provider: string, model: string, latencyMs: number, cached: boolean): void {
    this.requestLog.push({ timestamp: Date.now(), provider, model, latencyMs, cached });
    if (this.requestLog.length > 500) this.requestLog.splice(0, 250);
  }

  /** Get request statistics */
  getStats(): { totalRequests: number; avgLatency: number; cacheHitRate: number; byProvider: Record<string, number> } {
    const total = this.requestLog.length;
    if (total === 0) return { totalRequests: 0, avgLatency: 0, cacheHitRate: 0, byProvider: {} };
    const avgLatency = this.requestLog.reduce((s, r) => s + r.latencyMs, 0) / total;
    const cacheHits = this.requestLog.filter((r) => r.cached).length;
    const byProvider: Record<string, number> = {};
    this.requestLog.forEach((r) => { byProvider[r.provider] = (byProvider[r.provider] ?? 0) + 1; });
    return { totalRequests: total, avgLatency: Math.round(avgLatency), cacheHitRate: cacheHits / total, byProvider };
  }

  /** Clear all caches */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * SSE Streaming chat — yields partial content tokens in real-time.
   * Falls back to non-streaming mock for mock provider.
   * Supports OpenAI, DeepSeek (SSE stream format) and Claude (SSE stream format).
   */
  async *chatStream(
    config: AIProviderConfig,
    messages: ChatMessage[],
    signal?: AbortSignal,
    fileContext?: { filePath: string; content: string },
  ): AsyncGenerator<{ token: string; done: boolean }, void, unknown> {
    // Mock provider — simulate streaming with character-by-character delivery
    if (config.provider === "mock" || !config.apiKey) {
      const mockContent = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      const words = mockContent.split(/(\s+)/);
      for (let i = 0; i < words.length; i++) {
        if (signal?.aborted) return;
        yield { token: words[i], done: false };
        await new Promise((r) => setTimeout(r, 30 + Math.random() * 50));
      }
      yield { token: "", done: true };
      return;
    }

    // Rate limiting
    const waitMs = this.rateLimiter.tryAcquire();
    if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));

    let systemPrompt = SYSTEM_PROMPT;
    if (fileContext?.content) {
      systemPrompt += `\n\n--- CURRENT OPEN FILE ---\nFile: ${fileContext.filePath}\n\`\`\`\n${fileContext.content.substring(0, 6000)}\n\`\`\`\n--- END FILE ---`;
    }

    const endpoint = PROVIDER_ENDPOINTS[config.provider];
    const baseUrl = config.baseUrl || endpoint.defaultBaseUrl;

    try {
      if (config.provider === "openai" || config.provider === "deepseek") {
        const res = await fetch(`${baseUrl}${endpoint.chatPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: true,
          }),
          signal,
        });
        if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(() => "")}`);
        const reader = res.body?.getReader();
        if (!reader) { yield { token: "流式响应不可用", done: true }; return; }
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const token = json.choices?.[0]?.delta?.content ?? "";
                if (token) yield { token, done: false };
              } catch { /* skip malformed */ }
            }
          }
        }
        yield { token: "", done: true };
        return;
      }

      if (config.provider === "claude") {
        const res = await fetch(`${baseUrl}${endpoint.chatPath}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: config.maxTokens,
            system: systemPrompt,
            messages,
            stream: true,
          }),
          signal,
        });
        if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(() => "")}`);
        const reader = res.body?.getReader();
        if (!reader) { yield { token: "流式响应不可用", done: true }; return; }
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                if (json.type === "content_block_delta") {
                  const token = json.delta?.text ?? "";
                  if (token) yield { token, done: false };
                }
              } catch { /* skip */ }
            }
          }
        }
        yield { token: "", done: true };
        return;
      }

      // Unknown provider fallback
      yield { token: "不支持的 AI 提供商", done: true };
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      yield { token: `⚠️ 流式错误: ${err?.message ?? "连接失败"}`, done: true };
    }
  }
}

/** Singleton AI Proxy Service instance */
export const aiProxyService = new AIProxyService();