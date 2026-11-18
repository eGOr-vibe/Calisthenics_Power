"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  Plus,
  ChevronRight,
  Target,
  ListChecks,
  Quote,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type {
  Exercise,
  ExerciseType,
  LevelBase,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Types ======

type ExerciseDetail = Omit<Exercise, "alternatives"> & {
  alternatives: Exercise[];
};

// ====== Constants ======

const TYPE_COLORS: Record<ExerciseType, string> = {
  pull: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  push: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  core: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  legs: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  static: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  mobility: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
};

const TYPE_GRADIENT: Record<ExerciseType, string> = {
  pull: "from-blue-600/30 via-blue-900/20 to-background",
  push: "from-orange-600/30 via-orange-900/20 to-background",
  core: "from-purple-600/30 via-purple-900/20 to-background",
  legs: "from-emerald-600/30 via-emerald-900/20 to-background",
  static: "from-amber-600/30 via-amber-900/20 to-background",
  mobility: "from-cyan-600/30 via-cyan-900/20 to-background",
};

const LEVEL_COLORS: Record<LevelBase, string> = {
  beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-500 border-red-500/30",
};

// ====== Helpers ======

function loadCoefColor(coef: number): string {
  if (coef <= 2) return "text-emerald-500";
  if (coef <= 5) return "text-amber-500";
  return "text-red-500";
}

function loadCoefBg(coef: number): string {
  if (coef <= 2) return "bg-emerald-500/10 border-emerald-500/30";
  if (coef <= 5) return "bg-amber-500/10 border-amber-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function exerciseName(
  ex: Pick<Exercise, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

function exerciseDescription(
  ex: Pick<Exercise, "descriptionRu" | "descriptionEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? ex.descriptionRu : ex.descriptionEn;
}

function exerciseHowTo(
  ex: Pick<Exercise, "howToRu" | "howToEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? ex.howToRu : ex.howToEn;
}

function exerciseScience(
  ex: Pick<Exercise, "scienceRu" | "scienceEn">,
  locale: "ru" | "en",
): string | null {
  const v = locale === "ru" ? ex.scienceRu : ex.scienceEn;
  return v && v.trim() !== "" ? v : null;
}

function exerciseMuscles(
  ex: Pick<Exercise, "targetMusclesRu" | "targetMusclesEn">,
  locale: "ru" | "en",
): string[] {
  return locale === "ru" ? ex.targetMusclesRu : ex.targetMusclesEn;
}

function levelLabel(
  level: LevelBase,
  sub: 1 | 2 | 3,
  t: (k: DictKey) => string,
): string {
  const base = t(`level.${level}` as DictKey);
  return sub > 1 ? `${base}+${sub - 1}` : base;
}

function parseSteps(text: string): string[] {
  // Split by newlines, trim, filter empty
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length > 1) return lines;
  // If single line, try to split by ". " or "; " into steps
  if (lines.length === 1) {
    return lines[0]
      .split(/(?<=\.)\s+|;\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
}

// ====== Main component ======

export default function ExerciseDetailPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const query = useQuery({
    queryKey: ["exercise", slug],
    queryFn: async () => {
      const res = await fetch(`/api/exercises/${encodeURIComponent(slug)}`);
      if (!res.ok) {
        throw new Error("exercise fetch failed");
      }
      return (await res.json()) as ExerciseDetail;
    },
    enabled: Boolean(slug),
  });

  const ex = query.data;

  // --- Render ---

  const name = ex ? exerciseName(ex, locale) : "";

  return (
    <MobileShell>
      {/* Sticky header with back button */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border safe-top">
        <div className="flex items-center gap-2 px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label={t("common.back")}
            className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-base leading-tight truncate flex-1 min-w-0">
            {name}
          </h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-4">
        {query.isLoading ? (
          <SkeletonDetail />
        ) : query.isError || !ex ? (
          <ErrorState
            onRetry={() => query.refetch()}
            onBack={() => router.push("/exercises")}
          />
        ) : (
          <>
            {/* Hero card with exercise name */}
            <div
              className={cn(
                "relative w-full rounded-2xl overflow-hidden border border-border bg-gradient-to-br p-6 flex flex-col items-center justify-center min-h-[140px]",
                TYPE_GRADIENT[ex.type],
              )}
            >
              <div className="absolute top-3 left-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "border bg-background/80 backdrop-blur text-xs",
                    TYPE_COLORS[ex.type],
                  )}
                >
                  {t(`ex.type.${ex.type}` as DictKey)}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "border bg-background/80 backdrop-blur text-xs font-bold",
                    "text-foreground",
                  )}
                >
                  K {ex.loadCoef}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold leading-tight text-center text-foreground px-4 mt-6">
                {exerciseName(ex, locale)}
              </h2>
            </div>

            {/* Level + equipment badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn("border", LEVEL_COLORS[ex.levelBase])}
              >
                {levelLabel(ex.levelBase, ex.levelSub, t)}
              </Badge>
              {ex.equipment.map((eq) => (
                <Badge key={eq} variant="outline" className="border-border">
                  {t(`eq.${eq}` as DictKey)}
                </Badge>
              ))}
            </div>

            {/* Load coefficient — big card */}
            <Card
              className={cn(
                "p-4 gap-2 border-2 items-center text-center",
                loadCoefBg(ex.loadCoef),
              )}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("ex.loadCoef")}
              </div>
              <div
                className={cn(
                  "text-6xl font-bold tabular-nums leading-none",
                  loadCoefColor(ex.loadCoef),
                )}
              >
                {ex.loadCoef}
              </div>
              <div className="text-[11px] text-muted-foreground">
                1 — 9
              </div>
            </Card>

            {/* Target muscles */}
            <Section
              icon={<Target className="h-4 w-4 text-primary" />}
              title={t("ex.targetMuscles")}
            >
              <div className="flex flex-wrap gap-1.5">
                {exerciseMuscles(ex, locale).map((m) => (
                  <Badge key={m} variant="secondary" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </Section>

            {/* Vectors */}
            {ex.vectors.length > 0 && (
              <Section title={t("ex.vectors")}>
                <div className="flex flex-wrap gap-1.5">
                  {ex.vectors.map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="border-primary/30 text-primary"
                    >
                      {t(`vector.${v}` as DictKey)}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {/* Description */}
            {exerciseDescription(ex, locale).trim() !== "" && (
              <Section title="">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {exerciseDescription(ex, locale)}
                </p>
              </Section>
            )}

            {/* How to perform */}
            {exerciseHowTo(ex, locale).trim() !== "" && (
              <Section
                icon={<ListChecks className="h-4 w-4 text-primary" />}
                title={t("ex.howTo")}
              >
                <StepsList text={exerciseHowTo(ex, locale)} />
              </Section>
            )}

            {/* Why this way (science) */}
            {exerciseScience(ex, locale) && (
              <Card className="p-3 gap-2 border-2 border-primary/40 bg-primary/5">
                <SectionHeader
                  icon={<BookOpen className="h-4 w-4 text-primary" />}
                  title={t("ex.why")}
                />
                <p className="text-sm leading-relaxed text-foreground/90">
                  {exerciseScience(ex, locale)}
                </p>
              </Card>
            )}

            {/* Sources */}
            {ex.sources && ex.sources.length > 0 && (
              <Section title={t("ex.sources")}>
                <ul className="space-y-1.5">
                  {ex.sources.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <Quote className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Alternatives */}
            {ex.alternatives.length > 0 && (
              <Section title={t("ex.alternatives")}>
                <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
                  <div className="flex items-stretch gap-2 w-max pb-1">
                    {ex.alternatives.map((alt) => (
                      <AlternativeCard key={alt.slug} exercise={alt} />
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Sticky add-to-workout button */}
            <div className="sticky bottom-24 z-30 px-0 pt-2 pb-2">
              <Button
                className="w-full h-12 shadow-lg"
                onClick={() =>
                  toast({
                    title: t("ex.add"),
                    description:
                      locale === "ru"
                        ? "Скоро: добавление в конструктор"
                        : "Soon: add to workout builder",
                  })
                }
              >
                <Plus className="h-5 w-5" />
                <span>{t("ex.add")}</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function Section({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title && <SectionHeader icon={icon} title={title} />}
      {children}
    </section>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon ?? <span className="w-1 h-4 bg-primary rounded-full" />}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

function StepsList({ text }: { text: string }) {
  const steps = parseSteps(text);
  if (steps.length === 0) {
    return <p className="text-sm leading-relaxed text-foreground/90">{text}</p>;
  }
  if (steps.length === 1) {
    return <p className="text-sm leading-relaxed text-foreground/90">{steps[0]}</p>;
  }
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="shrink-0 h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed text-foreground/90 flex-1">
            {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

function AlternativeCard({ exercise }: { exercise: Exercise }) {
  const { t, locale } = useI18n();
  const name = exerciseName(exercise, locale);
  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className="block touch-manipulation shrink-0 w-44"
      aria-label={name}
    >
      <Card className="p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer h-full">
        <div
          className={cn(
            "self-start text-xs font-bold tabular-nums rounded-md border px-1.5 py-0.5",
            loadCoefBg(exercise.loadCoef),
            loadCoefColor(exercise.loadCoef),
          )}
        >
          K {exercise.loadCoef}
        </div>
        <h4 className="font-medium text-sm leading-tight line-clamp-2">
          {name}
        </h4>
        <div className="flex items-center justify-between gap-1">
          <Badge
            variant="outline"
            className={cn("border text-[10px]", TYPE_COLORS[exercise.type])}
          >
            {t(`ex.type.${exercise.type}` as DictKey)}
          </Badge>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </Card>
    </Link>
  );
}

function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2 rounded-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-md" />
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
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
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
