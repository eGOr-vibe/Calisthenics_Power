"use client";

/**
 * useWorkoutTimer — state machine для адаптивного ВИИТ-таймера.
 *
 * Поддерживаемые форматы:
 *   - amrap:    elapsed-счётчик вверх до durationSec. Круги не ограничены (user жмёт nextRound).
 *   - emom:     N кругов по 60 сек (countdown). Каждый круг авто-продвигается.
 *   - tabata:   8 раундов, 20 сек работа + 10 сек отдых (countdown).
 *   - interval: N раундов, workSec + restSec (countdown).
 *
 * Phases:
 *   preparing → working → (resting ↔ working) → finished
 *                          ↑ paused может переключить в любое время
 *
 * Callbacks вызываются при событиях — идеально для TTS-озвучки:
 *   onPrepareStart, onPrepareEnd (GO),
 *   onRoundStart(round),
 *   onTenSecLeft(),
 *   onRestStart(), onWorkStart(),
 *   onFinish(),
 *   onPhaseChange(phase)
 *
 * Сохраняет текущее состояние в localStorage (key = STORAGE_KEY) — для reload.
 */

import * as React from "react";
import type { WorkoutFormat } from "@/lib/types";

// ====== Константы ======
export const PREPARE_SECONDS = 3;
export const EMOM_ROUND_SEC = 60;
export const TABATA_ROUNDS = 8;
export const TABATA_WORK_SEC = 20;
export const TABATA_REST_SEC = 10;

export type TimerPhase =
  | "preparing"
  | "working"
  | "resting"
  | "paused"
  | "finished";

export interface TimerConfig {
  format: WorkoutFormat;
  durationSec: number;  // AMRAP
  rounds: number;        // EMOM, Tabata, Intervals
  workSec: number;       // Tabata, Intervals (для EMOM = 60)
  restSec: number;       // Tabata, Intervals (для EMOM = 0)
}

export interface TimerState {
  phase: TimerPhase;
  currentRound: number;
  elapsedSec: number;      // AMRAP: up-counter от 0
  remainingSec: number;    // EMOM/Tabata/Intervals: countdown текущего круга/фазы
  totalElapsedSec: number; // общий прошедший (без учёта пауз)
  // Progress по упражнениям (в круге) — управляется отдельной логикой, но таймер обнуляет при next round.
  // Здесь не хранится.
}

interface TimerCallbacks {
  onPrepareStart?: () => void;
  onPrepareEnd?: () => void;
  onRoundStart?: (round: number) => void;
  onTenSecLeft?: () => void;
  onRestStart?: () => void;
  onWorkStart?: () => void;
  onPhaseChange?: (phase: TimerPhase) => void;
  onFinish?: () => void;
}

const STORAGE_KEY = "cp_active_workout";

interface PersistedState {
  config: TimerConfig;
  phase: TimerPhase;
  currentRound: number;
  elapsedSec: number;
  remainingSec: number;
  totalElapsedSec: number;
  startedAt: number; // Date.now()
  // saved at persist time
  savedAt: number;
}

// ====== Хелперы: вычисление длительности фазы/круга ======

function getRoundDurationSec(cfg: TimerConfig): number {
  switch (cfg.format) {
    case "amrap":
      return cfg.durationSec; // не используется для round'а, но возвращаем для консистентности
    case "emom":
      return EMOM_ROUND_SEC;
    case "tabata":
      return TABATA_WORK_SEC + TABATA_REST_SEC;
    case "interval":
      return cfg.workSec + cfg.restSec;
  }
}

function getWorkSec(cfg: TimerConfig): number {
  switch (cfg.format) {
    case "amrap":
      return cfg.durationSec;
    case "emom":
      return EMOM_ROUND_SEC;
    case "tabata":
      return TABATA_WORK_SEC;
    case "interval":
      return cfg.workSec;
  }
}

