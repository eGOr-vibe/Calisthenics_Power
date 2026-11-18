"use client";

import * as React from "react";

/**
 * useBeep — генерация коротких звуковых сигналов через Web Audio API.
 * Не требует внешних audio-файлов. Тихо игнорирует ошибки (headless, нет прав).
 *
 * Использование:
 *   const { shortBeep, longBeep, doubleBeep, tripleBeep, beep, supported } = useBeep();
 *   shortBeep(); // A5, 150ms — старт / круг
 *   longBeep();  // A4, 800ms — окончание
 *   doubleBeep(); // предупреждение за 3 сек
 *   tripleBeep(); // предупреждение за 10 сек
 *
 * Audio context создаётся лениво и переиспользуется между вызовами.
 * При первом жесте пользователя браузер снимает autoplay-блокировку через resume().
 */

export interface UseBeepReturn {
  beep: (frequency?: number, duration?: number, volume?: number) => void;
  shortBeep: () => void;
  longBeep: () => void;
  doubleBeep: () => void;
  tripleBeep: () => void;
  supported: boolean;
}

export function useBeep(): UseBeepReturn {
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const getAudioContext = React.useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  const beep = React.useCallback(
    (
      frequency: number = 880,
      duration: number = 200,
      volume: number = 0.3
    ) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Resume if suspended (autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {
          /* noop */
        });
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration / 1000
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    },
    [getAudioContext]
  );

  // Короткий высокий beep (старт, круг, отдых→работа)
  const shortBeep = React.useCallback(() => {
    beep(880, 150, 0.3); // A5, 150ms
  }, [beep]);

  // Длинный низкий beep (окончание)
  const longBeep = React.useCallback(() => {
    beep(440, 800, 0.4); // A4, 800ms
  }, [beep]);

  // Двойной beep (предупреждение за 3 секунды)
  const doubleBeep = React.useCallback(() => {
    beep(660, 100, 0.2);
    setTimeout(() => beep(660, 100, 0.2), 150);
  }, [beep]);

  // Тройной beep (10 секунд до конца)
  const tripleBeep = React.useCallback(() => {
    beep(550, 80, 0.15);
    setTimeout(() => beep(550, 80, 0.15), 120);
    setTimeout(() => beep(550, 80, 0.15), 240);
  }, [beep]);

  const supported =
    typeof window !== "undefined" &&
    (!!window.AudioContext ||
      !!(window as unknown as { webkitAudioContext?: unknown })
        .webkitAudioContext);

  return {
    beep,
    shortBeep,
    longBeep,
    doubleBeep,
    tripleBeep,
    supported,
  };
}
