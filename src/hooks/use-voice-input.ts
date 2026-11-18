"use client";

/**
 * useVoiceInput — single-shot распознавание числа (1-100) голосом.
 *
 * В отличие от use-voice-control.ts (непрерывное распознавание команд),
 * этот хук запускает разовое распознавание и возвращает распарсенное число.
 *
 * Используется в таймере для голосового ввода количества повторений в круге.
 *
 * API:
 *   const vi = useVoiceInput({ locale: "ru" });
 *   if (!vi.supported) toast(notSupported);
 *   vi.startListening(
 *     (n) => setReps(n),
 *     (e) => console.warn(e)
 *   );
 *
 * Парсинг числительных (включая "пять", "twenty") см. в lib/voice-numbers.ts.
 */

import * as React from "react";
import type { Locale } from "@/lib/i18n";
import { parseNumberFromSpeech } from "@/lib/voice-numbers";

// Минимальный ambient тип для webkitSpeechRecognition.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

interface SpeechRecognitionCtor {
  new (): SpeechRecognitionLike;
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) ?? null;
}

interface UseVoiceInputOptions {
  locale: Locale;
}

interface UseVoiceInputReturn {
  supported: boolean;
  listening: boolean;
  /**
   * Запускает разовое распознавание.
   * @param onResult  вызывается с числом (0..100) или null если не распознали
   * @param onError   вызывается при ошибке распознавания (нет permissons и т.д.)
   */
  startListening: (
    onResult: (n: number | null) => void,
    onError?: (err: string) => void
  ) => void;
  /** Принудительно остановить распознавание. */
  cancel: () => void;
}

const RECOGNITION_LANG: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
};

export function useVoiceInput({
  locale,
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [supported, setSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);

  // Ref на инстанс recognition — создаётся один раз на mount.
  const recRef = React.useRef<SpeechRecognitionLike | null>(null);
  const callbacksRef = React.useRef<{
    onResult?: (n: number | null) => void;
    onError?: (err: string) => void;
  }>({});

  // Init — создаём recognition-инстанс в первый раз.
  React.useEffect(() => {
    const Ctor = getRecognitionCtor();
    setSupported(Boolean(Ctor));
    if (!Ctor) return;

    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.lang = RECOGNITION_LANG[locale];

    rec.onresult = (event: any) => {
      // Берём только final результаты (interimResults=false → один result)
      const result = event.results?.[event.results.length - 1];
      if (!result) {
        callbacksRef.current.onResult?.(null);
        return;
      }
      // Собираем все альтернативы и пытаемся распарсить число из каждой
      // (браузер иногда ошибается в первом варианте).
      const altCount = (result.length as number) ?? 1;
      let parsed: number | null = null;
      for (let i = 0; i < altCount; i++) {
        const transcript: string = result[i]?.transcript ?? "";
        parsed = parseNumberFromSpeech(transcript, locale);
        if (parsed !== null) break;
      }
      callbacksRef.current.onResult?.(parsed);
    };

    rec.onerror = (event: any) => {
      const code = (event?.error as string) ?? "unknown";
      callbacksRef.current.onError?.(code);
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    recRef.current = rec;

    return () => {
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.onstart = null;
        rec.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
    };
  }, [locale]);

  const startListening = React.useCallback(
    (onResult: (n: number | null) => void, onError?: (err: string) => void) => {
      const rec = recRef.current;
      if (!rec) {
        onError?.("not-supported");
        return;
      }
      // Сбрасываем предыдущее состояние
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      // Обновляем язык на всякий случай (если locale поменялся)
      rec.lang = RECOGNITION_LANG[locale];
      callbacksRef.current = { onResult, onError };
      try {
        rec.start();
        setListening(true);
      } catch {
        // Может выкинуть если recognition уже активен — игнорируем.
        setListening(true);
      }
    },
    [locale]
  );

  const cancel = React.useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    callbacksRef.current = {};
    try {
      rec.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  return { supported, listening, startListening, cancel };
}
