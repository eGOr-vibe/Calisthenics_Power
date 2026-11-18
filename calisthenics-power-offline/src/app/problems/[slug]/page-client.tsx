"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getProblemArea,
  getProblemAreas,
  getExercises,
  getTechniques,
} from "@/lib/local-storage";
import type {
  ProblemArea,
  Exercise,
  Technique,
} from "@/lib/types";
import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Flame,
  Dumbbell,
  Activity,
  HeartPulse,
  Siren,
  Lightbulb,
  Brain,
  Utensils,
  Stethoscope,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ====== Static params for static export ======


// ====== Constants ======

const CATEGORY_META: Record<
  string,
  { badge: string; bg: string; text: string; icon: React.ReactNode }
> = {
  "fat-loss": {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    icon: <Flame className="h-7 w-7" />,
  },
  strength: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
    icon: <Dumbbell className="h-7 w-7" />,
  },
  technique: {
    badge: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    bg: "bg-sky-500/15",
    text: "text-sky-500",
    icon: <Activity className="h-7 w-7" />,
  },
  pain: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
    icon: <Siren className="h-7 w-7" />,
  },
  recovery: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    icon: <HeartPulse className="h-7 w-7" />,
  },
};

// ====== Helpers ======

function pickLocalized<T extends { Ru: string; En: string }>(
  obj: T,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? obj.Ru : obj.En;
}

// ====== Main component ======

export default function ProblemDetailClient({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();

  // --- Data: problem (localStorage) ---
  const problem = React.useMemo<ProblemArea | null>(() => getProblemArea(slug) ?? null, [slug]);

  // --- Resolve recommended exercises/techniques from localStorage ---
  const exercises = React.useMemo(() => {
    if (!problem) return [];
    const all = getExercises();
    return all.filter((e) =>
      problem.recommendedExerciseSlugs.includes(e.slug),
    );
  }, [problem]);

  const techniques = React.useMemo(() => {
    if (!problem) return [];
    const all = getTechniques();
    return all.filter((tt) =>
      problem.recommendedTechniqueSlugs.includes(tt.slug),
    );
  }, [problem]);

  const meta = problem
    ? CATEGORY_META[problem.category] ?? CATEGORY_META.strength
    : CATEGORY_META.strength;
  const name = problem ? pickLocalized({ Ru: problem.nameRu, En: problem.nameEn }, locale) : "";
  const description = problem ? pickLocalized({ Ru: problem.descriptionRu, En: problem.descriptionEn }, locale) : "";
  const nutrition = problem
    ? pickLocalized(
        {
          Ru: problem.nutritionTipsRu ?? "",
          En: problem.nutritionTipsEn ?? "",
        },
        locale,
      )
    : "";
  const seeDoctor = problem
    ? pickLocalized(
        {
          Ru: problem.whenToSeeDoctorRu,
          En: problem.whenToSeeDoctorEn,
        },
        locale,
      )
    : "";

  // Localized lists (causes/solutions arrays)
  const causesList: string[] = problem ? (locale === "ru" ? problem.causesRu : problem.causesEn) : [];
  const solutionsList: string[] = problem ? (locale === "ru" ? problem.solutionsRu : problem.solutionsEn) : [];

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
        {!problem ? (
          <ErrorState onBack={() => router.push("/problems")} />
        ) : (
          <>
            {/* Category icon block */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0",
                  meta.bg,
                  meta.text,
                )}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold leading-tight">{name}</h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className={cn("border", meta.badge)}
                  >
                    {t(`problems.category.${problem.category}` as DictKey)}
                  </Badge>
                  {problem.relatedInjuryBodyParts.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px]"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>{problem.relatedInjuryBodyParts.length}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {description.trim() !== "" && (
              <Section title="">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {description}
                </p>
              </Section>
            )}

            {/* Causes */}
            {causesList.length > 0 && (
              <Section
                icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
                title={t("problems.causes")}
              >
                <ul className="space-y-2">
                  {causesList.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="shrink-0 h-6 w-6 rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground/90 flex-1">
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Solutions */}
            {solutionsList.length > 0 && (
              <Section
                icon={<Lightbulb className="h-4 w-4 text-emerald-500" />}
                title={t("problems.solutions")}
              >
                <ul className="space-y-2">
                  {solutionsList.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="shrink-0 h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground/90 flex-1">
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Recommended exercises */}
            {exercises.length > 0 && (
              <Section
                icon={<Dumbbell className="h-4 w-4 text-red-500" />}
                title={t("problems.exercises")}
              >
                <div className="space-y-2">
                  {exercises.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/exercises/${e.slug}`}
                      className="block touch-manipulation"
                    >
                      <Card className="p-3 flex items-center gap-3 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
                        <div className="h-9 w-9 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                          <Dumbbell className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium leading-tight truncate">
                            {locale === "ru" ? e.nameRu : e.nameEn}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {locale === "ru" ? e.descriptionRu : e.descriptionEn}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Card>
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            {/* Recommended techniques */}
            {techniques.length > 0 && (
              <Section
                icon={<Brain className="h-4 w-4 text-purple-500" />}
                title={t("problems.techniques")}
              >
                <div className="space-y-2">
                  {techniques.map((tt) => (
                    <Link
                      key={tt.slug}
                      href={`/knowledge/techniques/${tt.slug}`}
                      className="block touch-manipulation"
                    >
                      <Card className="p-3 flex items-center gap-3 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
                        <div className="h-9 w-9 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium leading-tight truncate">
                            {locale === "ru" ? tt.nameRu : tt.nameEn}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {locale === "ru" ? tt.descriptionRu : tt.descriptionEn}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Card>
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            {/* Nutrition tips */}
            {nutrition.trim() !== "" && (
              <Section
                icon={<Utensils className="h-4 w-4 text-emerald-500" />}
                title={t("problems.nutrition")}
              >
                <Card className="p-3 border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {nutrition}
                  </p>
                </Card>
              </Section>
            )}

            {/* When to see a doctor */}
            {seeDoctor.trim() !== "" && (
              <Section
                icon={<Stethoscope className="h-4 w-4 text-destructive" />}
                title={t("problems.seeDoctor")}
              >
                <Card className="p-3 border-2 border-destructive/50 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed text-foreground/90 flex-1">
                      {seeDoctor}
                    </p>
                  </div>
                </Card>
              </Section>
            )}
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

// (SkeletonDetail removed for offline build)

function ErrorState({
  onBack,
}: {
  onBack: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("problems.notFound")}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.back")}</span>
        </Button>
      </div>
    </div>
  );
}
