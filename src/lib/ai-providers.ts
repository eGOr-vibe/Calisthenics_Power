// Абстракция AI-провайдеров для Calisthenics Power.
// Три реализации:
//   1. ZAIProvider        — через backend endpoint /api/ai/chat (Z.AI cloud)
//   2. CustomURLProvider   — прямые запросы на OpenAI-совместимый URL (Ollama, llama.cpp, LM Studio)
//   3. WebLLMProvider      — через WebGPU в браузере (@mlc-ai/web-llm, dynamic import)
//
// Все провайдеры реализуют один интерфейс AIProvider — чат-страница работает с любым через getProvider(profile).

import type { Locale } from "./types";

// ====== Types ======

export interface AIProviderChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIProviderChatOptions {
  messages: AIProviderChatMessage[];
  systemPrompt: string;
  locale: Locale;
  /** Streaming-токены (если провайдер поддерживает). Сейчас ни один не стримит. */
  onProgress?: (text: string) => void;
  /** Прогресс загрузки модели (только WebLLM, 0..1). */
  onLoadProgress?: (progress: number, text?: string) => void;
  /** Override модели для WebLLM (если не указано — WEBLLM_DEFAULT_MODEL). */
  modelId?: string;
}

export interface AIProviderChatResult {
  content: string;
  error?: string;
}

export interface AIProvider {
  id: "zai" | "webllm" | "custom";
  name: string;
  available(): Promise<boolean>;
  chat(options: AIProviderChatOptions): Promise<AIProviderChatResult>;
}

// ====== Z.AI provider ======
// Делегирует на backend-эндпоинт /api/ai/chat (через z-ai-web-dev-sdk).
// Системный промпт с профилем формируется на сервере из БД.

export class ZAIProvider implements AIProvider {
  id = "zai" as const;
  name = "Z.AI Cloud";

  async available(): Promise<boolean> {
    return true;
  }

  async chat(options: AIProviderChatOptions): Promise<AIProviderChatResult> {
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: options.messages,
          locale: options.locale,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({} as any));
        const errMessage =
          errBody?.content ??
          errBody?.message ??
          (options.locale === "ru"
            ? "Не удалось получить ответ от Z.AI."
            : "Failed to get response from Z.AI.");
        return { content: "", error: errMessage };
      }

      const data = (await res.json()) as { content?: string };
      return { content: data.content?.trim() ?? "" };
    } catch (e: any) {
      return {
        content: "",
        error:
          options.locale === "ru"
            ? `Сеть: ${e?.message ?? "unknown error"}`
            : `Network: ${e?.message ?? "unknown error"}`,
      };
    }
  }
}

// ====== Custom URL provider ======
// OpenAI-совместимый API (Ollama, llama.cpp, LM Studio, vLLM, etc.).
// Запросы идут напрямую из браузера на {url}/chat/completions.

export class CustomURLProvider implements AIProvider {
  id = "custom" as const;
  name = "Custom URL";

  constructor(
    private readonly url: string,
    private readonly model: string
  ) {}

