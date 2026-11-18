"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCompoundExercises,
  getCompoundRoutines,
} from "@/lib/local-storage";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  ChevronRight,
  Clock,
  ListChecks,
  Target,
  BookOpen,
  Layers,
  CheckCircle2,
  Dumbbell,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Exercise, CompoundType } from "@/lib/types";
import type { CompoundRoutine } from "@/lib/data/compound-meta";

// ====== Constants ======

type FilterKey = "all" | "full-body" | "upper-body" | "lower-body" | "core";

const FILTER_OPTIONS: { key: FilterKey; labelKey: DictKey }[] = [
  { key: "all", labelKey: "ex.filter.all" },
  { key: "full-body", labelKey: "compound.fullBody" },
  { key: "upper-body", labelKey: "compound.upperBody" },
  { key: "lower-body", labelKey: "compound.lowerBody" },
  { key: "core", labelKey: "compound.coreType" },
];

// Цвет плашки compound score: 8-10 emerald, 5-7 amber, 1-4 muted
function scoreBadgeClass(score: number): string {
  if (score >= 8) {
    return "bg-emerald-500/15 text-emerald-500 border-emerald-500/40";
  }
  if (score >= 5) {
    return "bg-amber-500/15 text-amber-500 border-amber-500/40";
  }
  return "bg-muted text-muted-foreground border-border";
}

// Badge типа: FULL_BODY=primary red, UPPER_BODY=orange, LOWER_BODY=emerald, CORE=amber
function typeBadgeClass(type: CompoundType | null | undefined): string {
  switch (type) {
    case "full-body":
      return "bg-primary/15 text-primary border-primary/40";
    case "upper-body":
      return "bg-orange-500/15 text-orange-500 border-orange-500/40";
    case "lower-body":
      return "bg-emerald-500/15 text-emerald-500 border-emerald-500/40";
    case "core":
      return "bg-amber-500/15 text-amber-500 border-amber-500/40";
    case "cardio":
      return "bg-red-500/15 text-red-500 border-red-500/40";
    case "isolation":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function typeLabelKey(type: CompoundType | null | undefined): DictKey | null {
  switch (type) {
    case "full-body":
      return "compound.fullBody";
    case "upper-body":
      return "compound.upperBody";
    case "lower-body":
      return "compound.lowerBody";
    case "core":
      return "compound.coreType";
    default:
      return null;
  }
}

const GOAL_LABELS: Record<CompoundRoutine["goal"], DictKey> = {
  strength: "compound.goal.strength",
  hypertrophy: "compound.goal.hypertrophy",
  "fat-loss": "compound.goal.fatLoss",
  mobility: "compound.goal.mobility",
  athletic: "compound.goal.athletic",
};

const LEVEL_LABELS: Record<CompoundRoutine["level"], DictKey> = {
  beginner: "compound.level.beginner",
  intermediate: "compound.level.intermediate",
  advanced: "compound.level.advanced",
};

const GOAL_COLOR: Record<CompoundRoutine["goal"], string> = {
  strength: "bg-red-500/15 text-red-500 border-red-500/40",
  hypertrophy: "bg-purple-500/15 text-purple-500 border-purple-500/40",
  "fat-loss": "bg-orange-500/15 text-orange-500 border-orange-500/40",
  mobility: "bg-cyan-500/15 text-cyan-500 border-cyan-500/40",
  athletic: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40",
};

const LEVEL_COLOR: Record<CompoundRoutine["level"], string> = {
  beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40",
  intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/40",
  advanced: "bg-red-500/15 text-red-500 border-red-500/40",
};

// ====== Helpers ======

function exerciseName(ex: Exercise, locale: "ru" | "en"): string {
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

function routineName(r: CompoundRoutine, locale: "ru" | "en"): string {
  return locale === "ru" ? r.nameRu : r.nameEn;
}

function routineDesc(r: CompoundRoutine, locale: "ru" | "en"): string {
  return locale === "ru" ? r.descriptionRu : r.descriptionEn;
}

function routineBenefits(r: CompoundRoutine, locale: "ru" | "en"): string[] {
  return locale === "ru" ? r.benefitsRu : r.benefitsEn;
}

// ====== Main component ======

function CompoundPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [filter, setFilter] = React.useState<FilterKey>("all");

  // Все упражнения с compound-метаданными (localStorage)
  const allExercises = React.useMemo<Exercise[]>(
    () => getCompoundExercises(100) as Exercise[],
    [],
  );

  // Минимальные программы (localStorage)
  const routines = React.useMemo(() => getCompoundRoutines(), []);

  // Lookup-карта slug → exercise для accordion'а рутины
  const exerciseBySlug = React.useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of allExercises) {
      map.set(ex.slug, ex);
    }
    return map;
  }, [allExercises]);

  // Применяем активный фильтр клиентом (но можем и через API —
  // клиентская фильтрация дешевле для UX и не дёргает сеть при смене чипа).
  const filteredTop = React.useMemo(() => {
    if (filter === "all") return allExercises;
    return allExercises.filter((e) => e.compoundType === filter);
  }, [allExercises, filter]);

  // Топ-10 для показа
  const topExercises = filteredTop.slice(0, 10);

  return (
    <MobileShell>
      <PageHeader
        title={t("compound.title")}
        subtitle={t("compound.subtitle")}
        right={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            aria-label={t("common.back")}
            className="min-h-[44px] min-w-[44px] h-11 w-11"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />

      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Intro */}
        <section>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("compound.intro")}
            </p>
          </div>
        </section>

        {/* ====== Section 1: Top compound exercises ====== */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">
              {t("compound.topExercises")}
            </h2>
          </div>

          {/* Filter chips */}
          <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
            <div className="flex items-center gap-2 w-max pb-1">
              {FILTER_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.key}
                  active={filter === opt.key}
                  onClick={() => setFilter(opt.key)}
                  label={t(opt.labelKey)}
                />
              ))}
            </div>
          </div>

          {/* Top list */}
          {topExercises.length === 0 ? (
            <EmptyState text={t("compound.empty")} />
          ) : (
            <div className="space-y-2">
              {topExercises.map((ex) => (
                <TopExerciseCard key={ex.slug} exercise={ex} />
              ))}
            </div>
          )}
        </section>

        {/* ====== Section 2: Minimal routines ====== */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">
              {t("compound.routines")}
            </h2>
          </div>

          {routines.length === 0 ? (
            <EmptyState text={t("compound.empty")} />
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {routines.map((r) => (
                <RoutineCard
                  key={r.slug}
                  routine={r}
                  exerciseBySlug={exerciseBySlug}
                />
              ))}
            </Accordion>
          )}
        </section>

        {/* ====== Section 3: Science card ====== */}
        <section>
          <Card className="p-3 gap-3 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-semibold text-sm">
                  {t("compound.science")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("compound.scienceText")}
                </p>
                <Link
                  href="/knowledge/theory/training-concepts"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline touch-manipulation min-h-[44px] py-2"
                >
                  <span>{t("compound.readMore")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        </section>

        {/* ====== CTA: Create workout ====== */}
        <section>
          <Link
            href="/builder"
            className="block touch-manipulation"
            aria-label={t("compound.createWorkout")}
          >
            <Card className="p-3 flex items-center justify-between hover:border-primary/50 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">
                    {t("compound.createWorkout")}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {t("builder.title")}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Card>
          </Link>
        </section>
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 h-9 px-3.5 rounded-full text-xs font-medium border transition-colors touch-manipulation min-h-[44px] flex items-center",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:bg-accent/50",
      )}
    >
      {label}
    </button>
  );
}

