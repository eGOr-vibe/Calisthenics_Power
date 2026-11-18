"use client";

/**
 * useTts — обёртка над Web Speech API SpeechSynthesis.
 * Не падает в headless-окружениях (Agent Browser, SSR) — все вызовы защищены.
 *
 * Использование:
 *   const tts = useTts({ locale: "ru", enabled: true });
 *   tts.speak("Круг 1, пошёл");
 *   tts.cancel(); // остановить очередь
 *
 * Фразы подбираются по языку вызывающим кодом.
 */

import * as React from "react";
import type { Locale } from "@/lib/i18n";

interface UseTtsOptions {
  locale: Locale;
  enabled: boolean;
}

interface UseTtsReturn {
  speak: (text: string, opts?: { interrupt?: boolean }) => void;
  cancel: () => void;
  supported: boolean;
}

const PRIMARY_LANG: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
};

const FALLBACK_LANG: Record<Locale, string> = {
  ru: "ru",
  en: "en",
};

export function useTts({ locale, enabled }: UseTtsOptions): UseTtsReturn {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Кэш голосов по локали. Загружаем один раз.
  const voiceRef = React.useRef<SpeechSynthesisVoice | null>(null);

  React.useEffect(() => {
    if (!supported) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;
      const primary = PRIMARY_LANG[locale];
      const fallback = FALLBACK_LANG[locale];
      const exact = voices.find((v) => v.lang === primary);
      const partial = voices.find((v) =>
        v.lang.toLowerCase().startsWith(fallback)
      );
      voiceRef.current = exact ?? partial ?? voices[0] ?? null;
    };
    pickVoice();
    // voicesloaded event — асинхронно в Chrome
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        // не cancel при unmount — может прервать текущую фразу
        // просто снимаем обработчик
        try {
          window.speechSynthesis.onvoiceschanged = null;
        } catch {
          /* noop */
        }
      }
    };
  }, [supported, locale]);

  const speak = React.useCallback(
    (text: string, opts?: { interrupt?: boolean }) => {
      if (!supported || !enabled || !text) return;
      try {
        const synth = window.speechSynthesis;
        if (opts?.interrupt) {
          synth.cancel();
        }
        const u = new SpeechSynthesisUtterance(text);
        u.lang = PRIMARY_LANG[locale];
        if (voiceRef.current) {
          u.voice = voiceRef.current;
        }
        // Параметры речи: чуть медленнее для ясности
        u.rate = 1.0;
        u.pitch = 1.0;
        u.volume = 1.0;
        synth.speak(u);
      } catch {
        // тихо игнорируем — TTS не критичен
      }
    },
    [supported, enabled, locale]
  );

  const cancel = React.useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }, [supported]);

  return { speak, cancel, supported };
}
