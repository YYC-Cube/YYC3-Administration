/**
 * @file edge-proxy-server.ts
 * @description YYC³ Edge Function AI Proxy Server — Production-ready server-side
 *   proxy for AI API calls. Deploy as Vercel Edge Function, Cloudflare Worker,
 *   or Node.js/Express middleware. API keys are stored server-side and NEVER
 *   exposed to the browser.
 *
 * DEPLOYMENT:
 *   1. Copy this file to your backend project (e.g., /api/ai-proxy/chat.ts)
 *   2. Set environment variables: OPENAI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_API_KEY
 *   3. Update PROXY_BASE_URL in ai-proxy-service.ts to point to your deployed endpoint
 *
 * EXAMPLE (Vercel Edge Function):
 *   - File: /api/ai-proxy/chat.ts
 *   - URL:  https://your-app.vercel.app/api/ai-proxy/chat
 *   - Then set PROXY_BASE_URL = "https://your-app.vercel.app/api/ai-proxy"
 *
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,backend,proxy,edge-function,security
 */

// =====================================================================
// NOTE: This file is a DESIGN REFERENCE for server-side deployment.
// It does NOT run in the browser. Copy to your backend infrastructure.
// =====================================================================

// ==========================================
// Types (shared with ai-proxy-service.ts)
// ==========================================

interface ProxyRequest {
  provider: 'openai' | 'claude' | 'deepseek'
  model: string
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  temperature: number
  maxTokens: number
}

interface ProxyResponse {
  content: string
  model: string
  provider: string
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
}

// ==========================================
// Server-side Rate Limiter (per-IP)
// ==========================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = { maxRequests: 60, windowMs: 60000 } // 60 req/min

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(clientIP)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return true
  }
  if (entry.count >= RATE_LIMIT.maxRequests) return false
  entry.count++
  return true
}

// ==========================================
// Request Validation
// ==========================================

function validateRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
): { valid: true; request: ProxyRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }
  if (!['openai', 'claude', 'deepseek'].includes(body.provider)) {
    return { valid: false, error: `Unsupported provider: ${body.provider}` }
  }
  if (!body.model || typeof body.model !== 'string') {
    return { valid: false, error: 'Missing model' }
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { valid: false, error: 'Missing messages' }
  }
  if (body.messages.length > 50) {
    return { valid: false, error: 'Too many messages (max 50)' }
  }
  // Limit total content length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalLength = body.messages.reduce((s: number, m: any) => s + (m.content?.length ?? 0), 0)
  if (totalLength > 100000) {
    return { valid: false, error: 'Message content too long (max 100k chars)' }
  }
  return {
    valid: true,
    request: {
      provider: body.provider,
      model: body.model,
      messages: body.messages,
      temperature: Math.min(2, Math.max(0, body.temperature ?? 0.7)),
      maxTokens: Math.min(16384, Math.max(1, body.maxTokens ?? 4096)),
    },
  }
}

// ==========================================
// AI Provider Routing
// ==========================================

async function callOpenAI(request: ProxyRequest, apiKey: string): Promise<ProxyResponse> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model,
    provider: 'openai',
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  }
}

async function callClaude(request: ProxyRequest, apiKey: string): Promise<ProxyResponse> {
  const systemMessage = request.messages.find((m) => m.role === 'system')
  const chatMessages = request.messages.filter((m) => m.role !== 'system')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: request.model,
      max_tokens: request.maxTokens,
      system: systemMessage?.content ?? '',
      messages: chatMessages,
    }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return {
    content: data.content?.[0]?.text ?? '',
    model: data.model,
    provider: 'claude',
    usage: data.usage
      ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        }
      : undefined,
  }
}

async function callDeepSeek(request: ProxyRequest, apiKey: string): Promise<ProxyResponse> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    }),
  })
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model,
    provider: 'deepseek',
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  }
}

// ==========================================
// Main Handler (Vercel Edge Function Format)
// ==========================================

/**
 * Production Edge Function handler.
 *
 * Deploy instructions:
 *
 * 1. VERCEL: Create file `/api/ai-proxy/chat.ts` with:
 *    ```ts
 *    export { handler as POST } from './edge-proxy-server';
 *    export const config = { runtime: 'edge' };
 *    ```
 *
 * 2. CLOUDFLARE WORKERS: Use `addEventListener('fetch', ...)` pattern
 *
 * 3. NODE.JS/EXPRESS:
 *    ```ts
 *    app.post('/api/ai-proxy/chat', async (req, res) => {
 *      const result = await handler(req);
 *      res.status(result.status).json(await result.json());
 *    });
 *    ```
 *
 * Required environment variables:
 *   - OPENAI_API_KEY
 *   - ANTHROPIC_API_KEY
 *   - DEEPSEEK_API_KEY
 *   - PROXY_SHARED_SECRET (optional, for request signature verification)
 */
export async function handler(request: Request): Promise<Response> {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // In production, restrict to your domain
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-Signature',
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Rate limiting
  const clientIP =
    request.headers.get('x-forwarded-for') ?? request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
    })
  }

  try {
    const body = await request.json()
    const validation = validateRequest(body)
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { request: proxyReq } = validation

    // Get API key from environment (NEVER from client)
    const apiKeyMap: Record<string, string | undefined> = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openai: (globalThis as any).process?.env?.OPENAI_API_KEY,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      claude: (globalThis as any).process?.env?.ANTHROPIC_API_KEY,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deepseek: (globalThis as any).process?.env?.DEEPSEEK_API_KEY,
    }

    const apiKey = apiKeyMap[proxyReq.provider]
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key not configured for provider: ${proxyReq.provider}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Route to provider
    let result: ProxyResponse
    switch (proxyReq.provider) {
      case 'openai':
        result = await callOpenAI(proxyReq, apiKey)
        break
      case 'claude':
        result = await callClaude(proxyReq, apiKey)
        break
      case 'deepseek':
        result = await callDeepSeek(proxyReq, apiKey)
        break
      default:
        return new Response(JSON.stringify({ error: 'Unknown provider' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Log for monitoring (use your preferred logging service)
    // eslint-disable-next-line no-console
    console.log(
      `[YYC³ AI Proxy] ${proxyReq.provider}/${proxyReq.model} - ${result.usage?.totalTokens ?? '?'} tokens - IP: ${clientIP.substring(0, 8)}***`,
    )

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error'
    console.error(`[YYC³ AI Proxy] Error:`, errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}
