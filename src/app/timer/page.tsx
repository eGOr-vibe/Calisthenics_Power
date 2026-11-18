"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  ArrowLeftRight,
  SkipForward,
  Check,
  Plus,
  X,
  ChevronRight,
  Trophy,
  Clock,
  Sparkles,
  Brain,
  ListChecks,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useWorkoutTimer,
  PREPARE_SECONDS,
} from "@/hooks/use-timer";
import { useTts } from "@/hooks/use-tts";
import { useVoiceControl } from "@/hooks/use-voice-control";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { calcTotalStress, formatTime } from "@/lib/biomech";
import type {
  Exercise,
  Technique,
  WorkoutFormat,
  WorkoutItem,
  SubstitutionRecord,
  WorkoutSessionItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const WORKOUT_CONFIG_KEY = "cp_workout_config";

const TYPE_STRIPE: Record<string, string> = {
  pull: "bg-red-500",
  push: "bg-orange-500",
  core: "bg-amber-500",
  legs: "bg-emerald-500",
  static: "bg-purple-500",
  mobility: "bg-slate-500",
};

const TYPE_LABEL_KEY: Record<string, DictKey> = {
  pull: "ex.type.pull",
  push: "ex.type.push",
  core: "ex.type.core",
  legs: "ex.type.legs",
  static: "ex.type.static",
  mobility: "ex.type.mobility",
};

const FORMAT_LABEL_KEY: Record<WorkoutFormat, DictKey> = {
  amrap: "format.amrap",
  emom: "format.emom",
  tabata: "format.tabata",
  interval: "format.interval",
};

// ====== Config type (from sessionStorage) ======

interface WorkoutConfig {
  format: WorkoutFormat;
  durationSec: number;
  rounds: number;
  workSec: number;
  restSec: number;
  items: WorkoutItem[];
}

// ====== Helpers ======

function exerciseName(ex: Exercise | undefined, locale: "ru" | "en"): string {
  if (!ex) return "?";
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

function muscleList(ex: Exercise, locale: "ru" | "en"): string[] {
  return locale === "ru" ? ex.targetMusclesRu : ex.targetMusclesEn;
}

function techniqueName(t: Technique, locale: "ru" | "en"): string {
  return locale === "ru" ? t.nameRu : t.nameEn;
}

function techniqueDescription(t: Technique, locale: "ru" | "en"): string {
  const full = locale === "ru" ? t.descriptionRu : t.descriptionEn;
  // Берём максимум 2 строки / ~140 символов — чтобы подсказка была короткой.
  const firstSentence = full.split(/(?<=[.!?])\s+/)[0] ?? full;
  if (firstSentence.length <= 140) return firstSentence;
  return firstSentence.slice(0, 137).trimEnd() + "...";
}

function readConfigFromSession(): WorkoutConfig | null {
  try {
    const raw = sessionStorage.getItem(WORKOUT_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutConfig;
    if (!parsed.format || !Array.isArray(parsed.items)) return null;
    if (parsed.items.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ====== Substitution API ======

interface SubstituteApiResponse {
  oldExercise: Exercise;
  newExercise: Exercise;
  kDifficulty: number;
  oldReps: number;
  newReps: number;
  diffCoef: number;
  stressDelta: number;
  direction: "easier" | "harder" | "same";
}

// ====== Exercise card in round ======

interface ExerciseCardProps {
  item: WorkoutItem;
  exercise: Exercise | undefined;
  progress: number;
  done: boolean;
  skipped: boolean;
  locale: "ru" | "en";
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  onTap: () => void;
  onIncrement: () => void;
  onVoiceInput?: () => void;
  voiceInputSupported?: boolean;
  listening?: boolean;
  isActive: boolean;
}

function ExerciseCard({
  item,
  exercise,
  progress,
  done,
  skipped,
  locale,
  t,
  onTap,
  onIncrement,
  onVoiceInput,
  voiceInputSupported,
  listening,
  isActive,
}: ExerciseCardProps) {
  const target = exercise?.type === "static" ? item.durationSec : item.reps;
  const isStatic = exercise?.type === "static";
  const pct = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
  const completed = done || (target > 0 && progress >= target);
  const isListening = Boolean(listening);

  return (
    <button
      type="button"
      onClick={onTap}
      aria-busy={isListening}
      className={cn(
        "relative w-full text-left rounded-xl border bg-card overflow-hidden transition-all active:scale-[0.99]",
        isActive && "ring-2 ring-primary",
        isListening && "ring-2 ring-destructive animate-pulse",
        completed && "opacity-70",
        skipped && "opacity-50"
      )}
    >
      <div className="flex items-stretch">
        <div
          className={cn(
            "w-1.5 shrink-0",
            exercise ? TYPE_STRIPE[exercise.type] : "bg-muted-foreground/30"
          )}
        />
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {completed ? (
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : skipped ? (
              <SkipForward className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <Clock className="h-4 w-4 text-primary shrink-0" />
            )}
            <span
              className={cn(
                "font-medium text-sm truncate flex-1",
                completed && "line-through"
              )}
            >
              {exerciseName(exercise, locale)}
            </span>
            <span className="text-sm font-bold tabular-nums shrink-0">
              {progress}/{target}
            </span>
            {!completed && !skipped && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onIncrement();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onIncrement();
                  }
                }}
                aria-label="+1"
                className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </span>
            )}
            {!completed && !skipped && voiceInputSupported && onVoiceInput && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onVoiceInput();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onVoiceInput();
                  }
                }}
                aria-label={t("timer.voiceInput.hint")}
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-md transition-all shrink-0 cursor-pointer min-h-[44px] min-w-[44px] -mr-1",
                  isListening
                    ? "bg-destructive/15 text-destructive"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 active:scale-95"
                )}
              >
                <Mic className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-[10px] py-0">
              {t("subst.coef")} {exercise?.loadCoef ?? "?"}
            </Badge>
            {exercise && (
              <span className="text-[11px] text-muted-foreground">
                {t(TYPE_LABEL_KEY[exercise.type])}
                {isStatic ? ` · ${t("builder.sec")}` : ""}
              </span>
            )}
          </div>
          {!skipped && (
            <Progress value={pct} className="h-1" />
          )}
        </div>
      </div>
      {isListening && (
        <div className="absolute inset-0 bg-background/85 flex items-center justify-center gap-2 backdrop-blur-sm">
          <Mic className="h-5 w-5 text-destructive animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {t("timer.voiceInput.listening")}
          </span>
        </div>
      )}
    </button>
  );
}