  async available(): Promise<boolean> {
    try {
      // Ollama и большинство OpenAI-совместимых серверов отдают /v1/models.
      // Не все серверы поддерживают GET /models, но это всего лишь проба.
      const modelsUrl = this.url.endsWith("/v1")
        ? `${this.url}/models`
        : this.url.endsWith("/")
          ? `${this.url}models`
          : `${this.url}/models`;
      const res = await fetch(modelsUrl, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  }

  async chat(options: AIProviderChatOptions): Promise<AIProviderChatResult> {
    try {
      const base = this.url.replace(/\/$/, "");
      const endpoint = `${base}/chat/completions`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model || "llama3.2",
          messages: [
            { role: "system", content: options.systemPrompt },
            ...options.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 1024,
          stream: false,
        }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          detail = await res.text();
        } catch {
          // ignore
        }
        return {
          content: "",
          error: `HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        };
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      if (!content) {
        return {
          content: "",
          error:
            options.locale === "ru"
              ? "Пустой ответ от локальной модели."
              : "Empty response from local model.",
        };
      }
      return { content: String(content).trim() };
    } catch (e: any) {
      return {
        content: "",
        error:
          options.locale === "ru"
            ? `Не удалось подключиться к ${this.url}. Проверь, что локальная модель запущена.`
            : `Failed to connect to ${this.url}. Make sure local model is running.`,
      };
    }
  }
}

// ====== WebLLM provider ======
// Запускает LLM прямо в браузере через WebGPU. Использует @mlc-ai/web-llm
// через динамический import — чтобы не падать, если пакет не установлен или
// WebGPU недоступен. Модель кэшируется в IndexedDB после первой загрузки.

export const WEBLLM_DEFAULT_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

export class WebLLMProvider implements AIProvider {
  id = "webllm" as const;
  name = "WebLLM (browser)";

  private engine: any = null;
  private initPromise: Promise<any> | null = null;
  private initError: string | null = null;

  /** Проверяет доступность WebGPU и пакета @mlc-ai/web-llm. */
  async available(): Promise<boolean> {
    if (typeof navigator === "undefined") return false;
    // @ts-ignore — navigator.gpu есть в современных браузерах, но не в типах TS
    if (!("gpu" in navigator)) return false;
    try {
      await import("@mlc-ai/web-llm");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Лениво создаёт WebLLM engine. Повторные вызовы возвращают тот же инстанс.
   * onProgress — обратный вызов прогресса загрузки (0..1).
   */
  private getEngine(
    modelId: string,
    onProgress?: (progress: number, text?: string) => void
  ): Promise<any> {
    if (this.engine) return Promise.resolve(this.engine);
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const webllm: any = await import("@mlc-ai/web-llm");
      this.engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (info: any) => {
          if (onProgress && typeof info?.progress === "number") {
            onProgress(info.progress, info?.text);
          }
        },
      });
      return this.engine;
    })();

    // Если инициализация упадёт — сбросим initPromise, чтобы можно было ретраить.
    this.initPromise.catch((err) => {
      this.initError = err?.message ?? "init failed";
      this.initPromise = null;
    });

    return this.initPromise;
  }

  async chat(options: AIProviderChatOptions): Promise<AIProviderChatResult> {
    try {
      // Проверка WebGPU.
      if (typeof navigator === "undefined" || !("gpu" in navigator)) {
        return {
          content: "",
          error:
            options.locale === "ru"
              ? "WebGPU не поддерживается в этом браузере."
              : "WebGPU is not supported in this browser.",
        };
      }

      // Имя модели из профиля, иначе дефолт.
      // Модель WebLLM должна быть из списка prebuilt (см. @mlc-ai/web-llm prebuiltAppConfig).
      const chosenModel =
        (options.modelId && options.modelId.trim()) || WEBLLM_DEFAULT_MODEL;

      const engine = await this.getEngine(chosenModel, options.onLoadProgress);

      const reply = await engine.chat.completion.create({
        messages: [
          { role: "system", content: options.systemPrompt },
          ...options.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const content = reply?.choices?.[0]?.message?.content ?? "";
      if (!content) {
        return {
          content: "",
          error:
            options.locale === "ru"
              ? "WebLLM вернул пустой ответ."
              : "WebLLM returned empty response.",
        };
      }
      return { content: String(content).trim() };
    } catch (e: any) {
      // Сбрасываем движок при ошибке, чтобы следующий раз инициализировался заново.
      this.engine = null;
      this.initPromise = null;
      return {
        content: "",
        error:
          options.locale === "ru"
            ? `WebLLM ошибка: ${e?.message ?? "unknown"}. Проверь поддержку WebGPU.`
            : `WebLLM error: ${e?.message ?? "unknown"}. Check WebGPU support.`,
      };
    }
  }
}

// ====== Factory ======

export interface ProviderProfile {
  aiProvider: string;
  aiCustomUrl: string | null;
  aiModel: string | null;
}

/**
 * Возвращает инстанс провайдера по профилю.
 * Для "webllm" инстанс переиспользуется (singleton-движок), поэтому
 * лучше создавать провайдер один раз на странице и переиспользовать.
 */
export function getProvider(profile: ProviderProfile): AIProvider {
  switch (profile.aiProvider) {
    case "custom":
      return new CustomURLProvider(
        profile.aiCustomUrl || "http://localhost:11434/v1",
        profile.aiModel || "llama3.2"
      );
    case "webllm":
      return getWebLLMSingleton();
    case "zai":
    default:
      return new ZAIProvider();
  }
}

// Singleton для WebLLM — чтобы движок не пересоздавался при каждом запросе.
let webllmSingleton: WebLLMProvider | null = null;
function getWebLLMSingleton(): WebLLMProvider {
  if (!webllmSingleton) webllmSingleton = new WebLLMProvider();
  return webllmSingleton;
}

// Хелпер для UI: краткое имя провайдера (без "Cloud" и т.п.).
export function providerShortName(id: "zai" | "webllm" | "custom"): string {
  switch (id) {
    case "zai":
      return "Z.AI";
    case "webllm":
      return "WebLLM";
    case "custom":
      return "Custom";
  }
}
