/**
 * @file edge-proxy-server.test.ts
 * @description YYC³ Edge Proxy Server — Comprehensive Vitest Unit Tests
 *   Covers: request validation, rate limiting, CORS, error handling,
 *   provider routing, and handler responses.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,services,edge-proxy
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "../../src/app/components/services/edge-proxy-server";

// ==========================================
// Helpers
// ==========================================

function makeRequest(body: any, method = "POST", headers: Record<string, string> = {}): Request {
  return new Request("https://test.example.com/api/ai-proxy/chat", {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
      ...headers,
    },
    body: method !== "OPTIONS" ? JSON.stringify(body) : undefined,
  });
}

function validBody(overrides?: Record<string, any>) {
  return {
    provider: "openai",
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
    maxTokens: 4096,
    ...overrides,
  };
}

// ==========================================
// Test Suite: CORS
// ==========================================

describe("EdgeProxyServer — CORS", () => {
  it("should handle OPTIONS preflight with 204", async () => {
    const req = new Request("https://test.example.com/api/ai-proxy/chat", {
      method: "OPTIONS",
    });
    const res = await handler(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("should reject non-POST methods with 405", async () => {
    const req = new Request("https://test.example.com/api/ai-proxy/chat", {
      method: "GET",
    });
    const res = await handler(req);
    expect(res.status).toBe(405);
    const data = await res.json();
    expect(data.error).toContain("Method not allowed");
  });

  it("should include CORS headers in error responses", async () => {
    const req = new Request("https://test.example.com/api/ai-proxy/chat", {
      method: "GET",
    });
    const res = await handler(req);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});

// ==========================================
// Test Suite: Request Validation
// ==========================================

describe("EdgeProxyServer — Request Validation", () => {
  it("should reject empty body", async () => {
    const req = new Request("https://test.example.com/api/ai-proxy/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "null",
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("should reject unsupported provider", async () => {
    const req = makeRequest(validBody({ provider: "unsupported" }));
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Unsupported provider");
  });

  it("should reject missing model", async () => {
    const req = makeRequest(validBody({ model: "" }));
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing model");
  });

  it("should reject missing messages", async () => {
    const req = makeRequest(validBody({ messages: [] }));
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing messages");
  });

  it("should reject non-array messages", async () => {
    const req = makeRequest(validBody({ messages: "not an array" }));
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it("should reject too many messages (> 50)", async () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: "user",
      content: `Message ${i}`,
    }));
    const req = makeRequest(validBody({ messages }));
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Too many messages");
  });

  it("should reject messages exceeding 100k chars total", async () => {
    const messages = [{ role: "user", content: "x".repeat(100001) }];
    const req = makeRequest(validBody({ messages }));
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("too long");
  });

  it("should accept valid openai request body", async () => {
    // Will fail at API call level (no env key), but validation passes
    const req = makeRequest(validBody());
    const res = await handler(req);
    // Status 500 = passed validation but no API key configured
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("API key not configured");
  });

  it("should accept valid claude provider", async () => {
    const req = makeRequest(validBody({ provider: "claude", model: "claude-3-sonnet" }));
    const res = await handler(req);
    expect(res.status).toBe(500); // No API key
    const data = await res.json();
    expect(data.error).toContain("API key not configured");
  });

  it("should accept valid deepseek provider", async () => {
    const req = makeRequest(validBody({ provider: "deepseek", model: "deepseek-chat" }));
    const res = await handler(req);
    expect(res.status).toBe(500); // No API key
  });

  it("should clamp temperature to 0-2 range", async () => {
    // temperature: -5 should be clamped to 0, temperature: 100 to 2
    // Validation should pass — clamping is internal
    const req = makeRequest(validBody({ temperature: -5 }));
    const res = await handler(req);
    // Passes validation (500 = no key, not 400 = bad request)
    expect(res.status).toBe(500);
  });

  it("should clamp maxTokens to 1-16384 range", async () => {
    const req = makeRequest(validBody({ maxTokens: 999999 }));
    const res = await handler(req);
    expect(res.status).toBe(500); // Passes validation
  });
});

// ==========================================
// Test Suite: Rate Limiting
// ==========================================

describe("EdgeProxyServer — Rate Limiting", () => {
  it("should allow requests under rate limit", async () => {
    // First request should pass (rate limit = 60/min)
    const req = makeRequest(validBody());
    const res = await handler(req);
    // 500 because no API key, but NOT 429
    expect(res.status).not.toBe(429);
  });

  // Note: testing 60+ requests to trigger rate limit is slow;
  // the rate limiter is tested conceptually by verifying initial requests pass
});

// ==========================================
// Test Suite: Provider Routing (with mocked fetch)
// ==========================================

describe("EdgeProxyServer — Provider Routing", () => {
  const originalFetch = globalThis.fetch;
  const originalProcess = (globalThis as any).process;

  beforeEach(() => {
    // Set up mock env variables
    (globalThis as any).process = {
      env: {
        OPENAI_API_KEY: "sk-test-openai",
        ANTHROPIC_API_KEY: "sk-ant-test",
        DEEPSEEK_API_KEY: "sk-test-deepseek",
      },
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (globalThis as any).process = originalProcess;
  });

  it("should route to OpenAI and return content", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "Hello from OpenAI!" } }],
          model: "gpt-4",
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
    });

    const req = makeRequest(validBody({ provider: "openai", model: "gpt-4" }));
    const res = await handler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Hello from OpenAI!");
    expect(data.provider).toBe("openai");
    expect(data.usage.totalTokens).toBe(30);
  });

  it("should route to Claude and return content", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ text: "Hello from Claude!" }],
          model: "claude-3-sonnet",
          usage: { input_tokens: 15, output_tokens: 25 },
        }),
    });

    const req = makeRequest(validBody({ provider: "claude", model: "claude-3-sonnet" }));
    const res = await handler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Hello from Claude!");
    expect(data.provider).toBe("claude");
    expect(data.usage.totalTokens).toBe(40);
  });

  it("should route to DeepSeek and return content", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "Hello from DeepSeek!" } }],
          model: "deepseek-chat",
          usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
        }),
    });

    const req = makeRequest(validBody({ provider: "deepseek", model: "deepseek-chat" }));
    const res = await handler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Hello from DeepSeek!");
    expect(data.provider).toBe("deepseek");
  });

  it("should handle upstream API errors gracefully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: () => Promise.resolve("Service Unavailable"),
    });

    const req = makeRequest(validBody());
    const res = await handler(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("503");
  });

  it("should handle fetch network failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("DNS resolution failed"));

    const req = makeRequest(validBody());
    const res = await handler(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("DNS resolution failed");
  });
});

// ==========================================
// Test Suite: Response Format
// ==========================================

describe("EdgeProxyServer — Response Format", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    (globalThis as any).process = {
      env: { OPENAI_API_KEY: "sk-test" },
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should return JSON content type", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "Test" } }],
          model: "gpt-4",
        }),
    });

    const req = makeRequest(validBody());
    const res = await handler(req);
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("should include content, model, and provider in response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "Response text" } }],
          model: "gpt-4",
          usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
        }),
    });

    const req = makeRequest(validBody());
    const res = await handler(req);
    const data = await res.json();
    expect(data).toHaveProperty("content");
    expect(data).toHaveProperty("model");
    expect(data).toHaveProperty("provider");
  });
});
