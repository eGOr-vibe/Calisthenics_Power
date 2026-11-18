"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  AlertTriangle,
  Brain,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  ListChecks,
  RotateCcw,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Technique, TechniqueCategory, LevelBase } from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const CATEGORY_COLORS: Record<
  TechniqueCategory,
  { badge: string; bg: string; text: string }
> = {
  cns: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
  },
  mental: {
    badge: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    bg: "bg-purple-500/15",
    text: "text-purple-500",
  },
  relax: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
  },
  warmup: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
  },
  cooldown: {
    badge: "bg-teal-500/15 text-teal-500 border-teal-500/30",
    bg: "bg-teal-500/15",
    text: "text-teal-500",
  },
};

const CATEGORY_ICON: Record<TechniqueCategory, React.ReactNode> = {
  cns: <Brain className="h-8 w-8" />,
  mental: <Sparkles className="h-8 w-8" />,
  relax: <RotateCcw className="h-8 w-8" />,
  warmup: <Target className="h-8 w-8" />,
  cooldown: <Clock className="h-8 w-8" />,
};

const LEVEL_COLORS: Record<LevelBase, string> = {
  beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-500 border-red-500/30",
};

// ====== Helpers ======

function techniqueName(
  t: Pick<Technique, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? t.nameRu : t.nameEn;
}

function techniqueDesc(
  t: Pick<Technique, "descriptionRu" | "descriptionEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? t.descriptionRu : t.descriptionEn;
}

function techniqueWhen(
  t: Pick<Technique, "whenToApplyRu" | "whenToApplyEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? t.whenToApplyRu : t.whenToApplyEn;
}

function techniqueSteps(
  t: Pick<Technique, "stepsRu" | "stepsEn">,
  locale: "ru" | "en",
): string[] {
  return locale === "ru" ? t.stepsRu : t.stepsEn;
}

function techniqueScience(
  t: Pick<Technique, "scienceRu" | "scienceEn">,
  locale: "ru" | "en",
): string | null {
  const v = locale === "ru" ? t.scienceRu : t.scienceEn;
  return v && v.trim() !== "" ? v : null;
}

// ====== Main component ======

export default function TechniqueDetailPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const query = useQuery({
    queryKey: ["techniques"],
    queryFn: async () => {
      const res = await fetch("/api/techniques");
      if (!res.ok) throw new Error("techniques fetch failed");
      return (await res.json()) as Technique[];
    },
  });

  const tech = query.data?.find((x) => x.slug === slug) ?? null;
  const name = tech ? techniqueName(tech, locale) : "";

  const handleAskAI = React.useCallback(() => {
    if (!tech) return;
    const techName = techniqueName(tech, locale);
    const prompt =
      locale === "ru"
        ? `Расскажи подробнее про технику "${techName}" из категории "${t(
            `tech.category.${tech.category}` as DictKey,
          )}". Когда её лучше применять и какие есть нюансы?`
        : `Tell me more about the technique "${techName}" from the "${t(
            `tech.category.${tech.category}` as DictKey,
          )}" category. When is it best applied and what are the nuances?`;
    try {
      sessionStorage.setItem("cp_ai_prefill", prompt);
    } catch {
      // ignore
    }
    router.push("/knowledge/ai");
  }, [tech, locale, t, router]);

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
        ) : query.isError || !tech ? (
          <ErrorState
            onRetry={() => query.refetch()}
            onBack={() => router.push("/knowledge/techniques")}
          />
        ) : (
          <>
            {/* Category icon block */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0",
                  CATEGORY_COLORS[tech.category].bg,
                  CATEGORY_COLORS[tech.category].text,
                )}
              >
                {CATEGORY_ICON[tech.category]}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold leading-tight">
                  {techniqueName(tech, locale)}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border",
                      CATEGORY_COLORS[tech.category].badge,
                    )}
                  >
                    {t(`tech.category.${tech.category}` as DictKey)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("border", LEVEL_COLORS[tech.level])}
                  >
                    {t(`level.${tech.level}` as DictKey)}
                  </Badge>
                  {tech.durationMin ? (
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      <span className="tabular-nums">{tech.durationMin}</span>
                      <span>{t("tech.min")}</span>
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Description */}
            {techniqueDesc(tech, locale).trim() !== "" && (
              <Section title="">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {techniqueDesc(tech, locale)}
                </p>
              </Section>
            )}

            {/* When to apply */}
            {techniqueWhen(tech, locale).trim() !== "" && (
              <Section
                icon={<Target className="h-4 w-4 text-primary" />}
                title={t("tech.whenToApply")}
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  {techniqueWhen(tech, locale)}
                </p>
              </Section>
            )}

            {/* Steps */}
            {techniqueSteps(tech, locale).length > 0 && (
              <Section
                icon={<ListChecks className="h-4 w-4 text-primary" />}
                title={t("tech.steps")}
              >
                <ol className="space-y-2">
                  {techniqueSteps(tech, locale).map((s, i) => (
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
              </Section>
            )}

            {/* Science */}
            {techniqueScience(tech, locale) && (
              <Card className="p-3 gap-2 border-2 border-primary/40 bg-primary/5">
                <SectionHeader
                  icon={<BookOpen className="h-4 w-4 text-primary" />}
                  title={t("tech.science")}
                />
                <p className="text-sm leading-relaxed text-foreground/90">
                  {techniqueScience(tech, locale)}
                </p>
              </Card>
            )}

            {/* Ask AI button */}
            <div className="sticky bottom-24 z-30 px-0 pt-2 pb-2">
              <Button
                variant="default"
                className="w-full h-12 shadow-lg"
                onClick={handleAskAI}
              >
                <Sparkles className="h-5 w-5" />
                <span>{t("ai.askAboutThis")}</span>
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

function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
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
