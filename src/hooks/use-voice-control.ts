"use client";

/**
 * useVoiceControl — обёртка над Web Speech API SpeechRecognition.
 * Непрерывное распознавание голосовых команд с поддержкой RU/EN.
 *
 * Поддерживаемые команды (RU/EN):
 *   "пауза" / "pause"            → onPause
 *   "продолжить" / "resume"      → onResume
 *   "стоп" / "stop"              → onStop
 *   "следующий" / "next"         → onNext
 *   "замена" / "substitute"      → onSubstitute
 *
 * Не падает, если API недоступен (возвращает supported: false).
 *
 * Использование:
 *   const vc = useVoiceControl({
 *     locale: "ru",
 *     enabled: true,
 *     onPause: () => setPhase("paused"),
 *     ...
 *   });
 *   <button onClick={() => vc.toggle()} aria-pressed={vc.active}>
 */

import * as React from "react";
import type { Locale } from "@/lib/i18n";

// Минимальный ambient тип для webkitSpeechRecognition (не в стандартных TS DOM lib).
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

interface UseVoiceControlOptions {
  locale: Locale;
  enabled: boolean; // активно ли голосовое управление вообще
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNext: () => void;
  onSubstitute: () => void;
  onUnknown?: (transcript: string) => void;
}

interface UseVoiceControlReturn {
  supported: boolean;
  active: boolean; // слушает прямо сейчас
  toggle: () => void;
  start: () => void;
  stop: () => void;
}

const RECOGNITION_LANG: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
};

// Карта команд: ключ — нижний регистр слова, значение — тип команды.
const COMMANDS: Record<Locale, Record<string, VoiceCommand>> = {
  ru: {
    пауза: "pause",
    пауз: "pause",
    стоп: "stop",
    остановить: "stop",
    продолжить: "resume",
    продолжи: "resume",
    дальше: "next",
    следующий: "next",
    следующая: "next",
    замена: "substitute",
    заменить: "substitute",
  },
  en: {
    pause: "pause",
    stop: "stop",
    resume: "resume",
    next: "next",
    substitute: "substitute",
    replace: "substitute",
  },
};

type VoiceCommand = "pause" | "resume" | "stop" | "next" | "substitute";

export function useVoiceControl(
  opts: UseVoiceControlOptions
): UseVoiceControlReturn {
  const { locale, enabled } = opts;
  const supportedRef = React.useRef(false);
  const [supported, setSupported] = React.useState(false);
  const [active, setActive] = React.useState(false);

  // Ref на обработчики — чтобы не пересоздавать рекогнишн при изменении колбэков.
  const optsRef = React.useRef(opts);
  React.useEffect(() => {
    optsRef.current = opts;
  });

  // Ref на инстанс recognition — persistent между re-render.
  const recRef = React.useRef<SpeechRecognitionLike | null>(null);
  // Пользовательский флаг — хочет ли юзер слушать (toggle).
  const userActiveRef = React.useRef(false);

  // Инициализация — один раз на mount.
  React.useEffect(() => {
    const Ctor = getRecognitionCtor();
    supportedRef.current = Boolean(Ctor);
    setSupported(Boolean(Ctor));
    if (!Ctor) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.lang = RECOGNITION_LANG[locale];

    rec.onresult = (event: any) => {
      // Берём последний результат (final)
      const last = event.results?.[event.results.length - 1];
      if (!last || !last[0]) return;
      const transcriptRaw: string = last[0].transcript?.trim().toLowerCase() ?? "";
      if (!transcriptRaw) return;
      // Сплитим по пробелам — ищем команду (первое слово обычно команда).
      const words = transcriptRaw.split(/\s+/);
      const cmds = COMMANDS[locale];
      // Берём первое распознанное слово, которое входит в карту команд.
      let matched: VoiceCommand | null = null;
      for (const w of words) {
        if (cmds[w]) {
          matched = cmds[w];
          break;
        }
      }
      const o = optsRef.current;
      if (matched === "pause") o.onPause();
      else if (matched === "resume") o.onResume();
      else if (matched === "stop") o.onStop();
      else if (matched === "next") o.onNext();
      else if (matched === "substitute") o.onSubstitute();
      else o.onUnknown?.(transcriptRaw);
    };

    rec.onerror = (event: any) => {
      // 'no-speech', 'aborted', 'network' — не критичны, продолжаем слушать
      // 'not-allowed' — пользователь не дал разрешение
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        userActiveRef.current = false;
        setActive(false);
      }
    };

    rec.onend = () => {
      // Браузер часто обрывает recognition через ~30 сек. Поднимаем заново, если юзер хочет.
      if (userActiveRef.current) {
        try {
          rec.start();
        } catch {
          // уже активен — игнор
        }
      } else {
        setActive(false);
      }
    };

    recRef.current = rec;

    return () => {
      userActiveRef.current = false;
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
    };
  }, [locale]);

  const start = React.useCallback(() => {
    if (!supportedRef.current || !recRef.current) return;
    userActiveRef.current = true;
    try {
      recRef.current.lang = RECOGNITION_LANG[locale];
      recRef.current.start();
      setActive(true);
    } catch {
      // может выкинуть если уже запущен — игнор
      setActive(true);
    }
  }, [locale]);

  const stop = React.useCallback(() => {
    userActiveRef.current = false;
    if (!recRef.current) return;
    try {
      recRef.current.stop();
    } catch {
      /* noop */
    }
    setActive(false);
  }, []);

  const toggle = React.useCallback(() => {
    if (userActiveRef.current) stop();
    else start();
  }, [start, stop]);

  // Если глобально enabled=false — остановить.
  React.useEffect(() => {
    if (!enabled && active) {
      stop();
    }
  }, [enabled, active, stop]);

  return { supported, active, toggle, start, stop };
}
