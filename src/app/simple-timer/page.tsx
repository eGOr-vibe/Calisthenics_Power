"use client";

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Bell,
  ChevronRight,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBeep } from "@/hooks/use-beep";
import { useTts } from "@/hooks/use-tts";

// ============== Helpers ==============

function formatMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function formatStopwatch(totalMs: number): string {
  const ms = Math.max(0, Math.floor(totalMs));
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${cs
    .toString()
    .padStart(2, "0")}`;
}

// ============== Sound options card ==============

interface SoundOption {
  key: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function SoundOptionsCard({
  title,
  options,
}: {
  title: string;
  options: SoundOption[];
}) {
  return (
    <Card className="gap-0 px-4 py-3">
      <div className="flex items-center gap-2 pb-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {options.map((opt) => (
          <div
            key={opt.key}
            className="flex items-center justify-between py-2.5"
          >
            <Label
              htmlFor={`opt-${opt.key}`}
              className="text-sm text-foreground cursor-pointer"
            >
              {opt.label}
            </Label>
            <Switch
              id={`opt-${opt.key}`}
              checked={opt.value}
              onCheckedChange={opt.onChange}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============== Control buttons ==============

function RoundButton({
  onClick,
  variant = "default",
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size="icon"
      aria-label={label}
      disabled={disabled}
      className={cn(
        "h-14 w-14 rounded-full p-0 touch-manipulation",
        variant === "default" && "shadow-lg shadow-primary/30"
      )}
    >
      {children}
    </Button>
  );
}

// ============== Countdown Tab ==============

const PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
  { label: "10m", seconds: 600 },
];

function CountdownTab() {
  const { t, locale } = useI18n();
  const { shortBeep, longBeep, doubleBeep, tripleBeep } = useBeep();
  const tts = useTts({ locale, enabled: true });

  const [duration, setDuration] = React.useState(60);
  const [remaining, setRemaining] = React.useState(60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [customMin, setCustomMin] = React.useState("1");
  const [customSec, setCustomSec] = React.useState("0");

  const [optStart, setOptStart] = React.useState(true);
  const [opt10s, setOpt10s] = React.useState(true);
  const [opt3s, setOpt3s] = React.useState(true);
  const [optEnd, setOptEnd] = React.useState(true);
  const [optTts, setOptTts] = React.useState(false);

  const optionsRef = React.useRef({ optStart, opt10s, opt3s, optEnd, optTts });
  React.useEffect(() => {
    optionsRef.current = { optStart, opt10s, opt3s, optEnd, optTts };
  }, [optStart, opt10s, opt3s, optEnd, optTts]);

  const speakRef = React.useRef(tts.speak);
  React.useEffect(() => {
    speakRef.current = tts.speak;
  }, [tts.speak]);

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const signaled10 = React.useRef(false);
  const signaled3 = React.useRef(false);

  const tickRef = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    tickRef.current = () => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          setFinished(true);
          if (optionsRef.current.optEnd) longBeep();
          if (optionsRef.current.optTts) speakRef.current(t("simpleTimer.timeUp"));
          return 0;
        }
        if (
          next === 10 &&
          optionsRef.current.opt10s &&
          !signaled10.current
        ) {
          signaled10.current = true;
          tripleBeep();
          if (optionsRef.current.optTts)
            speakRef.current(t("simpleTimer.tenSeconds"));
        }
        if (next === 3 && optionsRef.current.opt3s && !signaled3.current) {
          signaled3.current = true;
          doubleBeep();
          if (optionsRef.current.optTts)
            speakRef.current(t("simpleTimer.threeTwoOne"));
        }
        return next;
      });
    };
  }, [t, longBeep, tripleBeep, doubleBeep]);

  const start = () => {
    if (isRunning) return;
    if (finished || remaining === 0) {
      setFinished(false);
      setRemaining(duration);
      signaled10.current = false;
      signaled3.current = false;
    }
    if (optionsRef.current.optStart) shortBeep();
    if (optionsRef.current.optTts) speakRef.current(t("simpleTimer.go"));
    setIsRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tickRef.current(), 1000);
  };

  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setFinished(false);
    setRemaining(duration);
    signaled10.current = false;
    signaled3.current = false;
    tts.cancel();
  };

  React.useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  const applyPreset = (sec: number) => {
    if (isRunning) return;
    setDuration(sec);
    setRemaining(sec);
    setFinished(false);
    signaled10.current = false;
    signaled3.current = false;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    setCustomMin(String(m));
    setCustomSec(String(s));
  };

  const applyCustom = () => {
    if (isRunning) return;
    const m = Math.max(0, parseInt(customMin || "0", 10) || 0);
    const s = Math.max(0, Math.min(59, parseInt(customSec || "0", 10) || 0));
    const total = m * 60 + s;
    if (total <= 0) return;
    setDuration(total);
    setRemaining(total);
    setFinished(false);
    signaled10.current = false;
    signaled3.current = false;
  };

  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2">
        <div
          className={cn(
            "text-7xl font-bold tabular-nums text-center tracking-tight",
            finished ? "text-primary" : "text-foreground"
          )}
        >
          {formatMS(remaining)}
        </div>
        <Progress value={progress} className="h-2 w-full max-w-xs" />
        {finished && (
          <p className="text-sm font-semibold text-primary">
            {t("simpleTimer.completed")}
          </p>
        )}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESETS.map((p) => (
          <Button
            key={p.seconds}
            variant={duration === p.seconds ? "default" : "outline"}
            size="sm"
            disabled={isRunning}
            onClick={() => applyPreset(p.seconds)}
            className="min-h-[44px] px-4"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Custom time */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="cd-min" className="text-xs text-muted-foreground">
            {t("simpleTimer.minutes")}
          </Label>
          <Input
            id="cd-min"
            inputMode="numeric"
            value={customMin}
            disabled={isRunning}
            onChange={(e) =>
              setCustomMin(e.target.value.replace(/\D/g, "").slice(0, 3))
            }
            onBlur={applyCustom}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="cd-sec" className="text-xs text-muted-foreground">
            {t("simpleTimer.seconds")}
          </Label>
          <Input
            id="cd-sec"
            inputMode="numeric"
            value={customSec}
            disabled={isRunning}
            onChange={(e) =>
              setCustomSec(e.target.value.replace(/\D/g, "").slice(0, 2))
            }
            onBlur={applyCustom}
            className="mt-1"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        {!isRunning ? (
          <RoundButton
            onClick={start}
            label={t("simpleTimer.start")}
            variant="default"
          >
            <Play className="h-6 w-6" />
          </RoundButton>
        ) : (
          <RoundButton
            onClick={pause}
            label={t("simpleTimer.pause")}
            variant="secondary"
          >
            <Pause className="h-6 w-6" />
          </RoundButton>
        )}
        <RoundButton
          onClick={reset}
          label={t("simpleTimer.reset")}
          variant="outline"
        >
          <RotateCcw className="h-5 w-5" />
        </RoundButton>
      </div>

      <SoundOptionsCard
        title={t("simpleTimer.soundSignals")}
        options={[
          {
            key: "start",
            label: t("simpleTimer.signalStart"),
            value: optStart,
            onChange: setOptStart,
          },
          {
            key: "10s",
            label: t("simpleTimer.signal10s"),
            value: opt10s,
            onChange: setOpt10s,
          },
          {
            key: "3s",
            label: t("simpleTimer.signal3s"),
            value: opt3s,
            onChange: setOpt3s,
          },
          {
            key: "end",
            label: t("simpleTimer.signalEnd"),
            value: optEnd,
            onChange: setOptEnd,
          },
          {
            key: "tts",
            label: t("simpleTimer.ttsVoice"),
            value: optTts,
            onChange: setOptTts,
          },
        ]}
      />
    </div>
  );
}

// ============== Stopwatch Tab ==============

function StopwatchTab() {
  const { t } = useI18n();

  const [elapsed, setElapsed] = React.useState(0); // ms
  const [isRunning, setIsRunning] = React.useState(false);
  const [laps, setLaps] = React.useState<number[]>([]);

  const startTimeRef = React.useRef(0);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const start = () => {
    if (isRunning) return;
    startTimeRef.current = Date.now() - elapsed;
    setIsRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 50);
  };

  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const lap = () => {
    if (!isRunning && elapsed === 0) return;
    setLaps((prev) => [...prev, elapsed]);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  React.useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  // Compute lap deltas
  const lapDeltas = React.useMemo(() => {
    const result: { index: number; total: number; delta: number }[] = [];
    let prev = 0;
    laps.forEach((total, i) => {
      result.push({ index: i + 1, total, delta: total - prev });
      prev = total;
    });
    return result.reverse();
  }, [laps]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="text-6xl font-bold tabular-nums text-center tracking-tight text-foreground">
          {formatStopwatch(elapsed)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        {!isRunning ? (
          <RoundButton
            onClick={start}
            label={t("simpleTimer.start")}
            variant="default"
          >
            <Play className="h-6 w-6" />
          </RoundButton>
        ) : (
          <RoundButton
            onClick={pause}
            label={t("simpleTimer.pause")}
            variant="secondary"
          >
            <Pause className="h-6 w-6" />
          </RoundButton>
        )}
        <RoundButton
          onClick={lap}
          label={t("simpleTimer.lap")}
          variant="outline"
          disabled={!isRunning && elapsed === 0}
        >
          <Flag className="h-5 w-5" />
        </RoundButton>
        <RoundButton
          onClick={reset}
          label={t("simpleTimer.reset")}
          variant="outline"
        >
          <RotateCcw className="h-5 w-5" />
        </RoundButton>
      </div>

      {/* Laps list */}
      {lapDeltas.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("simpleTimer.noLaps")}
        </p>
      ) : (
        <Card className="gap-0 px-4 py-2">
          <div className="flex flex-col divide-y divide-border">
            {lapDeltas.map((lap) => (
              <div
                key={lap.index}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-sm text-muted-foreground">
                  {t("simpleTimer.roundShort")} {lap.index}
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatStopwatch(lap.delta)}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatStopwatch(lap.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============== Intervals Tab ==============

type IntervalPhase = "work" | "rest" | "finished";

interface IntervalState {
  phase: IntervalPhase;
  currentRound: number;
  remaining: number;
}

function IntervalsTab() {
  const { t, locale } = useI18n();
  const { shortBeep, longBeep, doubleBeep } = useBeep();
  const tts = useTts({ locale, enabled: true });

  const [workSec, setWorkSec] = React.useState(20);
  const [restSec, setRestSec] = React.useState(10);
  const [rounds, setRounds] = React.useState(8);

  const [workInput, setWorkInput] = React.useState("20");
  const [restInput, setRestInput] = React.useState("10");
  const [roundsInput, setRoundsInput] = React.useState("8");

  const [state, setState] = React.useState<IntervalState>({
    phase: "work",
    currentRound: 1,
    remaining: 20,
  });
  const [isRunning, setIsRunning] = React.useState(false);

  const [optStart, setOptStart] = React.useState(true);
  const [optWork, setOptWork] = React.useState(true);
  const [optRest, setOptRest] = React.useState(true);
  const [optEnd, setOptEnd] = React.useState(true);
  const [optTts, setOptTts] = React.useState(false);

  const optionsRef = React.useRef({ optStart, optWork, optRest, optEnd, optTts });
  React.useEffect(() => {
    optionsRef.current = { optStart, optWork, optRest, optEnd, optTts };
  }, [optStart, optWork, optRest, optEnd, optTts]);

  const speakRef = React.useRef(tts.speak);
  React.useEffect(() => {
    speakRef.current = tts.speak;
  }, [tts.speak]);

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // When config changes (and not running), reset state
  React.useEffect(() => {
    if (isRunning) return;
    setState({ phase: "work", currentRound: 1, remaining: workSec });
  }, [workSec, isRunning]);

  const applyConfig = () => {
    if (isRunning) return;
    const w = Math.max(1, parseInt(workInput || "0", 10) || 0);
    const r = Math.max(1, parseInt(restInput || "0", 10) || 0);
    const rd = Math.max(1, parseInt(roundsInput || "0", 10) || 0);
    setWorkSec(w);
    setRestSec(r);
    setRounds(rd);
    setState({ phase: "work", currentRound: 1, remaining: w });
  };

  const tickRef = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    tickRef.current = () => {
      setState((prev) => {
        if (prev.phase === "finished") return prev;
        if (prev.remaining > 1) {
          return { ...prev, remaining: prev.remaining - 1 };
        }
        // remaining was 1, transition
        if (prev.phase === "work") {
          if (prev.currentRound >= rounds) {
            // last round work phase complete -> finished
            if (optionsRef.current.optEnd) longBeep();
            if (optionsRef.current.optTts)
              speakRef.current(t("simpleTimer.completed"));
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsRunning(false);
            return { phase: "finished", currentRound: prev.currentRound, remaining: 0 };
          }
          // work -> rest
          if (optionsRef.current.optRest) doubleBeep();
          if (optionsRef.current.optTts)
            speakRef.current(t("simpleTimer.restPhase"));
          return { phase: "rest", currentRound: prev.currentRound, remaining: restSec };
        }
        // rest -> work (new round)
        if (optionsRef.current.optWork) shortBeep();
        if (optionsRef.current.optTts)
          speakRef.current(t("simpleTimer.workPhase"));
        return {
          phase: "work",
          currentRound: prev.currentRound + 1,
          remaining: workSec,
        };
      });
    };
  }, [rounds, restSec, workSec, t, doubleBeep, shortBeep, longBeep]);

  const start = () => {
    if (isRunning) return;
    if (state.phase === "finished") {
      const fresh: IntervalState = {
        phase: "work",
        currentRound: 1,
        remaining: workSec,
      };
      setState(fresh);
    }
    if (optionsRef.current.optStart) shortBeep();
    if (optionsRef.current.optTts) speakRef.current(t("simpleTimer.go"));
    setIsRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tickRef.current(), 1000);
  };

  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setState({ phase: "work", currentRound: 1, remaining: workSec });
    tts.cancel();
  };

  React.useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  // Display progress within current phase
  const phaseTotal = state.phase === "rest" ? restSec : workSec;
  const progress =
    phaseTotal > 0 ? ((phaseTotal - state.remaining) / phaseTotal) * 100 : 0;

  const phaseLabel =
    state.phase === "work"
      ? t("simpleTimer.workPhase")
      : state.phase === "rest"
        ? t("simpleTimer.restPhase")
        : t("simpleTimer.completed");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2">
        <div
          className={cn(
            "text-xs font-bold uppercase tracking-widest",
            state.phase === "work" && "text-primary",
            state.phase === "rest" && "text-foreground",
            state.phase === "finished" && "text-primary"
          )}
        >
          {phaseLabel}
        </div>
        <div
          className={cn(
            "text-7xl font-bold tabular-nums text-center tracking-tight",
            state.phase === "finished"
              ? "text-primary"
              : state.phase === "rest"
                ? "text-foreground"
                : "text-primary"
          )}
        >
          {formatMS(state.remaining)}
        </div>
        <Progress
          value={progress}
          className={cn(
            "h-2 w-full max-w-xs",
            state.phase === "rest" && "[&>[data-slot=progress-indicator]]:bg-foreground"
          )}
        />
        <div className="text-sm text-muted-foreground">
          {t("simpleTimer.round")} {state.currentRound}{" "}
          {t("simpleTimer.roundOf")} {rounds}
        </div>
      </div>

      {/* Config inputs */}
      <div className={cn("grid grid-cols-3 gap-2", isRunning && "opacity-60")}>
        <div>
          <Label htmlFor="iv-work" className="text-xs text-muted-foreground">
            {t("simpleTimer.workSec")}
          </Label>
          <Input
            id="iv-work"
            inputMode="numeric"
            value={workInput}
            disabled={isRunning}
            onChange={(e) =>
              setWorkInput(e.target.value.replace(/\D/g, "").slice(0, 3))
            }
            onBlur={applyConfig}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="iv-rest" className="text-xs text-muted-foreground">
            {t("simpleTimer.restSec")}
          </Label>
          <Input
            id="iv-rest"
            inputMode="numeric"
            value={restInput}
            disabled={isRunning}
            onChange={(e) =>
              setRestInput(e.target.value.replace(/\D/g, "").slice(0, 3))
            }
            onBlur={applyConfig}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="iv-rounds" className="text-xs text-muted-foreground">
            {t("simpleTimer.rounds")}
          </Label>
          <Input
            id="iv-rounds"
            inputMode="numeric"
            value={roundsInput}
            disabled={isRunning}
            onChange={(e) =>
              setRoundsInput(e.target.value.replace(/\D/g, "").slice(0, 3))
            }
            onBlur={applyConfig}
            className="mt-1"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        {!isRunning ? (
          <RoundButton
            onClick={start}
            label={t("simpleTimer.start")}
            variant="default"
          >
            <Play className="h-6 w-6" />
          </RoundButton>
        ) : (
          <RoundButton
            onClick={pause}
            label={t("simpleTimer.pause")}
            variant="secondary"
          >
            <Pause className="h-6 w-6" />
          </RoundButton>
        )}
        <RoundButton
          onClick={reset}
          label={t("simpleTimer.reset")}
          variant="outline"
        >
          <RotateCcw className="h-5 w-5" />
        </RoundButton>
      </div>

      <SoundOptionsCard
        title={t("simpleTimer.soundSignals")}
        options={[
          {
            key: "start",
            label: t("simpleTimer.signalStart"),
            value: optStart,
            onChange: setOptStart,
          },
          {
            key: "work",
            label: t("simpleTimer.signalWork"),
            value: optWork,
            onChange: setOptWork,
          },
          {
            key: "rest",
            label: t("simpleTimer.signalRest"),
            value: optRest,
            onChange: setOptRest,
          },
          {
            key: "end",
            label: t("simpleTimer.signalEnd"),
            value: optEnd,
            onChange: setOptEnd,
          },
          {
            key: "tts",
            label: t("simpleTimer.ttsVoice"),
            value: optTts,
            onChange: setOptTts,
          },
        ]}
      />
    </div>
  );
}

// ============== Page ==============

export default function SimpleTimerPage() {
  const { t } = useI18n();
  const [tab, setTab] = React.useState("countdown");

  return (
    <MobileShell>
      <PageHeader
        title={t("simpleTimer.title")}
        right={
          <Link
            href="/builder"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          >
            {t("simpleTimer.openBuilder")}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="countdown" className="text-xs">
              {t("simpleTimer.countdown")}
            </TabsTrigger>
            <TabsTrigger value="stopwatch" className="text-xs">
              {t("simpleTimer.stopwatch")}
            </TabsTrigger>
            <TabsTrigger value="intervals" className="text-xs">
              {t("simpleTimer.intervals")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="countdown" className="mt-4">
            <CountdownTab />
          </TabsContent>
          <TabsContent value="stopwatch" className="mt-4">
            <StopwatchTab />
          </TabsContent>
          <TabsContent value="intervals" className="mt-4">
            <IntervalsTab />
          </TabsContent>
        </Tabs>
      </div>
    </MobileShell>
  );
}