function getRestSec(cfg: TimerConfig): number {
  switch (cfg.format) {
    case "amrap":
    case "emom":
      return 0;
    case "tabata":
      return TABATA_REST_SEC;
    case "interval":
      return cfg.restSec;
  }
}

function getMaxRounds(cfg: TimerConfig): number {
  switch (cfg.format) {
    case "amrap":
      return Number.MAX_SAFE_INTEGER;
    case "emom":
      return cfg.rounds;
    case "tabata":
      return TABATA_ROUNDS;
    case "interval":
      return cfg.rounds;
  }
}

// ====== Хук ======

export function useWorkoutTimer(
  config: TimerConfig,
  callbacks: TimerCallbacks
) {
  const cbRef = React.useRef(callbacks);
  React.useEffect(() => {
    cbRef.current = callbacks;
  });

  const [phase, setPhase] = React.useState<TimerPhase>("preparing");
  const [currentRound, setCurrentRound] = React.useState(1);
  const [elapsedSec, setElapsedSec] = React.useState(0); // AMRAP up-counter
  const [remainingSec, setRemainingSec] = React.useState(() =>
    getWorkSec(config)
  );
  const [totalElapsedSec, setTotalElapsedSec] = React.useState(0);
  // Флаг: запущен ли таймер пользователем (нажали Start). Без него тики не идут.
  const [started, setStarted] = React.useState(false);

  // Refs для tick-логики (не вызывают ре-рендер)
  const stateRef = React.useRef({
    phase: "preparing" as TimerPhase,
    currentRound: 1,
    elapsedSec: 0,
    remainingSec: getWorkSec(config),
    totalElapsedSec: 0,
    tenSecFiredFor: -1, // id раунда/фазы, для которого уже-fired onTenSecLeft (чтобы не триггерить повторно)
    started: false,
    config,
  });

  // Синхронизируем stateRef с config при изменении config (только перед стартом).
  React.useEffect(() => {
    if (stateRef.current.phase === "preparing" || stateRef.current.phase === "finished") {
      stateRef.current.remainingSec = getWorkSec(config);
      stateRef.current.config = config;
      setRemainingSec(getWorkSec(config));
    }
  }, [config]);

  // Helpers для sync stateRef → state (для рендера)
  const syncState = React.useCallback(() => {
    const s = stateRef.current;
    setPhase(s.phase);
    setCurrentRound(s.currentRound);
    setElapsedSec(s.elapsedSec);
    setRemainingSec(s.remainingSec);
    setTotalElapsedSec(s.totalElapsedSec);
  }, []);

  // ===== Persist в localStorage при изменениях (только в активных фазах) =====
  React.useEffect(() => {
    if (phase === "preparing" || phase === "finished") {
      // При завершении — очищаем storage
      if (phase === "finished") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* noop */
        }
      }
      return;
    }
    const data: PersistedState = {
      config,
      phase,
      currentRound,
      elapsedSec,
      remainingSec,
      totalElapsedSec,
      startedAt: Date.now() - totalElapsedSec * 1000,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* noop */
    }
  }, [phase, currentRound, elapsedSec, remainingSec, totalElapsedSec, config]);

  // ====== Tick — основная логика ======

  const tick = React.useCallback(() => {
    const s = stateRef.current;
    const cfg = s.config;
    const cbs = cbRef.current;
    const workSec = getWorkSec(cfg);
    const restSec = getRestSec(cfg);
    const maxRounds = getMaxRounds(cfg);

    // Инкремент общего прошедшего — всегда (кроме paused/finished, но они не тикают)
    s.totalElapsedSec += 1;

    if (s.phase === "preparing") {
      // Считаем remainingSec вниз (3,2,1) — он инициализирован PREPARE_SECONDS через start()
      s.remainingSec -= 1;
      if (s.remainingSec <= 0) {
        // Переходим в working
        s.phase = "working";
        s.remainingSec = workSec;
        s.tenSecFiredFor = -1;
        cbs.onPrepareEnd?.();
        cbs.onRoundStart?.(s.currentRound);
        cbs.onPhaseChange?.("working");
        cbs.onWorkStart?.();
      }
      syncState();
      return;
    }

    if (s.phase === "working") {
      if (cfg.format === "amrap") {
        s.elapsedSec += 1;
        if (s.elapsedSec >= cfg.durationSec) {
          // Финиш
          s.phase = "finished";
          cbs.onPhaseChange?.("finished");
          cbs.onFinish?.();
          syncState();
          return;
        }
        syncState();
        return;
      }
      // EMOM / Tabata / Intervals — countdown work
      s.remainingSec -= 1;
      // 10-sec warning (только если фаза длиннее 10 сек и остался ровно 10)
      if (s.remainingSec === 10 && workSec > 10) {
        cbs.onTenSecLeft?.();
      }
      if (s.remainingSec <= 0) {
        // Фаза работы завершена
        if (cfg.format === "emom") {
          // Сразу переход к следующему кругу (или финиш)
          if (s.currentRound >= maxRounds) {
            s.phase = "finished";
            cbs.onPhaseChange?.("finished");
            cbs.onFinish?.();
          } else {
            s.currentRound += 1;
            s.remainingSec = EMOM_ROUND_SEC;
            s.tenSecFiredFor = -1;
            cbs.onRoundStart?.(s.currentRound);
          }
        } else {
          // Tabata / Intervals → отдых
          if (restSec > 0) {
            s.phase = "resting";
            s.remainingSec = restSec;
            s.tenSecFiredFor = -1;
            cbs.onPhaseChange?.("resting");
            cbs.onRestStart?.();
          } else {
            // restSec=0 (EMOM-кейс, не должно случаться тут)
            if (s.currentRound >= maxRounds) {
              s.phase = "finished";
              cbs.onPhaseChange?.("finished");
              cbs.onFinish?.();
            } else {
              s.currentRound += 1;
              s.remainingSec = workSec;
              s.tenSecFiredFor = -1;
              cbs.onRoundStart?.(s.currentRound);
            }
          }
        }
      }
      syncState();
      return;
    }

    if (s.phase === "resting") {
      s.remainingSec -= 1;
      if (s.remainingSec === 10 && restSec > 10) {
        cbs.onTenSecLeft?.();
      }
      if (s.remainingSec <= 0) {
        // Отдых окончен → следующий раунд работы
        if (s.currentRound >= maxRounds) {
          s.phase = "finished";
          cbs.onPhaseChange?.("finished");
          cbs.onFinish?.();
        } else {
          s.currentRound += 1;
          s.remainingSec = workSec;
          s.tenSecFiredFor = -1;
          s.phase = "working";
          cbs.onPhaseChange?.("working");
          cbs.onRoundStart?.(s.currentRound);
          cbs.onWorkStart?.();
        }
      }
      syncState();
      return;
    }
  }, [syncState]);

  React.useEffect(() => {
    if (!started) return;
    if (phase === "paused" || phase === "finished") return;
    const id = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(id);
  }, [phase, tick, started]);

  // ====== Управление ======

  const start = React.useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "preparing") return;
    // Старт подготовки
    s.remainingSec = PREPARE_SECONDS;
    s.phase = "preparing";
    s.tenSecFiredFor = -1;
    s.started = true;
    setStarted(true);
    cbRef.current.onPrepareStart?.();
    cbRef.current.onPhaseChange?.("preparing");
    syncState();
  }, [syncState]);

  const pause = React.useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "paused" || s.phase === "finished") return;
    // Сохраняем текущую фазу, чтобы знать куда вернуться
    (s as any)._prevPhase = s.phase;
    s.phase = "paused";
    cbRef.current.onPhaseChange?.("paused");
    syncState();
  }, [syncState]);

  const resume = React.useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "paused") return;
    const prev = (s as any)._prevPhase as TimerPhase | undefined;
    s.phase = prev ?? "working";
    delete (s as any)._prevPhase;
    // Если таймер ещё не стартовал (paused перед стартом) — ничего не делаем тут.
    if (!s.started) {
      s.started = true;
      setStarted(true);
    }
    cbRef.current.onPhaseChange?.(s.phase);
    syncState();
  }, [syncState]);

  const finish = React.useCallback(() => {
    const s = stateRef.current;
    s.phase = "finished";
    cbRef.current.onPhaseChange?.("finished");
    cbRef.current.onFinish?.();
    syncState();
  }, [syncState]);

  const nextRound = React.useCallback(() => {
    // Пользователь жмёт "Следующий круг" — завершает текущий, переходит к следующему.
    // Для AMRAP — обнуляет elapsed у текущего круга и инкрементирует счётчик.
    // Для остальных — пропускает текущую фазу в следующий круг.
    const s = stateRef.current;
    const cfg = s.config;
    if (s.phase === "preparing" || s.phase === "paused" || s.phase === "finished") return;
    const maxRounds = getMaxRounds(cfg);
    const workSec = getWorkSec(cfg);

    // -1 — индикатор "user pressed next round" (для сброса itemsProgress в page).
    cbRef.current.onRoundStart?.(-1);

    if (cfg.format === "amrap") {
      // AMRAP: следующий круг, но таймер тикает дальше. Просто уведомляем page.
      s.currentRound += 1;
      syncState();
      cbRef.current.onRoundStart?.(s.currentRound);
      return;
    }

    // EMOM / Tabata / Intervals — прыгаем в начало работы следующего круга
    if (s.currentRound >= maxRounds) {
      s.phase = "finished";
      cbRef.current.onPhaseChange?.("finished");
      cbRef.current.onFinish?.();
    } else {
      s.currentRound += 1;
      s.phase = "working";
      s.remainingSec = workSec;
      s.tenSecFiredFor = -1;
      cbRef.current.onPhaseChange?.("working");
      cbRef.current.onRoundStart?.(s.currentRound);
    }
    syncState();
  }, [syncState]);

  const reset = React.useCallback(() => {
    const s = stateRef.current;
    s.phase = "preparing";
    s.currentRound = 1;
    s.elapsedSec = 0;
    s.remainingSec = getWorkSec(s.config);
    s.totalElapsedSec = 0;
    s.tenSecFiredFor = -1;
    s.started = false;
    setStarted(false);
    syncState();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, [syncState]);

  // ====== Восстановление из localStorage (один раз на mount) ======
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as PersistedState;
      // Простая валидация
      if (!data?.config || !data?.phase) return;
      // Если фаза была активна — поднимаем пользователя в paused (для безопасности)
      // и даём ему choice resume через UI.
      stateRef.current.config = data.config;
      stateRef.current.phase = data.phase === "finished" ? "finished" : "paused";
      stateRef.current.currentRound = data.currentRound;
      stateRef.current.elapsedSec = data.elapsedSec;
      stateRef.current.remainingSec = data.remainingSec;
      (stateRef.current as any)._prevPhase =
        data.phase === "preparing" || data.phase === "paused"
          ? "working"
          : data.phase;
      // Если уже запущено (была активная фаза) — сохраняем started=true,
      // но эффект тика не запустится, т.к. phase=paused.
      if (data.phase !== "preparing") {
        stateRef.current.started = true;
        setStarted(true);
      }
      syncState();
    } catch {
      /* noop */
    }
  }, []);

  return {
    phase,
    currentRound,
    elapsedSec,
    remainingSec,
    totalElapsedSec,
    started,
    start,
    pause,
    resume,
    finish,
    nextRound,
    reset,
    // для UI
    isAmrap: config.format === "amrap",
    maxRounds: getMaxRounds(config),
    workSec: getWorkSec(config),
    restSec: getRestSec(config),
    roundDurationSec: getRoundDurationSec(config),
  };
}