// ====== Pre-set technique cue card ======

interface PresetCueCardProps {
  technique: Technique;
  locale: "ru" | "en";
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  visible: boolean;
  onShowAll: () => void;
}

function PresetCueCard({
  technique,
  locale,
  t,
  visible,
  onShowAll,
}: PresetCueCardProps) {
  const Icon = technique.category === "mental" ? Brain : Sparkles;
  return (
    <div
      className={cn(
        "transition-all duration-300 overflow-hidden",
        visible
          ? "opacity-100 translate-y-0 max-h-[200px]"
          : "opacity-0 -translate-y-2 max-h-0"
      )}
    >
      <Card className="border-primary/50 bg-primary/5 p-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md bg-primary/15">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-primary/80 font-semibold">
              {t("timer.preset.title")}
            </div>
            <div className="font-semibold text-sm leading-tight mt-0.5 text-foreground">
              {techniqueName(technique, locale)}
            </div>
            <p className="text-[12px] text-muted-foreground leading-snug mt-1">
              {techniqueDescription(technique, locale)}
            </p>
          </div>
          <button
            type="button"
            onClick={onShowAll}
            aria-label={t("timer.preset.allTechniques")}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline min-h-[44px] px-2 -mr-1"
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {t("timer.preset.allTechniques")}
            </span>
          </button>
        </div>
      </Card>
    </div>
  );
}

// ====== All techniques sheet (opens from preset cue) ======

