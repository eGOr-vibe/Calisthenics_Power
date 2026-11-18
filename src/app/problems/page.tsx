"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Flame,
  Dumbbell,
  Activity,
  HeartPulse,
  Siren,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProblemArea, Injury, BodyPart } from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const CATEGORY_OPTIONS = [
  "all",
  "fat-loss",
  "strength",
  "technique",
  "pain",
  "recovery",
] as const;
type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

const CATEGORY_META: Record<
  Exclude<CategoryOption, "all">,
  { badge: string; bg: string; text: string; icon: React.ReactNode }
> = {
  "fat-loss": {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    icon: <Flame className="h-5 w-5" />,
  },
  strength: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  technique: {
    badge: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    bg: "bg-sky-500/15",
    text: "text-sky-500",
    icon: <Activity className="h-5 w-5" />,
  },
  pain: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
    icon: <Siren className="h-5 w-5" />,
  },
  recovery: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    icon: <HeartPulse className="h-5 w-5" />,
  },
};

// Map injury body parts to "problem" body parts (which use same names in Injury.bodyPart).
const BODY_PART_LABEL_KEYS: Record<string, DictKey> = {
  leftElbow: "profile.bodyPart.leftElbow",
  rightElbow: "profile.bodyPart.rightElbow",
  leftShoulder: "profile.bodyPart.leftShoulder",
  rightShoulder: "profile.bodyPart.rightShoulder",
  leftWrist: "profile.bodyPart.leftWrist",
  rightWrist: "profile.bodyPart.rightWrist",
  lowerBack: "profile.bodyPart.lowerBack",
  neck: "profile.bodyPart.neck",
  knees: "profile.bodyPart.knees",
};

// ====== Helpers ======

function problemName(
  p: Pick<ProblemArea, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? p.nameRu : p.nameEn;
}

function problemDesc(
  p: Pick<ProblemArea, "descriptionRu" | "descriptionEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? p.descriptionRu : p.descriptionEn;
}

// ====== Main component ======

export default function ProblemsPage() {
  const { t, locale } = useI18n();
  const [category, setCategory] = React.useState<CategoryOption>("all");

  // --- Data: problems ---
  const problemsQuery = useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const res = await fetch("/api/problems");
      if (!res.ok) throw new Error("problems fetch failed");
      return (await res.json()) as ProblemArea[];
    },
  });

  // --- Data: injuries (to detect related problems) ---
  const injuriesQuery = useQuery({
    queryKey: ["injuries"],
    queryFn: async () => {
      const res = await fetch("/api/injuries");
      if (!res.ok) throw new Error("injuries fetch failed");
      return (await res.json()) as Injury[];
    },
  });

  const allProblems = problemsQuery.data ?? [];
  const injuries = (injuriesQuery.data ?? []).filter((i) => i.active);

  // Filter by category
  const filteredProblems =
    category === "all"
      ? allProblems
      : allProblems.filter((p) => p.category === category);

  // Problems related to active injuries
  const relatedProblems = React.useMemo(() => {
    if (injuries.length === 0) return [];
    const injuryParts = new Set(injuries.map((i) => i.bodyPart));
    return allProblems.filter((p) =>
      p.relatedInjuryBodyParts.some((bp) => injuryParts.has(bp as BodyPart)),
    );
  }, [allProblems, injuries]);

  return (
    <MobileShell>
      <PageHeader
        title={t("problems.title")}
        subtitle={t("problems.subtitle")}
        right={
          <Link href="/knowledge" aria-label={t("common.back")}>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] h-11 w-11"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        }
      />

      <div className="flex-1 px-4 py-3 space-y-4">
        {/* Intro */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("problems.intro")}
        </p>

        {/* Related injuries hint */}
        {relatedProblems.length > 0 && (
          <Card className="p-3 gap-2 border-2 border-amber-500/40 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {t("problems.relatedInjuries")}
              </span>
            </div>
            <div className="space-y-1.5">
              {relatedProblems.map((p) => (
                <Link
                  key={p.slug}
                  href={`/problems/${p.slug}`}
                  className="block touch-manipulation"
                >
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-amber-500/10 active:scale-[0.99] transition-all">
                    <span className="text-sm font-medium flex-1 min-w-0 truncate">
                      {problemName(p, locale)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Category chips */}
        <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
          <div className="flex items-center gap-2 w-max pb-1">
            {CATEGORY_OPTIONS.map((cat) => {
              const isActive = category === cat;
              const meta =
                cat === "all" ? null : CATEGORY_META[cat as Exclude<CategoryOption, "all">];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 h-9 px-3.5 rounded-full text-xs font-medium border transition-colors touch-manipulation min-h-[44px] flex items-center gap-1.5",
                    isActive
                      ? meta
                        ? cn(meta.badge, "font-semibold")
                        : "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-accent/50",
                  )}
                >
                  {meta && <span className={meta.text}>{meta.icon}</span>}
                  <span>{t(`problems.category.${cat}` as DictKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {problemsQuery.isLoading ? (
          <SkeletonList />
        ) : problemsQuery.isError ? (
          <ErrorState onRetry={() => problemsQuery.refetch()} />
        ) : filteredProblems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-2">
            {filteredProblems.map((p) => (
              <ProblemCard key={p.slug} problem={p} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function ProblemCard({
  problem,
  locale,
}: {
  problem: ProblemArea;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  const meta = CATEGORY_META[problem.category as Exclude<CategoryOption, "all">] ?? {
    badge: "bg-muted text-muted-foreground border-border",
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: <AlertCircle className="h-5 w-5" />,
  };

  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="block touch-manipulation"
      aria-label={problemName(problem, locale)}
    >
      <Card
        className={cn(
          "p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer border-l-4",
          "border-l-" + (problem.category === "pain" ? "red-500" : ""),
        )}
        style={{
          borderLeftColor:
            problem.category === "pain"
              ? "rgb(239 68 68)"
              : problem.category === "fat-loss"
                ? "rgb(245 158 11)"
                : problem.category === "strength"
                  ? "rgb(239 68 68)"
                  : problem.category === "technique"
                    ? "rgb(56 189 248)"
                    : "rgb(16 185 129)",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                meta.bg,
                meta.text,
              )}
            >
              {meta.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm leading-tight">
                {problemName(problem, locale)}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mt-1">
                {problemDesc(problem, locale)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <Badge variant="outline" className={cn("border text-[10px]", meta.badge)}>
            {t(`problems.category.${problem.category}` as DictKey)}
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground text-[10px]"
          >
            {problem.causesRu.length} {t("problems.causes").toLowerCase()}
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground text-[10px]"
          >
            {problem.solutionsRu.length} {t("problems.solutions").toLowerCase()}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-3 gap-2">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("problems.empty")}</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
      <Button variant="outline" onClick={onRetry} className="min-h-[44px]">
        {t("common.retry")}
      </Button>
    </div>
  );
}
