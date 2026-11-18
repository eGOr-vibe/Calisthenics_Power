"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, AlertTriangle, ChevronRight, Target, ListChecks, Quote } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getExercise } from "@/lib/local-storage";
import type { Exercise } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  pull: "bg-red-500/15 text-red-500 border-red-500/30",
  push: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  core: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  legs: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  static: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  mobility: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const TYPE_GRADIENT: Record<string, string> = {
  pull: "from-red-500/20 to-red-700/10",
  push: "from-orange-500/20 to-orange-700/10",
  core: "from-amber-500/20 to-amber-700/10",
  legs: "from-emerald-500/20 to-emerald-700/10",
  static: "from-purple-500/20 to-purple-700/10",
  mobility: "from-slate-500/20 to-slate-700/10",
};

function levelLabel(base: string, sub: number, t: (k: DictKey) => string) {
  const label = t(`level.${base}` as DictKey);
  return sub > 1 ? `${label}+${sub - 1}` : label;
}

function loadCoefBg(coef: number) {
  if (coef <= 2) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
  if (coef <= 5) return "bg-amber-500/10 border-amber-500/30 text-amber-500";
  return "bg-red-500/10 border-red-500/30 text-red-500";
}

export default function ExerciseDetailClient({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const ex = React.useMemo(() => getExercise(slug), [slug]);

  if (!ex) {
    return (
      <MobileShell>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{t("common.error")}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/exercises")}>{t("common.back")}</Button>
        </div>
      </MobileShell>
    );
  }

  const name = locale === "ru" ? ex.nameRu : ex.nameEn;
  const description = locale === "ru" ? ex.descriptionRu : ex.descriptionEn;
  const howTo = locale === "ru" ? ex.howToRu : ex.howToEn;
  const science = locale === "ru" ? ex.scienceRu : ex.scienceEn;
  const muscles = locale === "ru" ? ex.targetMusclesRu : ex.targetMusclesEn;

  return (
    <MobileShell>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/exercises")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-sm truncate">{name}</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="flex-1 px-4 py-3 space-y-3">
        {/* Hero */}
        <div className={cn("relative w-full rounded-2xl overflow-hidden border border-border bg-gradient-to-br p-6 flex flex-col items-center justify-center min-h-[140px]", TYPE_GRADIENT[ex.type])}>
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className={cn("border bg-background/80 backdrop-blur text-xs", TYPE_COLORS[ex.type])}>{t(`ex.type.${ex.type}` as DictKey)}</Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="border bg-background/80 backdrop-blur text-xs font-bold text-foreground">K {ex.loadCoef}</Badge>
          </div>
          <h2 className="text-2xl font-bold leading-tight text-center text-foreground px-4 mt-6">{name}</h2>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn("border", `bg-emerald-500/15 text-emerald-500 border-emerald-500/30`)}>{levelLabel(ex.levelBase, ex.levelSub, t)}</Badge>
          {ex.equipment.map(eq => (
            <Badge key={eq} variant="outline" className="border-border">{t(`eq.${eq}` as DictKey)}</Badge>
          ))}
        </div>

        {/* Load coef */}
        <Card className={cn("p-3 gap-2 border-2 items-center text-center", loadCoefBg(ex.loadCoef))}>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("ex.loadCoef")}</div>
          <div className={cn("text-3xl font-bold tabular-nums leading-none", loadCoefBg(ex.loadCoef).split(" ").find(c => c.startsWith("text-")))}>{ex.loadCoef}</div>
          <div className="text-[11px] text-muted-foreground">1 — 9</div>
        </Card>

        {/* Description */}
        <Card className="p-3">
          <p className="text-sm leading-relaxed">{description}</p>
        </Card>

        {/* How to */}
        <Card className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("ex.howTo")}</h3>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line">{howTo}</p>
        </Card>

        {/* Muscles */}
        <Card className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("ex.targetMuscles")}</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {muscles.map(m => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
          </div>
        </Card>

        {/* Science */}
        {science && (
          <Card className="p-3 space-y-2 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">{t("ex.why")}</h3>
            </div>
            <p className="text-sm leading-relaxed">{science}</p>
          </Card>
        )}

        {/* Sources */}
        {ex.sources && ex.sources.length > 0 && (
          <Card className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Quote className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("ex.sources")}</h3>
            </div>
            {ex.sources.map(s => <p key={s} className="text-xs text-muted-foreground">· {s}</p>)}
          </Card>
        )}

        {/* Alternatives */}
        {ex.alternatives && ex.alternatives.length > 0 && (
          <Card className="p-3 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("ex.alternatives")}</h3>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
              {ex.alternatives.map(alt => {
                const altName = locale === "ru" ? alt.nameRu : alt.nameEn;
                return (
                  <Link key={alt.slug} href={`/exercises/${alt.slug}/`} className="shrink-0 touch-manipulation">
                    <Card className="p-2 w-32 hover:border-primary/40 transition-colors">
                      <Badge variant="outline" className={cn("text-[9px] mb-1", loadCoefBg(alt.loadCoef))}>K{alt.loadCoef}</Badge>
                      <p className="text-xs font-medium leading-tight line-clamp-2">{altName}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </MobileShell>
  );
}
