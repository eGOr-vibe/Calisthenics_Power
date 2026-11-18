"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Send,
  Trash2,
  Sparkles,
  User,
  Bot,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { AthleteProfile, AIProviderId, Injury } from "@/lib/types";
import { getProvider } from "@/lib/ai-providers";
import { buildSystemPrompt, profileToContext } from "@/lib/ai-prompts";

// ====== Types ======

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// ====== Helpers ======

const PREFILL_KEY = "cp_ai_prefill";

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const PROVIDER_LABEL: Record<AIProviderId, string> = {
  zai: "Z.AI",
  webllm: "WebLLM",
  custom: "Custom",
};

// ====== Main component ======

export default function AIChatPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  // WebLLM загрузка модели (0..100). Если > 0, показываем прогресс-бар.
  const [loadProgress, setLoadProgress] = React.useState(0);
  const [loadStatusText, setLoadStatusText] = React.useState("");
  const hasSentRef = React.useRef(false);
  // Чтобы показать «готово» только один раз за сессию (первая загрузка WebLLM).
  const webllmReadyShownRef = React.useRef(false);
  // Флаг: в этом send-цикле WebLLM-движок реально загружался (был прогресс > 0).
  const webllmLoadHappenedRef = React.useRef(false);
  // Флаг: история чата загружена из БД (или попытка загрузки завершилась).
  // Используется, чтобы prefill не сработал раньше, чем подгрузится история.
  const [historyReady, setHistoryReady] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Load profile to determine provider
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      return (await res.json()) as AthleteProfile | null;
    },
  });

  // Load active injuries for system prompt context (for non-ZAI providers)
  const injuriesQuery = useQuery({
    queryKey: ["injuries"],
    queryFn: async () => {
      const res = await fetch("/api/injuries");
      if (!res.ok) return [] as Injury[];
      return (await res.json()) as Injury[];
    },
  });

  // Load chat history from DB (always fresh)
  const messagesQuery = useQuery({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const res = await fetch("/api/ai/messages?limit=100");
      if (!res.ok) throw new Error("failed to load history");
      return (await res.json()) as ChatMessageRow[];
    },
    staleTime: 0,
    retry: 1,
  });

  // Save single message (POST /api/ai/messages)
  const saveMessageMutation = useMutation({
    mutationFn: async ({
      role,
      content,
    }: {
      role: "user" | "assistant";
      content: string;
    }) => {
      const res = await fetch("/api/ai/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content }),
      });
      if (!res.ok) throw new Error("save failed");
      return (await res.json()) as ChatMessageRow;
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("ai.historyError"),
        variant: "destructive",
      });
    },
  });

  // Delete single message (DELETE /api/ai/messages/[id]) — для rollback.
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ai/messages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      return res.json();
    },
    // silent on error — rollback failure is not critical
  });

  // Clear all messages (DELETE /api/ai/messages)
  const clearMessagesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/messages", { method: "DELETE" });
      if (!res.ok) throw new Error("clear failed");
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      toast({ description: t("ai.historyCleared") });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("ai.historyError"),
        variant: "destructive",
      });
    },
  });

  const profile = profileQuery.data;
  const providerId: AIProviderId = profile?.aiProvider ?? "zai";
  const providerLabel = PROVIDER_LABEL[providerId] ?? providerId;
  const isWebLLM = providerId === "webllm";
  const isCustom = providerId === "custom";

  // Welcome message: ensure it's present at start (mount + locale change),
  // preserving any non-welcome messages already loaded.
  React.useEffect(() => {
    setMessages((prev) => {
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: t("ai.welcome"),
      };
      const rest = prev.filter((m) => m.id !== "welcome");
      return [welcomeMsg, ...rest];
    });
  }, [t]);

  // Sync messages from DB once on first successful load (or first failure).
  // After the initial sync, we never overwrite local state from the query —
  // optimistic updates + invalidate handle ongoing sync instead.
  React.useEffect(() => {
    if (historyReady) return;
    if (messagesQuery.isLoading) return;
    const dbMessages: ChatMessage[] = (messagesQuery.data ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }));
    setMessages([
      { id: "welcome", role: "assistant", content: t("ai.welcome") },
      ...dbMessages,
    ]);
    setHistoryReady(true);
  }, [messagesQuery.data, messagesQuery.isLoading, messagesQuery.isError, historyReady, t]);

  // Auto-scroll to bottom on messages change / thinking / loading
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, loadProgress]);

  // Auto-resize textarea
  const resizeTextarea = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 120); // ~3 lines max
    el.style.height = `${next}px`;
  }, []);

  React.useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // Pre-fill from sessionStorage (e.g. from technique/theory "ask AI" button).
  // Ждём загрузки профиля И истории чата — иначе send() не сможет выбрать
  // провайдера и/или потеряет контекст истории.
  React.useEffect(() => {
    if (hasSentRef.current) return;
    if (!profile) return;
    if (!historyReady) return;
    try {
      const prefill = sessionStorage.getItem(PREFILL_KEY);
      if (prefill && prefill.trim().length > 0) {
        sessionStorage.removeItem(PREFILL_KEY);
        hasSentRef.current = true;
        void send(prefill.trim());
      }
    } catch {
      // ignore
    }
    // send() intentionally omitted from deps — it's a stable closure over
    // local state and we want this effect to run only when profile/historyReady change.
  }, [profile, historyReady]);

  // ====== Send flow ======

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    if (!profile) {
      toast({
        title: t("common.error"),
        description: t("ai.error"),
        variant: "destructive",
      });
      return;
    }

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content: trimmed,
    };

    // Keep last 8 messages for context (excluding welcome)
    const history = [...messages, userMsg].filter((m) => m.id !== "welcome");
    const apiMessages = history.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);
    setLoadProgress(0);
    setLoadStatusText("");
    webllmLoadHappenedRef.current = false;

    let savedUserId: string | null = null;

    try {
      // 1. Save user message to DB (failure does NOT block the send flow).
      try {
        const saved = await saveMessageMutation.mutateAsync({
          role: "user",
          content: trimmed,
        });
        savedUserId = saved.id;
      } catch {
        // toast already shown via mutation onError — continue.
      }

      const provider = getProvider(profile);

      // WebLLM availability check (WebGPU)
      if (provider.id === "webllm") {
        const ok = await provider.available();
        if (!ok) {
          toast({
            title: t("common.error"),
            description: t("ai.webllm.notSupported"),
            variant: "destructive",
          });
          // Rollback saved user message + remove optimistic bubble.
          if (savedUserId) {
            await deleteMessageMutation
              .mutateAsync(savedUserId)
              .catch(() => undefined);
          }
          setInput(trimmed);
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          return;
        }
        setLoadStatusText(t("ai.webllm.loading"));
      }

      // Build system prompt with profile context (injuries included for non-ZAI providers)
      const activeInjuries = (injuriesQuery.data ?? [])
        .filter((i) => i.active)
        .map((i) => ({ bodyPart: i.bodyPart, type: i.type }));
      const profileContext = profileToContext(profile, locale, activeInjuries);
      const systemPrompt = buildSystemPrompt(locale, profileContext);

      // 2. Get response from provider
      const result = await provider.chat({
        messages: apiMessages,
        systemPrompt,
        locale,
        // Для WebLLM: имя модели из профиля (например "Llama-3.2-1B-Instruct-q4f32_1-MLC").
        modelId: profile.aiModel ?? undefined,
        onLoadProgress: (p, text) => {
          const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
          if (pct > 0) webllmLoadHappenedRef.current = true;
          setLoadProgress(pct);
          if (text) {
            setLoadStatusText(text);
          } else {
            setLoadStatusText(t("ai.webllm.progress", { pct }));
          }
        },
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const content = result.content?.trim() || "—";
      const assistantMsg: ChatMessage = {
        id: genId(),
        role: "assistant",
        content,
      };

      // 3. Save assistant message to DB (failure does NOT block UI).
      try {
        await saveMessageMutation.mutateAsync({ role: "assistant", content });
      } catch {
        // toast already shown via mutation onError — continue.
      }

      // 4. Optimistic assistant add
      setMessages((prev) => [...prev, assistantMsg]);

      // 5. Invalidate to refresh server-side cache (refetch will return
      // both user + assistant messages saved in steps 1 & 3).
      void queryClient.invalidateQueries({ queryKey: ["chat-messages"] });

      // WebLLM: показать «готово» один раз, если в этом цикле была загрузка
      // модели (первый запуск — кэш пустой, движок инициализируется).
      if (
        provider.id === "webllm" &&
        webllmLoadHappenedRef.current &&
        !webllmReadyShownRef.current
      ) {
        webllmReadyShownRef.current = true;
        setLoadProgress(100);
        toast({ description: t("ai.webllm.ready") });
      }
    } catch (e: any) {
      let description = e?.message ?? t("ai.error");
      // For custom provider, add CORS hint on connection failure
      if (isCustom) {
        const lower = description.toLowerCase();
        if (
          lower.includes("failed to connect") ||
          lower.includes("не удалось подключиться") ||
          lower.includes("failed to fetch") ||
          lower.includes("networkerror")
        ) {
          description = `${description}\n${t("ai.custom.corsHint")}`;
        }
      }
      // Rollback: remove saved user message from DB if it was persisted.
      if (savedUserId) {
        await deleteMessageMutation
          .mutateAsync(savedUserId)
          .catch(() => undefined);
      }
      toast({
        title: t("common.error"),
        description,
        variant: "destructive",
      });
      // Restore the user's text in input so they can retry
      setInput(trimmed);
      // Remove the just-added user message so we don't duplicate on retry
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsThinking(false);
      // Keep progress at 100 briefly, then reset (only for WebLLM)
      if (isWebLLM) {
        window.setTimeout(() => {
          setLoadProgress(0);
          setLoadStatusText("");
        }, 800);
      } else {
        setLoadProgress(0);
        setLoadStatusText("");
      }
    }
  }

  function handleSend() {
    if (!input.trim() || isThinking) return;
    void send(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter to send, Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClear() {
    if (messages.length <= 1 && !isThinking) {
      // Only welcome — just reset input
      setInput("");
      return;
    }
    // Confirm clear
    if (!window.confirm(t("ai.clearConfirm"))) return;
    // Reset local state immediately (UI feedback)
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t("ai.welcome"),
      },
    ]);
    setInput("");
    // Delete all messages from DB (async, fires toast on success/failure)
    void clearMessagesMutation.mutateAsync().catch(() => undefined);
  }

  const canSend = input.trim().length > 0 && !isThinking;

  // Show progress bar only for WebLLM while loading (and a little after completion)
  const showProgressBar = isWebLLM && isThinking && loadProgress > 0;
  // For WebLLM, first-run hint when not yet loaded
  const showFirstLoadHint = isWebLLM && !isThinking && loadProgress === 0;

  return (
    <MobileShell>
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border safe-top">
        <div className="flex items-center gap-2 px-2 py-2">
          <Link href="/knowledge" aria-label={t("common.back")}>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">
              {t("ai.title")}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {profileQuery.isLoading ? (
                <Skeleton className="h-3 w-16" />
              ) : (
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase tracking-wide"
                >
                  {providerLabel}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label={t("ai.clear")}
            disabled={isThinking || clearMessagesMutation.isPending}
            className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Chat scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ maxHeight: "60vh", minHeight: "200px" }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isThinking && (
          <ThinkingBubble
            providerLabel={providerLabel}
            loadProgress={loadProgress}
            loadStatusText={loadStatusText}
          />
        )}
      </div>

      {/* WebLLM first-load hint */}
      {showFirstLoadHint && (
        <div className="px-4 pb-1 text-[11px] text-muted-foreground leading-snug">
          {t("ai.webllm.firstLoad")}
        </div>
      )}

      {/* WebLLM progress bar (thin, primary color) */}
      {showProgressBar && (
        <div className="px-4 pb-1.5 space-y-1">
          <Progress value={loadProgress} className="h-1.5" />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">
              {loadStatusText || t("ai.webllm.loading")}
            </span>
            <span className="tabular-nums shrink-0 ml-2">
              {loadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Sticky input bar */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border safe-bottom">
        <div className="px-3 py-2.5 flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("ai.placeholder")}
              rows={1}
              disabled={isThinking}
              className="min-h-[44px] max-h-[120px] resize-none py-2.5 text-[15px] leading-snug"
              aria-label={t("ai.placeholder")}
            />
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            aria-label={t("ai.send")}
            className="h-11 w-11 shrink-0 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function MessageBubble({ message }: { message: ChatMessage }) {
  const { t } = useI18n();
  const isUser = message.role === "user";
  const isWelcome = message.id === "welcome";

  return (
    <div
      className={cn(
        "flex gap-2 items-end",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-amber-500/15 text-amber-500",
        )}
        aria-hidden
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "min-w-0 max-w-[80%] rounded-2xl px-3.5 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : isWelcome
              ? "bg-muted text-foreground rounded-bl-md border border-border"
              : "bg-card text-card-foreground rounded-bl-md border border-border",
        )}
      >
        {!isUser && !isWelcome && (
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {t("ai.assistant")}
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}

function ThinkingBubble({
  providerLabel,
  loadProgress,
  loadStatusText,
}: {
  providerLabel: string;
  loadProgress: number;
  loadStatusText: string;
}) {
  const { t } = useI18n();
  // For WebLLM, if loading model — show progress text instead of generic "thinking"
  const isWebLLMLoading = loadProgress > 0 && loadProgress < 100;
  return (
    <div className="flex gap-2 items-end">
      <div className="h-8 w-8 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-card text-card-foreground rounded-2xl rounded-bl-md border border-border px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            {isWebLLMLoading
              ? (loadStatusText || t("ai.webllm.loading"))
              : `${t("ai.thinking")} · ${providerLabel}`}
          </span>
        </div>
      </div>
    </div>
  );
}
