import { Bot, Copy, Mic, Paperclip, RotateCcw, Send, Settings2, Sparkles, User } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useAIModel } from "./ai-model-context";
import { useThemeColors } from "./hooks/use-theme-colors";
import { useI18n } from "./i18n-context";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatInterfaceProps {
  compact?: boolean;
}

/**
 * AI chat interface component.
 * Supports multi-provider LLM integration (OpenAI, Ollama, custom endpoints),
 * streaming responses, message history, copy-to-clipboard, and retry functionality.
 *
 * @param compact - When true, renders in a smaller layout suitable for widget mode.
 */
export function ChatInterface({ compact = false }: ChatInterfaceProps) {
  const { aiModels, activeModelId, openModelSettings } = useAIModel();
  const { t } = useI18n();
  const tc = useThemeColors();

  const [messages, setMessages] = useState<Message[]>(() => [{
    id: "welcome",
    role: "ai",
    content: t("chat.aiGreeting") || "您好！我是 YYC³ 便携式智能 AI 系统。我可以帮助您进行智能分析、任务执行、工作流编排等操作。请问有什么可以为您效劳的？",
    timestamp: new Date(Date.now() - 300000),
  }]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get active model config
  const activeModel = activeModelId ? aiModels.find(m => m.id === activeModelId) : null;

  // Real API call to the configured model
  const callLLM = useCallback(async (userContent: string): Promise<string> => {
    if (!activeModel) {
      return t("chat.modelNotConfigured");
    }

    const { endpoint, apiKey, name: modelName, provider } = activeModel;

    try {
      let resp: Response;

      if (provider === "ollama") {
        const ollamaBase = endpoint.replace(/\/+$/, "");
        const chatUrl = ollamaBase.includes("/api/chat") ? ollamaBase : ollamaBase.replace(/\/api\/.*$/, "") + "/api/chat";
        resp = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: userContent }],
            stream: false,
          }),
        });
      } else if (endpoint.includes("anthropic.com")) {
        resp = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 2048,
            messages: [{ role: "user", content: userContent }],
          }),
        });
      } else {
        // OpenAI-compatible (OpenAI, Zhipu, Qwen, DeepSeek, etc.)
        resp = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: userContent }],
            stream: false,
            max_tokens: 2048,
            temperature: 0.7,
          }),
        });
      }

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        let detail = "";
        try {
          const j = JSON.parse(errText);
          detail = j.error?.message || j.message || errText.slice(0, 300);
        } catch { detail = errText.slice(0, 300); }
        return t("chat.apiError", { msg: `HTTP ${resp.status} — ${detail}` });
      }

      const data = await resp.json().catch(() => null);

      if (provider === "ollama") {
        return data?.message?.content || data?.response || t("chat.fallbackReply");
      } else if (endpoint.includes("anthropic.com")) {
        return data?.content?.[0]?.text || t("chat.fallbackReply");
      } else {
        return data?.choices?.[0]?.message?.content || data?.result || t("chat.fallbackReply");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        return t("chat.apiError", { msg: t("chat.networkError") });
      }
      return t("chat.apiError", { msg: msg.slice(0, 200) });
    }
  }, [activeModel, t]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsThinking(true);

    // Call real API or fallback
    const reply = await callLLM(userInput);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: reply,
      timestamp: new Date(),
      isError: reply.startsWith(t("chat.apiError", { msg: "" }).split(":")[0]),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);
  }, [input, callLLM, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  const handleRetry = useCallback(async (msgId: string) => {
    // Find the user message before this AI message and retry
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx <= 0) return;
    const userMsg = messages.slice(0, idx).reverse().find(m => m.role === "user");
    if (!userMsg) return;

    setIsThinking(true);
    // Remove the old AI response
    setMessages(prev => prev.filter(m => m.id !== msgId));

    const reply = await callLLM(userMsg.content);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: reply,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);
  }, [messages, callLLM]);

  return (
    <div className="flex flex-col h-full">
      {/* Model indicator bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: tc.alpha(tc.primary, 0.1) }}>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${activeModel ? "bg-emerald-400" : "bg-white/15"}`}
            style={activeModel ? { boxShadow: `0 0 4px ${tc.success}` } : {}}
          />
          <span className="text-[10px] text-white/30">
            {activeModel ? `${activeModel.name} · ${activeModel.provider}` : t("chat.modelNotConfigured")}
          </span>
        </div>
        <button
          onClick={openModelSettings}
          className="p-1 rounded-lg hover:bg-white/5 transition-colors group"
          title={t("header.aiModel")}
        >
          <Settings2 className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            style={{
              animation: `bubble-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.05}s both`,
            }}
          >
            {/* Avatar */}
            <div
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                background: tc.alpha(msg.role === "ai" ? tc.primary : tc.secondary, 0.1),
                borderColor: tc.alpha(msg.role === "ai" ? tc.primary : tc.secondary, 0.4),
                boxShadow: `0 0 10px ${tc.alpha(msg.role === "ai" ? tc.primary : tc.secondary, 0.3)}`,
              }}
            >
              {msg.role === "ai" ? (
                <Bot className="w-4 h-4" style={{ color: tc.primary }} />
              ) : (
                <User className="w-4 h-4" style={{ color: tc.secondary }} />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`relative max-w-[75%] rounded-2xl px-4 py-3 ${compact ? "max-w-[85%]" : ""}`}
              style={{
                background: msg.role === "ai" ? tc.alpha(tc.bgBase, 0.8) : tc.alpha(tc.secondary, 0.1),
                border: `1px solid ${msg.isError ? tc.alpha(tc.danger, 0.3) : tc.alpha(msg.role === "ai" ? tc.primary : tc.secondary, 0.2)}`,
                backdropFilter: "blur(10px)",
                boxShadow: msg.role === "ai"
                  ? msg.isError
                    ? `0 0 15px ${tc.alpha(tc.muted, 0.1)}`
                    : `0 0 15px ${tc.alpha(tc.primary, 0.1)}, inset 0 0 15px ${tc.alpha(tc.primary, 0.03)}`
                  : `0 0 15px ${tc.alpha(tc.secondary, 0.1)}, inset 0 0 15px ${tc.alpha(tc.secondary, 0.03)}`,
              }}
            >
              <p 
                className="text-sm leading-relaxed whitespace-pre-wrap" 
                style={{ color: msg.isError ? tc.alpha(tc.danger, 0.8) : tc.textPrimary }}
              >
                {msg.content}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: tc.borderSubtle }}>
                <span className="text-[10px]" style={{ color: tc.textMuted }}>
                  {msg.timestamp.toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.role === "ai" && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(msg.content)}
                      className="p-1 rounded hover:bg-white/10 transition-colors group"
                      title={t("chat.copy")}
                    >
                      <Copy className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
                    </button>
                    <button
                      onClick={() => handleRetry(msg.id)}
                      className="p-1 rounded hover:bg-white/10 transition-colors group"
                      title={t("chat.retry")}
                    >
                      <RotateCcw className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-3" style={{ animation: "bubble-in 0.4s var(--spring-easing) both" }}>
            <div
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                background: tc.alpha(tc.primary, 0.1),
                borderColor: tc.alpha(tc.primary, 0.4),
                boxShadow: `0 0 10px ${tc.alpha(tc.primary, 0.3)}`,
              }}
            >
              <Bot className="w-4 h-4" style={{ color: tc.primary }} />
            </div>
            <div
              className="rounded-2xl px-5 py-4 border"
              style={{
                background: tc.alpha(tc.bgBase, 0.8),
                borderColor: tc.alpha(tc.primary, 0.2),
                backdropFilter: "blur(10px)",
                boxShadow: `0 0 15px ${tc.alpha(tc.primary, 0.1)}`,
              }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: tc.primary,
                      animation: `thinking-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
                <span className="ml-2 text-xs" style={{ color: tc.alpha(tc.primary, 0.6) }}>{t("chat.aiThinking")}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t" style={{ borderColor: tc.alpha(tc.primary, 0.1) }}>
        <div
          className="relative flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all duration-300"
          style={{
            background: tc.alpha(tc.bgBase, 0.6),
            borderColor: tc.alpha(tc.primary, 0.2),
            backdropFilter: "blur(10px)",
            transition: "all 0.3s var(--spring-easing)",
          }}
        >
          <button className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors group">
            <Paperclip className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.inputCmd")}
            rows={1}
            className="flex-1 bg-transparent text-white/90 text-sm resize-none outline-none placeholder:text-white/20 max-h-24"
            style={{ scrollbarWidth: "none" }}
          />
          <button className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors group">
            <Mic className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="shrink-0 p-2 rounded-xl transition-all duration-300 disabled:opacity-30"
            style={{
              background: input.trim()
                ? tc.gradientPrimary
                : "rgba(255,255,255,0.05)",
              boxShadow: input.trim()
                ? tc.shadowGlow
                : "none",
            }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Sparkles className="w-3 h-3" style={{ color: tc.alpha(tc.accent, 0.4) }} />
          <span className="text-[10px] text-white/20">{t("chat.poweredBy")}</span>
        </div>
      </div>
    </div>
  );
}