function TopExerciseCard({ exercise }: { exercise: Exercise }) {
  const { t, locale } = useI18n();
  const name = exerciseName(exercise, locale);
  const score = exercise.compoundScore ?? 0;
  const muscleCount = exercise.muscleGroupsCount ?? 0;
  const typeLabel = typeLabelKey(exercise.compoundType);

  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className="block touch-manipulation"
      aria-label={name}
    >
      <Card className="p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          {/* Compound score — большая цифра */}
          <div
            className={cn(
              "h-12 w-12 shrink-0 rounded-lg border flex flex-col items-center justify-center font-bold tabular-nums",
              scoreBadgeClass(score),
            )}
            aria-label={t("compound.score")}
          >
            <span className="text-lg leading-none">{score}</span>
            <span className="text-[9px] font-medium uppercase tracking-wide mt-0.5">
              {t("compound.score")}
            </span>
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">
              {name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge
                variant="outline"
                className={cn("border text-[10px]", typeBadgeClass(exercise.compoundType))}
              >
                {typeLabel ? t(typeLabel) : "—"}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border">
                {muscleCount} {t("compound.muscles")}
              </Badge>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </Card>
    </Link>
  );
}

function RoutineCard({
  routine,
  exerciseBySlug,
}: {
  routine: CompoundRoutine;
  exerciseBySlug: Map<string, Exercise>;
}) {
  const { t, locale } = useI18n();
  const name = routineName(routine, locale);
  const desc = routineDesc(routine, locale);
  const benefits = routineBenefits(routine, locale);

  return (
    <Card className="p-0 overflow-hidden">
      <AccordionItem value={routine.slug} className="border-b-0">
        <AccordionTrigger className="px-3 py-3 hover:no-underline min-h-[44px]">
          <div className="flex-1 min-w-0 text-left pr-2">
            <h3 className="font-semibold text-sm leading-tight">{name}</h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge
                variant="outline"
                className={cn("border text-[10px]", GOAL_COLOR[routine.goal])}
              >
                {t(GOAL_LABELS[routine.goal])}
              </Badge>
              <Badge
                variant="outline"
                className={cn("border text-[10px]", LEVEL_COLOR[routine.level])}
              >
                {t(LEVEL_LABELS[routine.level])}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border">
                <Clock className="h-3 w-3" />
                {t("compound.durationMin", { n: routine.durationMin })}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border">
                <ListChecks className="h-3 w-3" />
                {t("compound.exercisesCount", { n: routine.exercisesCount })}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-snug">
              {desc}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3 pt-1">
          {/* Coverage */}
          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 mb-3">
            <p className="text-xs text-emerald-500 font-medium">
              {t("compound.muscleGroupsCovered", { n: routine.totalMuscleGroups })}
            </p>
          </div>

          {/* Exercise list */}
          <ol className="space-y-1.5 mb-3">
            {routine.exerciseSlugs.map((slug, idx) => {
              const ex = exerciseBySlug.get(slug);
              const exName = ex
                ? exerciseName(ex, locale)
                : slug;
              return (
                <li key={slug}>
                  {ex ? (
                    <Link
                      href={`/exercises/${slug}`}
                      className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-accent/50 touch-manipulation min-h-[44px]"
                    >
                      <span className="h-6 w-6 shrink-0 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold flex items-center justify-center tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="text-sm flex-1 truncate">{exName}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 py-1.5 px-2 -mx-2 min-h-[44px]">
                      <span className="h-6 w-6 shrink-0 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold flex items-center justify-center tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="text-sm flex-1 truncate text-muted-foreground">
                        {exName}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Benefits */}
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              {t("compound.benefits")}
            </p>
            <ul className="space-y-1">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}

// (SkeletonList and ErrorState removed for offline build)

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
        <Layers className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// (ErrorState removed for offline build)

// ====== Page export ======

export default function CompoundPageWrapper() {
  return <CompoundPage />;
}