function AllTechniquesSheet({
  open,
  onOpenChange,
  techniques,
  locale,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  techniques: Technique[];
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>{t("timer.preset.allTechniques")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("timer.preset.allTechniques")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {techniques.map((tech) => {
            const Icon = tech.category === "mental" ? Brain : Sparkles;
            return (
              <Card key={tech.slug} className="p-3 flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight">
                    {techniqueName(tech, locale)}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug mt-1">
                    {techniqueDescription(tech, locale)}
                  </p>
                </div>
              </Card>
            );
          })}
          {techniques.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("ex.empty")}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


// ====== Card action sheet (tap on card → Substitute/Skip/MarkDone) ======

function CardActionSheet({
  open,
  onOpenChange,
  exercise,
  locale,
  onSubstitute,
  onSkip,
  onMarkDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercise: Exercise | undefined;
  locale: "ru" | "en";
  onSubstitute: () => void;
  onSkip: () => void;
  onMarkDone: () => void;
}) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="truncate">
            {exercise ? exerciseName(exercise, locale) : ""}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("timer.tapToReplace")}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onSubstitute();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors min-h-[52px]"
          >
            <ArrowLeftRight className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm font-medium">{t("timer.substitute")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onSkip();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors min-h-[52px]"
          >
            <SkipForward className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">{t("timer.skip")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onMarkDone();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors min-h-[52px]"
          >
            <Check className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-medium">{t("timer.markDone")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ====== Substitute list sheet ======

interface SubstituteListSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentExercise: Exercise | undefined;
  alternatives: Exercise[];
  allExercises: Exercise[];
  locale: "ru" | "en";
  onPick: (alt: Exercise) => void;
}

function SubstituteListSheet({
  open,
  onOpenChange,
  currentExercise,
  alternatives,
  allExercises,
  locale,
  onPick,
}: SubstituteListSheetProps) {
  const { t } = useI18n();
  const [search, setSearch] = React.useState("");

  const list = React.useMemo(() => {
    if (!currentExercise) return [];
    const sameType = allExercises.filter(
      (e) =>
        e.type === currentExercise.type && e.slug !== currentExercise.slug
    );
    const merged = new Map<string, Exercise>();
    for (const a of alternatives) merged.set(a.slug, a);
    for (const s of sameType) merged.set(s.slug, s);
    let arr = Array.from(merged.values());
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (e) =>
          e.nameRu.toLowerCase().includes(q) ||
          e.nameEn.toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q)
      );
    }
    return arr.sort((a, b) => a.loadCoef - b.loadCoef);
  }, [currentExercise, alternatives, allExercises, search]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="truncate">{t("subst.title")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("subst.sortHint")}
          </SheetDescription>
        </SheetHeader>

        {currentExercise && (
          <div className="px-4 pb-2">
            <div className="rounded-lg border bg-card p-2 flex items-center gap-2">
              <div
                className={cn(
                  "w-1.5 self-stretch rounded-full",
                  TYPE_STRIPE[currentExercise.type]
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase text-muted-foreground">
                  {t("subst.current")}
                </div>
                <div className="font-medium text-sm truncate">
                  {exerciseName(currentExercise, locale)}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                K {currentExercise.loadCoef}
              </Badge>
            </div>
          </div>
        )}

        <div className="px-4 pb-2">
          <Input
            type="search"
            inputMode="search"
            placeholder={t("builder.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          <div className="text-[10px] uppercase text-muted-foreground py-1">
            {t("subst.sortHint")}
          </div>
          {list.map((alt) => (
            <button
              key={alt.slug}
              type="button"
              onClick={() => {
                onOpenChange(false);
                onPick(alt);
              }}
              className="w-full text-left"
            >
              <Card className="p-3 flex items-center gap-3 hover:border-primary/50 transition-colors active:scale-[0.99]">
                <div
                  className={cn(
                    "w-1.5 self-stretch rounded-full",
                    TYPE_STRIPE[alt.type]
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {exerciseName(alt, locale)}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {muscleList(alt, locale).slice(0, 3).join(" · ")}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    currentExercise &&
                      alt.loadCoef < currentExercise.loadCoef &&
                      "border-emerald-500/40 text-emerald-500",
                    currentExercise &&
                      alt.loadCoef > currentExercise.loadCoef &&
                      "border-red-500/40 text-red-500"
                  )}
                >
                  K {alt.loadCoef}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </button>
          ))}
          {list.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("ex.empty")}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ====== Substitute preview dialog ======

interface PreviewState {
  loading: boolean;
  data: SubstituteApiResponse | null;
  error: string | null;
}

function SubstitutePreviewDialog({
  open,
  onOpenChange,
  oldExercise,
  newExercise,
  oldReps,
  rounds,
  locale,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  oldExercise: Exercise | undefined;
  newExercise: Exercise | undefined;
  oldReps: number;
  rounds: number;
  locale: "ru" | "en";
  onApply: (result: SubstituteApiResponse) => void;
}) {
  const { t } = useI18n();
  const [preview, setPreview] = React.useState<PreviewState>({
    loading: false,
    data: null,
    error: null,
  });

  React.useEffect(() => {
    if (!open || !oldExercise || !newExercise) return;
    let cancelled = false;
    setPreview({ loading: true, data: null, error: null });
    (async () => {
      try {
        const res = await fetch("/api/calc/substitute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldSlug: oldExercise.slug,
            newSlug: newExercise.slug,
            reps: oldReps,
            rounds,
          }),
        });
        if (!res.ok) throw new Error("substitute calc failed");
        const data = (await res.json()) as SubstituteApiResponse;
        if (!cancelled) {
          setPreview({ loading: false, data, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setPreview({
            loading: false,
            data: null,
            error: e instanceof Error ? e.message : "unknown",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, oldExercise, newExercise, oldReps, rounds]);

  const diffPct = React.useMemo(() => {
    if (!preview.data) return 0;
    const old = preview.data.oldExercise.loadCoef * oldReps * rounds;
    if (old === 0) return 0;
    const diff = preview.data.stressDelta;
    return Math.round((Math.abs(diff) / old) * 100);
  }, [preview.data, oldReps, rounds]);

  const direction = preview.data?.direction ?? "same";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>{t("subst.preview")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("subst.preview")}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-3">
          {oldExercise && newExercise && (
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium truncate">
                  {exerciseName(oldExercise, locale)}
                </span>
                <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium truncate text-primary">
                  {exerciseName(newExercise, locale)}
                </span>
              </div>
            </div>
          )}

          {preview.loading && (
            <div className="py-6 flex justify-center">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}

          {preview.error && (
            <div className="py-6 text-center text-sm text-destructive">
              {t("common.error")}
            </div>
          )}

          {preview.data && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("subst.coef")}</span>
                <span className="font-medium tabular-nums">
                  {preview.data.oldExercise.loadCoef} →{" "}
                  {preview.data.newExercise.loadCoef}
                  <span
                    className={cn(
                      "ml-2 text-xs",
                      direction === "easier"
                        ? "text-emerald-500"
                        : direction === "harder"
                          ? "text-red-500"
                          : "text-muted-foreground"
                    )}
                  >
                    {direction === "easier"
                      ? t("subst.diffDown", { pct: diffPct })
                      : direction === "harder"
                        ? t("subst.diffUp", { pct: diffPct })
                        : ""}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("subst.volume")}</span>
                <span className="font-medium tabular-nums">
                  {preview.data.oldReps} → {preview.data.newReps}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("subst.stressDelta")}
                </span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    preview.data.stressDelta < 0
                      ? "text-emerald-500"
                      : preview.data.stressDelta > 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                  )}
                >
                  {preview.data.stressDelta > 0 ? "+" : ""}
                  {preview.data.stressDelta}
                </span>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground">
                  {t("subst.targetMuscles")}
                </div>
                <div className="text-xs">
                  {muscleList(preview.data.oldExercise, locale).join(", ")}
                </div>
                <div className="text-[10px] uppercase text-muted-foreground pt-1">
                  →
                </div>
                <div className="text-xs">
                  {muscleList(preview.data.newExercise, locale).join(", ")}
                </div>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => onOpenChange(false)}
          >
            {t("subst.cancel")}
          </Button>
          <Button
            className="flex-1 h-11"
            disabled={!preview.data}
            onClick={() => {
              if (preview.data) {
                onApply(preview.data);
                onOpenChange(false);
              }
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            {t("subst.apply")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ====== Done view ======

interface DoneViewProps {
  format: WorkoutFormat;
  totalRounds: number;
  totalReps: number;
  totalVolume: number;
  durationSec: number;
  substitutionsCount: number;
  substitutions: SubstitutionRecord[];
  sessionItems: WorkoutSessionItem[];
  onDone: () => void;
}

function DoneView({
  format,
  totalRounds,
  totalReps,
  totalVolume,
  durationSec,
  substitutionsCount,
  substitutions,
  sessionItems,
  onDone,
}: DoneViewProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [feeling, setFeeling] = React.useState(7);
  const [notes, setNotes] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/workouts/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          durationSec,
          totalRounds,
          totalReps,
          totalVolume,
          substitutions,
          items: sessionItems,
          feelingRating: feeling,
          notes: notes || null,
        }),
      });
      if (!res.ok) throw new Error("save session failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "recent"] });
      toast({ title: t("timer.savedSession") });
      setSaved(true);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  return (
    <MobileShell hasBottomPadding={false}>
      <div className="flex-1 px-4 py-4 space-y-4 pb-24">
        <div className="text-center pt-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-3">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{t("timer.finished")}</h2>
        </div>

        <Card className="p-3 border-primary/40 bg-primary/5">
          <div className="grid grid-cols-2 gap-3">
            <StatBlock label={t("timer.totalRounds")} value={String(totalRounds)} />
            <StatBlock label={t("timer.totalReps")} value={String(totalReps)} />
            <StatBlock label={t("timer.totalVolume")} value={String(totalVolume)} />
            <StatBlock
              label={t("timer.duration")}
              value={formatTime(durationSec)}
            />
          </div>
          {substitutionsCount > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t("timer.substitutions")}
              </span>
              <Badge variant="secondary">{substitutionsCount}</Badge>
            </div>
          )}
        </Card>

        {!saved ? (
          <>
            <Card className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase text-muted-foreground">
                  {t("timer.feelingRating")}
                </Label>
                <span className="text-2xl font-bold tabular-nums text-primary">
                  {feeling}
                </span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[feeling]}
                onValueChange={(v) => setFeeling(v[0])}
                className="min-h-[44px]"
              />
              <Label
                htmlFor="notes"
                className="text-xs uppercase text-muted-foreground"
              >
                {t("timer.notesLabel")}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("timer.notesLabel")}
                className="min-h-[80px]"
              />
            </Card>

            <Button
              className="w-full h-12"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? t("timer.saving") : t("timer.saveSession")}
            </Button>
          </>
        ) : (
          <Button variant="outline" className="w-full h-12" onClick={onDone}>
            {t("common.close")}
          </Button>
        )}
      </div>
    </MobileShell>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold tabular-nums text-primary">{value}</div>
      <div className="text-[10px] uppercase text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

// ====== Main timer page ======

export default function TimerPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { toast } = useToast();

  // ====== Load config (client-only) ======
  const [config, setConfig] = React.useState<WorkoutConfig | null>(null);
  const [configLoaded, setConfigLoaded] = React.useState(false);

  React.useEffect(() => {
    const cfg = readConfigFromSession();
    setConfig(cfg);
    setConfigLoaded(true);
    if (!cfg) {
      router.replace("/builder");
    }
  }, [router]);

  // ====== Load profile (for ttsEnabled / voiceControl defaults) ======
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: configLoaded && config !== null,
  });

  const profile = profileQuery.data;
  const ttsEnabled = profile?.ttsEnabled ?? true;
  const showPresets = profile?.showPresets ?? true;

  // ====== Load techniques (cns + mental) for pre-set cue ======
  const techniquesQuery = useQuery({
    queryKey: ["techniques", { categories: ["cns", "mental"] }],
    queryFn: async () => {
      const res = await fetch("/api/techniques");
      if (!res.ok) return [] as Technique[];
      const data = (await res.json()) as Technique[];
      return data.filter(
        (tech) => tech.category === "cns" || tech.category === "mental"
      );
    },
    enabled: configLoaded && config !== null,
  });
  const cueTechniques = techniquesQuery.data ?? [];

  // ====== Load all exercises (for names/coefs and substitution list) ======
  const exercisesQuery = useQuery({
    queryKey: ["exercises", { forTimer: true }],
    queryFn: async () => {
      const res = await fetch("/api/exercises");
      if (!res.ok) throw new Error("fetch exercises failed");
      return (await res.json()) as Exercise[];
    },
    enabled: configLoaded && config !== null,
  });

  // ====== State (after config is loaded) ======
  const [workoutItems, setWorkoutItems] = React.useState<WorkoutItem[]>([]);
  const [itemsProgress, setItemsProgress] = React.useState<number[]>([]);
  const [itemsDone, setItemsDone] = React.useState<boolean[]>([]);
  const [itemsSkipped, setItemsSkipped] = React.useState<boolean[]>([]);
  const [substitutions, setSubstitutions] = React.useState<SubstitutionRecord[]>(
    []
  );
  const [roundsCompleted, setRoundsCompleted] = React.useState(0);
  const [voiceControlOn, setVoiceControlOn] = React.useState(false);
  const [voiceInitedFromProfile, setVoiceInitedFromProfile] =
    React.useState(false);
  const [stopDialogOpen, setStopDialogOpen] = React.useState(false);
  const [cardActionFor, setCardActionFor] = React.useState<number | null>(null);
  const [substListFor, setSubstListFor] = React.useState<number | null>(null);
  const [previewFor, setPreviewFor] = React.useState<{
    itemIndex: number;
    newExercise: Exercise;
  } | null>(null);
  const [showDone, setShowDone] = React.useState(false);
  const [savedSessionData, setSavedSessionData] = React.useState<{
    format: WorkoutFormat;
    totalRounds: number;
    totalReps: number;
    totalVolume: number;
    durationSec: number;
    substitutionsCount: number;
    substitutions: SubstitutionRecord[];
    sessionItems: WorkoutSessionItem[];
  } | null>(null);

  // ====== Pre-set cue state ======
  const [presetTechnique, setPresetTechnique] = React.useState<Technique | null>(
    null
  );
  const [presetVisible, setPresetVisible] = React.useState(false);
  const [allTechniquesOpen, setAllTechniquesOpen] = React.useState(false);
  const presetHideTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // ====== Voice input state ======
  const [listeningFor, setListeningFor] = React.useState<number | null>(null);


  // Init workoutItems from config once.
  React.useEffect(() => {
    if (!config) return;
    setWorkoutItems(config.items);
    setItemsProgress(new Array(config.items.length).fill(0));
    setItemsDone(new Array(config.items.length).fill(false));
    setItemsSkipped(new Array(config.items.length).fill(false));
  }, [config]);

  // Voice control default follows profile once loaded.
  React.useEffect(() => {
    if (profileQuery.data && !voiceInitedFromProfile) {
      setVoiceControlOn(Boolean(profile?.voiceControl));
      setVoiceInitedFromProfile(true);
    }
  }, [profileQuery.data, profile?.voiceControl, voiceInitedFromProfile]);

  const exercises = exercisesQuery.data ?? [];

  // ====== Timer hook ======
  const timerConfig = React.useMemo(() => {
    if (!config)
      return {
        format: "amrap" as WorkoutFormat,
        durationSec: 0,
        rounds: 0,
        workSec: 0,
        restSec: 0,
      };
    if (config.format === "tabata") {
      return {
        format: config.format,
        durationSec: config.durationSec,
        rounds: 8,
        workSec: 20,
        restSec: 10,
      };
    }
    return {
      format: config.format,
      durationSec: config.durationSec,
      rounds: config.rounds,
      workSec: config.workSec,
      restSec: config.restSec,
    };
  }, [config]);

  // ====== TTS ======
  const tts = useTts({ locale, enabled: ttsEnabled });

  // ====== Voice input (single-shot number recognition) ======
  const voiceInput = useVoiceInput({ locale });

  // ====== Timer ======
  const timer = useWorkoutTimer(timerConfig, {
    onPrepareEnd: () => {
      tts.speak(locale === "ru" ? "Пошёл" : "Go", { interrupt: true });
    },
    onRoundStart: (round) => {
      if (round >= 1) {
        tts.speak(
          locale === "ru" ? `Круг ${round}` : `Round ${round}`,
          { interrupt: true }
        );
        setItemsProgress((arr) => arr.map(() => 0));
        setItemsDone((arr) => arr.map(() => false));
        setItemsSkipped((arr) => arr.map(() => false));
      }
    },
    onTenSecLeft: () => {
      tts.speak(locale === "ru" ? "10 секунд" : "10 seconds", {
        interrupt: false,
      });
    },
    onRestStart: () => {
      tts.speak(locale === "ru" ? "Отдых" : "Rest", { interrupt: true });
    },
    onPhaseChange: (phase) => {
      if (phase === "paused") {
        tts.speak(locale === "ru" ? "Пауза" : "Pause", { interrupt: true });
      }
    },
    onFinish: () => {
      tts.speak(
        locale === "ru" ? "Тренировка завершена" : "Workout complete",
        { interrupt: true }
      );
    },
  });

  // ====== Auto-pause on tab hide ======
  React.useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        if (
          timer.started &&
          (timer.phase === "working" ||
            timer.phase === "resting" ||
            timer.phase === "preparing")
        ) {
          timer.pause();
        }
      } else {
        if (timer.phase === "paused") {
          toast({ title: t("timer.autoPaused") });
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [timer.phase, timer.started]);

  // ====== Pre-set cue: trigger on round change ======
  React.useEffect(() => {
    if (!showPresets) return;
    if (timer.phase !== "working") return;
    if (timer.currentRound < 1) return;
    if (cueTechniques.length === 0) return;

    // Pick a random CNS/mental technique.
    const idx = Math.floor(Math.random() * cueTechniques.length);
    const tech = cueTechniques[idx];
    if (!tech) return;

    if (presetHideTimerRef.current) {
      clearTimeout(presetHideTimerRef.current);
      presetHideTimerRef.current = null;
    }
    setPresetTechnique(tech);
    setPresetVisible(true);
    presetHideTimerRef.current = setTimeout(() => {
      setPresetVisible(false);
    }, 3000);

    return () => {
      if (presetHideTimerRef.current) {
        clearTimeout(presetHideTimerRef.current);
        presetHideTimerRef.current = null;
      }
    };
  }, [timer.currentRound, timer.phase, showPresets, cueTechniques.length]);

  // ====== Voice control ======
  const handleNextRound = React.useCallback(() => {
    if (timer.phase === "preparing" || timer.phase === "finished") return;
    setRoundsCompleted((r) => r + 1);
    timer.nextRound();
    setItemsProgress((arr) => arr.map(() => 0));
    setItemsDone((arr) => arr.map(() => false));
    setItemsSkipped((arr) => arr.map(() => false));
  }, [timer]);

  const voice = useVoiceControl({
    locale,
    enabled: voiceControlOn,
    onPause: () => {
      if (
        timer.phase === "working" ||
        timer.phase === "resting" ||
        timer.phase === "preparing"
      ) {
        timer.pause();
      }
    },
    onResume: () => {
      if (timer.phase === "paused") timer.resume();
      else if (timer.phase === "preparing") timer.start();
    },
    onStop: () => {
      setStopDialogOpen(true);
    },
    onNext: () => {
      handleNextRound();
    },
    onSubstitute: () => {
      const idx = itemsDone.findIndex((d, i) => !d && !itemsSkipped[i]);
      if (idx >= 0) setCardActionFor(idx);
    },
  });

  // ====== Item actions ======
  const handleIncrement = (idx: number) => {
    setItemsProgress((arr) => {
      const next = [...arr];
      next[idx] = (next[idx] ?? 0) + 1;
      const ex = exercises.find(
        (e) => e.slug === workoutItems[idx].exerciseSlug
      );
      const target =
        ex?.type === "static"
          ? workoutItems[idx].durationSec
          : workoutItems[idx].reps;
      if (next[idx] >= target) {
        setItemsDone((dArr) => {
          const d = [...dArr];
          d[idx] = true;
          return d;
        });
      }
      return next;
    });
  };

  const handleCardTap = (idx: number) => {
    setCardActionFor(idx);
  };

  const handleSkip = (idx: number) => {
    setItemsSkipped((arr) => {
      const next = [...arr];
      next[idx] = true;
      return next;
    });
    toast({
      title: `${t("timer.skip")}: ${exerciseName(
        exercises.find((e) => e.slug === workoutItems[idx].exerciseSlug),
        locale
      )}`,
    });
  };

  const handleMarkDone = (idx: number) => {
    setItemsDone((arr) => {
      const next = [...arr];
      next[idx] = true;
      return next;
    });
    setItemsProgress((arr) => {
      const next = [...arr];
      const ex = exercises.find(
        (e) => e.slug === workoutItems[idx].exerciseSlug
      );
      const target =
        ex?.type === "static"
          ? workoutItems[idx].durationSec
          : workoutItems[idx].reps;
      next[idx] = target;
      return next;
    });
  };

  // ====== Voice input for reps (single-shot) ======
  const handleVoiceInput = (idx: number) => {
    if (!voiceInput.supported) {
      toast({ title: t("timer.voiceInput.notSupported") });
      return;
    }
    // If currently listening for another card — cancel that.
    if (listeningFor !== null && listeningFor !== idx) {
      voiceInput.cancel();
    }
    setListeningFor(idx);
    // TTS cue: "Сколько повторений?"
    tts.speak(
      locale === "ru" ? "Сколько повторений?" : "How many reps?",
      { interrupt: true }
    );
    voiceInput.startListening(
      (n) => {
        setListeningFor(null);
        if (n === null || n < 0) {
          tts.speak(
            locale === "ru"
              ? t("timer.voiceInput.notRecognized")
              : t("timer.voiceInput.notRecognized"),
            { interrupt: true }
          );
          toast({ title: t("timer.voiceInput.notRecognized") });
          return;
        }
        const capped = Math.max(0, Math.min(100, Math.round(n)));
        // Compute target so we can mark done if capped >= target.
        const ex = exercises.find(
          (e) => e.slug === workoutItems[idx]?.exerciseSlug
        );
        const target =
          ex?.type === "static"
            ? workoutItems[idx]?.durationSec ?? 0
            : workoutItems[idx]?.reps ?? 0;
        setItemsProgress((arr) => {
          const next = [...arr];
          next[idx] = capped;
          return next;
        });
        if (target > 0 && capped >= target) {
          setItemsDone((arr) => {
            const next = [...arr];
            next[idx] = true;
            return next;
          });
        }
        const msg = t("timer.voiceInput.recorded", { n: capped });
        tts.speak(msg, { interrupt: true });
        toast({ title: msg });
      },
      (err) => {
        setListeningFor(null);
        if (err === "not-allowed" || err === "service-not-allowed") {
          toast({
            title: t("timer.voiceInput.notSupported"),
            variant: "destructive",
          });
        } else if (err !== "no-speech" && err !== "aborted") {
          toast({ title: t("timer.voiceInput.notRecognized") });
        }
      }
    );
  };

  // ====== Substitute flow ======
  const handleSubstitutePick = (alt: Exercise) => {
    if (substListFor === null) return;
    setPreviewFor({ itemIndex: substListFor, newExercise: alt });
    setSubstListFor(null);
  };

  const handleSubstituteApply = (result: SubstituteApiResponse) => {
    if (!previewFor) return;
    const idx = previewFor.itemIndex;
    const oldSlug = workoutItems[idx].exerciseSlug;
    const oldExName = exerciseName(result.oldExercise, locale);
    const newExName = exerciseName(result.newExercise, locale);

    setWorkoutItems((arr) => {
      const next = [...arr];
      next[idx] = {
        exerciseSlug: result.newExercise.slug,
        reps: result.newReps,
        durationSec: result.newExercise.type === "static" ? result.newReps : 0,
      };
      return next;
    });
    setItemsProgress((arr) => {
      const next = [...arr];
      next[idx] = 0;
      return next;
    });
    setItemsDone((arr) => {
      const next = [...arr];
      next[idx] = false;
      return next;
    });
    setSubstitutions((arr) => [
      ...arr,
      {
        fromSlug: oldSlug,
        toSlug: result.newExercise.slug,
        reason: null,
        diffCoef: result.diffCoef,
        oldReps: result.oldReps,
        newReps: result.newReps,
        roundIndex: timer.currentRound,
      },
    ]);
    toast({
      title: t("subst.appliedToast", {
        from: oldExName,
        to: newExName,
        oldReps: result.oldReps,
        newReps: result.newReps,
      }),
    });
    setPreviewFor(null);
  };

  // ====== Stop & save session ======
  const handleConfirmStop = () => {
    setStopDialogOpen(false);
    timer.finish();

    if (!config) return;
    const completedRounds =
      config.format === "amrap"
        ? Math.max(roundsCompleted, timer.currentRound - 1, 0)
        : Math.min(timer.currentRound, timer.maxRounds);

    const totalReps = workoutItems.reduce((sum, it, idx) => {
      const ex = exercises.find((e) => e.slug === it.exerciseSlug);
      if (!ex) return sum;
      const target = ex.type === "static" ? it.durationSec : it.reps;
      const skipFactor = itemsSkipped[idx] ? 0 : 1;
      return (
        sum + target * Math.max(0, completedRounds - 1) + (skipFactor ? target : 0)
      );
    }, 0);

    const totalVolume = calcTotalStress(
      workoutItems,
      exercises,
      Math.max(1, completedRounds)
    );

    const sessionItems: WorkoutSessionItem[] = workoutItems.map((it) => {
      const ex = exercises.find((e) => e.slug === it.exerciseSlug);
      const reps = ex?.type === "static" ? it.durationSec : it.reps;
      return {
        exerciseSlug: it.exerciseSlug,
        reps,
        rounds: completedRounds,
        volume: (ex?.loadCoef ?? 0) * reps * completedRounds,
      };
    });

    setSavedSessionData({
      format: config.format,
      totalRounds: completedRounds,
      totalReps,
      totalVolume,
      durationSec: timer.totalElapsedSec,
      substitutionsCount: substitutions.length,
      substitutions,
      sessionItems,
    });
    setShowDone(true);
  };

  // ====== Render ======
  if (!configLoaded) {
    return (
      <MobileShell>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-10 w-32" />
        </div>
      </MobileShell>
    );
  }

  if (!config) {
    return (
      <MobileShell>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
          <p className="text-sm text-muted-foreground">{t("builder.empty")}</p>
          <Button onClick={() => router.push("/builder")}>
            {t("builder.title")}
          </Button>
        </div>
      </MobileShell>
    );
  }

  if (showDone && savedSessionData) {
    return (
      <DoneView
        format={savedSessionData.format}
        totalRounds={savedSessionData.totalRounds}
        totalReps={savedSessionData.totalReps}
        totalVolume={savedSessionData.totalVolume}
        durationSec={savedSessionData.durationSec}
        substitutionsCount={savedSessionData.substitutionsCount}
        substitutions={savedSessionData.substitutions}
        sessionItems={savedSessionData.sessionItems}
        onDone={() => {
          try {
            sessionStorage.removeItem(WORKOUT_CONFIG_KEY);
            localStorage.removeItem("cp_active_workout");
          } catch {
            /* noop */
          }
          router.replace("/");
        }}
      />
    );
  }

  // ====== Active timer view ======
  const currentExerciseIdx = itemsDone.findIndex(
    (d, i) => !d && !itemsSkipped[i]
  );

  // Progress for the timer bar (0-100)
  const progressPct = (() => {
    if (timer.phase === "preparing") {
      return ((PREPARE_SECONDS - timer.remainingSec) / PREPARE_SECONDS) * 100;
    }
    if (config.format === "amrap") {
      return Math.min(100, (timer.elapsedSec / config.durationSec) * 100);
    }
    const total = timer.phase === "resting" ? timer.restSec : timer.workSec;
    if (total <= 0) return 0;
    return ((total - timer.remainingSec) / total) * 100;
  })();

  const displayTime = (() => {
    if (config.format === "amrap") {
      return formatTime(timer.elapsedSec);
    }
    if (timer.phase === "preparing") {
      return String(Math.max(0, timer.remainingSec));
    }
    return formatTime(Math.max(0, timer.remainingSec));
  })();

  const subtitleKey: DictKey =
    timer.phase === "preparing"
      ? "timer.preparing"
      : timer.phase === "resting"
        ? "timer.rest"
        : timer.phase === "paused"
          ? "timer.workoutPaused"
          : config.format === "amrap"
            ? "timer.elapsed"
            : "timer.remaining";

  const bgTint =
    timer.phase === "resting"
      ? "bg-emerald-950/20"
      : timer.phase === "paused"
        ? "bg-amber-950/20"
        : timer.phase === "preparing"
          ? "bg-primary/5"
          : "bg-background";

  const notStarted = !timer.started;

  return (
    <MobileShell hasBottomPadding={false}>
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border",
          bgTint
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 safe-top">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2"
            onClick={() => setStopDialogOpen(true)}
          >
            <X className="h-4 w-4 mr-1" />
            {t("timer.stop")}
          </Button>
          <div className="text-center min-w-0 flex-1">
            <div className="text-xs uppercase text-muted-foreground">
              {t(FORMAT_LABEL_KEY[config.format])}
            </div>
            <div className="font-bold text-sm tabular-nums">
              {t("timer.round")} {timer.currentRound}
              {config.format !== "amrap" && `/${timer.maxRounds}`}
            </div>
          </div>
          <div className="w-[60px] text-right">
            {voice.supported && (
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9", voiceControlOn && "text-primary")}
                aria-label={t("settings.voiceControl")}
                onClick={() => setVoiceControlOn((v) => !v)}
              >
                {voiceControlOn ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className={cn("flex-1 flex flex-col", bgTint)}>
        {/* Pre-set cue (top, between header and timer) */}
        {showPresets && presetTechnique && (
          <div className="px-4 pt-3">
            <PresetCueCard
              technique={presetTechnique}
              locale={locale}
              t={t}
              visible={presetVisible}
              onShowAll={() => setAllTechniquesOpen(true)}
            />
          </div>
        )}

        {/* Timer display */}
        <div className="px-4 pt-6 pb-4 text-center">
          <div className="text-xs uppercase text-muted-foreground mb-1">
            {t(subtitleKey)}
          </div>
          <div className="text-7xl font-bold tabular-nums tracking-tight text-foreground">
            {displayTime}
          </div>
          <div className="mt-4 px-4">
            <Progress value={progressPct} className="h-1.5" />
          </div>
          {timer.phase === "preparing" && notStarted && (
            <Button
              className="mt-6 h-12 px-8"
              size="lg"
              onClick={() => timer.start()}
            >
              <Play className="h-5 w-5 mr-1" />
              {t("timer.ready")}
            </Button>
          )}
          {timer.phase === "paused" && (
            <Button
              className="mt-6 h-12 px-8"
              size="lg"
              onClick={() => timer.resume()}
            >
              <Play className="h-5 w-5 mr-1" />
              {t("timer.resume")}
            </Button>
          )}
        </div>

        {/* Exercise list */}
        <div className="px-4 pt-2 pb-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs uppercase text-muted-foreground">
              {t("builder.exercises")}
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {t("timer.tapToReplace")}
            </span>
          </div>
          {workoutItems.map((item, idx) => {
            const ex = exercises.find((e) => e.slug === item.exerciseSlug);
            return (
              <ExerciseCard
                key={`${item.exerciseSlug}-${idx}`}
                item={item}
                exercise={ex}
                progress={itemsProgress[idx] ?? 0}
                done={itemsDone[idx] ?? false}
                skipped={itemsSkipped[idx] ?? false}
                locale={locale}
                t={t}
                onTap={() => handleCardTap(idx)}
                onIncrement={() => handleIncrement(idx)}
                onVoiceInput={() => handleVoiceInput(idx)}
                voiceInputSupported={voiceInput.supported}
                listening={listeningFor === idx}
                isActive={idx === currentExerciseIdx}
              />
            );
          })}
        </div>

        {/* Next round button */}
        {timer.phase !== "preparing" && timer.phase !== "finished" && (
          <div className="px-4 pb-3">
            <Button
              variant="outline"
              className="w-full h-11 border-dashed"
              onClick={handleNextRound}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("timer.nextRound")}
            </Button>
          </div>
        )}
      </div>

      {/* Sticky controls */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-background/95 backdrop-blur border-t border-border safe-bottom">
        <div className="flex items-center justify-center gap-3 p-3">
          {timer.phase === "paused" ? (
            <Button
              size="lg"
              className="h-14 w-14 rounded-full p-0"
              onClick={() => timer.resume()}
              aria-label={t("timer.resume")}
            >
              <Play className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="h-14 w-14 rounded-full p-0"
              onClick={() => timer.pause()}
              disabled={timer.phase === "preparing" && notStarted}
              aria-label={t("timer.pause")}
            >
              <Pause className="h-6 w-6" />
            </Button>
          )}
          <Button
            size="lg"
            variant="destructive"
            className="h-14 w-14 rounded-full p-0"
            onClick={() => setStopDialogOpen(true)}
            aria-label={t("timer.stop")}
          >
            <Square className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Card action sheet */}
      <CardActionSheet
        open={cardActionFor !== null}
        onOpenChange={(v) => !v && setCardActionFor(null)}
        exercise={
          cardActionFor !== null
            ? exercises.find(
                (e) => e.slug === workoutItems[cardActionFor]?.exerciseSlug
              )
            : undefined
        }
        locale={locale}
        onSubstitute={() => {
          if (cardActionFor !== null) {
            setSubstListFor(cardActionFor);
            setCardActionFor(null);
          }
        }}
        onSkip={() => {
          if (cardActionFor !== null) handleSkip(cardActionFor);
        }}
        onMarkDone={() => {
          if (cardActionFor !== null) handleMarkDone(cardActionFor);
        }}
      />

      {/* Substitute list sheet */}
      <SubstituteListSheet
        open={substListFor !== null}
        onOpenChange={(v) => !v && setSubstListFor(null)}
        currentExercise={
          substListFor !== null
            ? exercises.find(
                (e) => e.slug === workoutItems[substListFor]?.exerciseSlug
              )
            : undefined
        }
        alternatives={
          substListFor !== null
            ? (() => {
                const cur = exercises.find(
                  (e) => e.slug === workoutItems[substListFor]?.exerciseSlug
                );
                if (!cur) return [];
                return cur.alternatives
                  .map((slug) => exercises.find((e) => e.slug === slug))
                  .filter((e): e is Exercise => Boolean(e));
              })()
            : []
        }
        allExercises={exercises}
        locale={locale}
        onPick={(alt) => handleSubstitutePick(alt)}
      />

      {/* Substitute preview */}
      <SubstitutePreviewDialog
        open={previewFor !== null}
        onOpenChange={(v) => !v && setPreviewFor(null)}
        oldExercise={
          previewFor
            ? exercises.find(
                (e) =>
                  e.slug === workoutItems[previewFor.itemIndex]?.exerciseSlug
              )
            : undefined
        }
        newExercise={previewFor?.newExercise}
        oldReps={
          previewFor
            ? (() => {
                const it = workoutItems[previewFor.itemIndex];
                const ex = exercises.find((e) => e.slug === it.exerciseSlug);
                return ex?.type === "static" ? it.durationSec : it.reps;
              })()
            : 0
        }
        rounds={1}
        locale={locale}
        onApply={(result) => handleSubstituteApply(result)}
      />

      {/* Stop confirm dialog */}
      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("timer.confirmStop")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("timer.confirmStopDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("timer.no")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStop}>
              {t("timer.yes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* All techniques sheet (opens from pre-set cue) */}
      <AllTechniquesSheet
        open={allTechniquesOpen}
        onOpenChange={setAllTechniquesOpen}
        techniques={cueTechniques}
        locale={locale}
      />
    </MobileShell>
  );
}
