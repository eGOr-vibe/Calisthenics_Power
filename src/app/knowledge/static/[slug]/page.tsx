"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Check,
  Lock,
  Target,
  BookOpen,
  Dumbbell,
  Quote,
  Plus,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { StaticElementIcon } from "@/components/static-element-icon";
import type {
  StaticElement,
  StaticElementSlug,
  ProgressionStep,
  ProgressionState,
  Exercise,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Helpers ======

function elementName(
  el: Pick<StaticElement, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? el.nameRu : el.nameEn;
}

function elementDesc(
  el: Pick<StaticElement, "descriptionRu" | "descriptionEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? el.descriptionRu : el.descriptionEn;
}

function stepName(
  s: Pick<ProgressionStep, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? s.nameRu : s.nameEn;
}

function stepDesc(
  s: Pick<ProgressionStep, "descriptionRu" | "descriptionEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? s.descriptionRu : s.descriptionEn;
}

function stepGateNotes(
  s: Pick<ProgressionStep, "gateNotesRu" | "gateNotesEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? s.gateNotesRu : s.gateNotesEn;
}

function stepTraining(
  s: Pick<ProgressionStep, "trainingRu" | "trainingEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? s.trainingRu : s.trainingEn;
}

function exerciseName(
  ex: Pick<Exercise, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

function isRepsGate(s: ProgressionStep): boolean {
  return (!s.gateSec || s.gateSec <= 0) && !!s.gateReps && s.gateReps > 0;
}

function formatBestDate(iso: string | null, locale: "ru" | "en"): string {
  if (!iso || iso === new Date(0).toISOString()) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

// ====== Default state (used when no progression row exists yet) ======

function defaultProgression(slug: StaticElementSlug): ProgressionState {
  return {
    id: "default",
    elementSlug: slug,
    currentStep: 1,
    bestHoldSec: 0,
    bestHoldDate: null,
    passedSteps: [],
    notes: null,
    updatedAt: new Date(0).toISOString(),
  };
}

// ====== Main component ======

export default function StaticDetailPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug ?? "") as StaticElementSlug;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Загружаем сам элемент.
  const elementQuery = useQuery({
    queryKey: ["static-elements", slug],
    queryFn: async () => {
      const res = await fetch(`/api/static-elements/${slug}`);
      if (!res.ok) throw new Error("static-element fetch failed");
      return (await res.json()) as StaticElement;
    },
    enabled: !!slug,
  });

  // Прогрессия пользователя по этому элементу.
  const progressionQuery = useQuery({
    queryKey: ["progression", slug],
    queryFn: async () => {
      const res = await fetch(`/api/progression/${slug}`);
      if (!res.ok) throw new Error("progression fetch failed");
      return (await res.json()) as ProgressionState;
    },
    enabled: !!slug,
  });

  // Список упражнений — для разрешения slug'ов assistanceExercises в имена.
  const exercisesQuery = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const res = await fetch("/api/exercises");
      if (!res.ok) throw new Error("exercises fetch failed");
      return (await res.json()) as Exercise[];
    },
  });

  const exercisesBySlug = React.useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of exercisesQuery.data ?? []) {
      map.set(ex.slug, ex);
    }
    return map;
  }, [exercisesQuery.data]);

  const element = elementQuery.data;
  const progression = progressionQuery.data ?? defaultProgression(slug);
  const name = element ? elementName(element, locale) : "";

  const currentStep: ProgressionStep | undefined = element?.steps.find(
    (s) => s.order === progression.currentStep,
  );

  // Мутация сохранения попытки.
  const saveAttemptMutation = useMutation({
    mutationFn: async (payload: {
      currentStep?: number;
      bestHoldSec?: number;
      bestHoldDate?: string | null;
      passedSteps?: number[];
    }) => {
      const res = await fetch(`/api/progression/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("progression update failed");
      return (await res.json()) as ProgressionState;
    },
    onSuccess: (data, vars) => {
      // Инвалидируем кэш прогрессии (используется и в списке, и тут).
      queryClient.invalidateQueries({ queryKey: ["progression", slug] });
      queryClient.invalidateQueries({ queryKey: ["progression"] });

      if (!currentStep) {
        setDialogOpen(false);
        return;
      }

      const isReps = isRepsGate(currentStep);
      const gate = isReps
        ? currentStep.gateReps ?? 0
        : currentStep.gateSec ?? 0;
      const value =
        typeof vars.bestHoldSec === "number" ? vars.bestHoldSec : 0;
      const passed = value >= gate && gate > 0;

      if (passed) {
        toast({
          title: t("static.congrats", { n: currentStep.order }),
          description: t("static.saved", { sec: value }),
        });
      } else {
        toast({
          title: t("static.saved", { sec: value }),
          description: t("static.needMore", { sec: Math.max(0, gate - value) }),
        });
      }
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: t("common.error"), variant: "destructive" });
    },
  });

  const handleSaveAttempt = (raw: string) => {
    if (!currentStep) return;
    const value = parseInt(raw, 10);
    if (!Number.isFinite(value) || value < 0) return;

    const passedSet = new Set(progression.passedSteps);
    const alreadyPassed = passedSet.has(currentStep.order);
    const gate = isRepsGate(currentStep)
      ? currentStep.gateReps ?? 0
      : currentStep.gateSec ?? 0;
    const passedNow = gate > 0 && value >= gate && !alreadyPassed;

    const newPassed = passedSet.add(currentStep.order);
    const newPassedArr = Array.from(newPassed).sort((a, b) => a - b);

    const totalSteps = element?.steps.length ?? 5;
    const nextStep = Math.min(currentStep.order + 1, totalSteps);

    const newBest = Math.max(progression.bestHoldSec ?? 0, value);

    saveAttemptMutation.mutate({
      bestHoldSec: newBest,
      bestHoldDate: new Date().toISOString(),
      passedSteps: newPassedArr,
      currentStep: passedNow ? nextStep : progression.currentStep,
    });
  };

  const isLoading =
    elementQuery.isLoading || progressionQuery.isLoading || !element;
  const isError =
    elementQuery.isError || progressionQuery.isError || !element;

  return (
    <MobileShell showBottomNav={false}>
      {/* Sticky header with back button */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border safe-top">
        <div className="flex items-center gap-2 px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/knowledge/static")}
            aria-label={t("common.back")}
            className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-base leading-tight truncate flex-1 min-w-0">
            {name}
          </h1>
          {element && (
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <StaticElementIcon
                icon={element.icon}
                className="h-6 w-6 text-primary"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-4 pb-32">
        {isLoading ? (
          <SkeletonDetail />
        ) : isError ? (
          <ErrorState
            onRetry={() => {
              elementQuery.refetch();
              progressionQuery.refetch();
            }}
            onBack={() => router.push("/knowledge/static")}
          />
        ) : element ? (
          <>
            {/* Description */}
            <section className="space-y-1">
              <p className="text-sm leading-relaxed text-foreground/90">
                {elementDesc(element, locale)}
              </p>
            </section>

            {/* Timeline of steps */}
            <section className="space-y-0">
              {element.steps.map((step, idx) => {
                const passed = progression.passedSteps.includes(step.order);
                const isCurrent = step.order === progression.currentStep;
                const isLocked = step.order > progression.currentStep;
                const isLast = idx === element.steps.length - 1;
                return (
                  <TimelineStep
                    key={step.slug}
                    step={step}
                    passed={passed}
                    isCurrent={isCurrent}
                    isLocked={isLocked}
                    isLast={isLast}
                    exercisesBySlug={exercisesBySlug}
                    locale={locale}
                    t={t}
                  />
                );
              })}
            </section>

            {/* Progress card */}
            <Card className="p-3 gap-3 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("static.progress")}
                </h3>
              </div>
              <ProgressRow
                label={t("static.current")}
                value={
                  <>
                    <span className="font-semibold tabular-nums">
                      {progression.currentStep}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      {t("static.of")} {element.steps.length}
                    </span>
                  </>
                }
              />
              <ProgressRow
                label={t("static.bestHold")}
                value={
                  <>
                    <span className="font-semibold tabular-nums">
                      {progression.bestHoldSec}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      {t("static.sec")}
                    </span>
                    <span className="text-muted-foreground/70 ml-2">
                      {formatBestDate(progression.bestHoldDate, locale)}
                    </span>
                  </>
                }
              />
              <ProgressRow
                label={t("static.passed")}
                value={
                  <span className="font-semibold tabular-nums">
                    {progression.passedSteps.length}/{element.steps.length}
                  </span>
                }
              />
              <Progress
                value={
                  element.steps.length > 0
                    ? Math.round(
                        (progression.passedSteps.length /
                          element.steps.length) *
                          100,
                      )
                    : 0
                }
                className="h-1.5"
              />
            </Card>
          </>
        ) : null}
      </div>

      {/* Sticky bottom bar with Record button */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-md border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-bottom">
        <div className="p-3">
          <Button
            className="w-full h-12 text-base font-semibold shadow-lg"
            onClick={() => setDialogOpen(true)}
            disabled={!currentStep || saveAttemptMutation.isPending}
          >
            {saveAttemptMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            <span>{t("static.record")}</span>
          </Button>
        </div>
      </footer>

      {/* Attempt dialog */}
      <AttemptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        step={currentStep}
        locale={locale}
        t={t}
        isPending={saveAttemptMutation.isPending}
        onSave={handleSaveAttempt}
      />
    </MobileShell>
  );
}

// ====== Sub-components ======

type TFunc = (
  key: DictKey,
  vars?: Record<string, string | number>,
) => string;

function TimelineStep({
  step,
  passed,
  isCurrent,
  isLocked,
  isLast,
  exercisesBySlug,
  locale,
  t,
}: {
  step: ProgressionStep;
  passed: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  isLast: boolean;
  exercisesBySlug: Map<string, Exercise>;
  locale: "ru" | "en";
  t: TFunc;
}) {
  const reps = isRepsGate(step);
  const gateValue = reps ? step.gateReps ?? 0 : step.gateSec ?? 0;
  const gateLabel = reps
    ? t("static.gateReps", { reps: gateValue })
    : t("static.gateSec", { sec: gateValue });

  const circleClass = passed
    ? "bg-emerald-500 text-white border-emerald-500"
    : isCurrent
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-muted text-muted-foreground border-border";

  return (
    <div className="relative pl-10">
      {/* Vertical connector */}
      {!isLast && (
        <div
          className="absolute top-7 bottom-0 left-[18px] w-px bg-border"
          aria-hidden="true"
        />
      )}

      {/* Step number circle */}
      <div
        className={cn(
          "absolute top-1 left-1 h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
          circleClass,
        )}
      >
        {passed ? <Check className="h-4 w-4" /> : step.order}
      </div>

      {/* Card */}
      <Card
        className={cn(
          "p-3 gap-3 mb-3",
          isLocked && "opacity-60",
        )}
      >
        {/* Header: name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight">
              {stepName(step, locale)}
            </h3>
          </div>
          {passed ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/15 text-emerald-500 shrink-0"
            >
              <Check className="h-3 w-3" />
              {t("static.passedStatus")}
            </Badge>
          ) : isCurrent ? (
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/15 text-primary shrink-0"
            >
              {t("static.current")}
            </Badge>
          ) : isLocked ? (
            <Badge
              variant="outline"
              className="border-border text-muted-foreground shrink-0"
            >
              <Lock className="h-3 w-3" />
              {t("static.locked")}
            </Badge>
          ) : null}
        </div>

        {/* Description */}
        {stepDesc(step, locale).trim() !== "" && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {stepDesc(step, locale)}
          </p>
        )}

        {/* Gate requirement (large badge) */}
        <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("static.gate")}
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {gateLabel}
            </div>
          </div>
        </div>

        {/* Gate notes */}
        {stepGateNotes(step, locale).trim() !== "" && (
          <Card className="p-3 gap-1.5 border-border bg-card/50">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {t("static.gateNotes")}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-foreground/90">
              {stepGateNotes(step, locale)}
            </p>
          </Card>
        )}

        {/* Training recommendations */}
        {stepTraining(step, locale).trim() !== "" && (
          <div className="space-y-1">
            <SectionLabel icon={<Dumbbell className="h-3.5 w-3.5 text-primary" />}>
              {t("static.training")}
            </SectionLabel>
            <p className="text-xs leading-relaxed text-foreground/90">
              {stepTraining(step, locale)}
            </p>
          </div>
        )}

        {/* Assistance exercises */}
        {step.assistanceExercises.length > 0 && (
          <div className="space-y-1.5">
            <SectionLabel icon={<Dumbbell className="h-3.5 w-3.5 text-primary" />}>
              {t("static.assistance")}
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {step.assistanceExercises.map((exSlug) => {
                const ex = exercisesBySlug.get(exSlug);
                const exLabel = ex ? exerciseName(ex, locale) : exSlug;
                return (
                  <Link
                    key={exSlug}
                    href={`/exercises/${exSlug}`}
                    className="touch-manipulation"
                  >
                    <Badge
                      variant="outline"
                      className="border-border text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {exLabel}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Sources */}
        {step.sources && step.sources.length > 0 && (
          <div className="space-y-1">
            <SectionLabel icon={<Quote className="h-3.5 w-3.5 text-primary" />}>
              {t("static.sources")}
            </SectionLabel>
            <ul className="space-y-0.5">
              {step.sources.map((src, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground leading-snug pl-3 relative"
                >
                  <span className="absolute left-0 top-0.5 text-muted-foreground/60">
                    ·
                  </span>
                  {src}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center">{value}</span>
    </div>
  );
}

function AttemptDialog({
  open,
  onOpenChange,
  step,
  locale,
  t,
  isPending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step?: ProgressionStep;
  locale: "ru" | "en";
  t: TFunc;
  isPending: boolean;
  onSave: (raw: string) => void;
}) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (open) setValue("");
  }, [open, step?.slug]);

  if (!step) return null;
  const reps = isRepsGate(step);
  const gateValue = reps ? step.gateReps ?? 0 : step.gateSec ?? 0;
  const gateLabel = reps
    ? t("static.gateReps", { reps: gateValue })
    : t("static.gateSec", { sec: gateValue });
  const unitLabel = reps ? t("static.reps") : t("static.sec");
  const inputMode = reps ? "numeric" : "numeric";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === "") return;
    onSave(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("static.attemptTitle")}</DialogTitle>
          <DialogDescription>
            {stepName(step, locale)}
            {" — "}
            {gateLabel}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("static.attemptDesc")}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="attempt-value">
              {reps ? t("static.reps") : t("static.bestHold")} ({unitLabel})
            </Label>
            <Input
              id="attempt-value"
              type="number"
              inputMode={inputMode}
              min={0}
              step={1}
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              className="h-12 text-lg tabular-nums"
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 min-h-[44px]"
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 min-h-[44px]"
              disabled={isPending || value.trim() === ""}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t("static.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

function ErrorState({
  onRetry,
  onBack,
}: {
  onRetry: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("static.notFound")}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.back")}</span>
        </Button>
        <Button variant="outline" onClick={onRetry} className="min-h-[44px]">
          {t("common.retry")}
        </Button>
      </div>
    </div>
  );
}
