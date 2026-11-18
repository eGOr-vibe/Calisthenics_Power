"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Activity,
  Scale,
  ShieldAlert,
  TrendingUp,
  Dumbbell,
  Zap,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Gauge,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DictKey } from "@/lib/i18n";
import type { MenstrualPhase } from "@/lib/menstrual-cycle";
import type { BiomechSummary } from "@/app/api/biomech/summary/route";

const MENSTRUAL_PHASE_BADGE: Record<MenstrualPhase, string> = {
  menstrual: "bg-red-500/15 text-red-500 border-red-500/30",
  follicular: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  ovulation: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  luteal: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

// ====== Constants ======

type CategoryKey = "pull" | "push" | "core" | "legs" | "static" | "mobility";

const CATEGORY_COLORS: Record<CategoryKey, { bar: string; text: string; dot: string }> = {
  pull: { bar: "bg-red-500", text: "text-red-500", dot: "bg-red-500" },
  push: { bar: "bg-orange-500", text: "text-orange-500", dot: "bg-orange-500" },
  core: { bar: "bg-amber-500", text: "text-amber-500", dot: "bg-amber-500" },
  legs: { bar: "bg-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500" },
  static: { bar: "bg-purple-500", text: "text-purple-500", dot: "bg-purple-500" },
  mobility: { bar: "bg-slate-500", text: "text-slate-500", dot: "bg-slate-500" },
};

const CATEGORY_ORDER: CategoryKey[] = [
  "pull",
  "push",
  "core",
  "legs",
  "static",
  "mobility",
];

// ====== Helpers ======

function formatTrendDate(iso: string, locale: "ru" | "en"): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function formatSessionDate(iso: string, locale: "ru" | "en"): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function relativeStrengthInterpretationLabel(
  interpretation: string,
  locale: "ru" | "en",
): string {
  const map: Record<string, { ru: string; en: string }> = {
    "below average": { ru: "ниже среднего", en: "below average" },
    average: { ru: "средний", en: "average" },
    "above average": { ru: "выше среднего", en: "above average" },
    elite: { ru: "элита", en: "elite" },
  };
  return map[interpretation]?.[locale] ?? interpretation;
}

function ratioVerdict(
  ratio: number,
  range: [number, number],
): "good" | "warning" | "bad" {
  if (ratio === 99) return "bad";
  if (ratio >= range[0] && ratio <= range[1]) return "good";
  if (ratio >= range[0] * 0.5 && ratio <= range[1] * 1.5) return "warning";
  return "bad";
}

function ratioColor(verdict: "good" | "warning" | "bad"): string {
  switch (verdict) {
    case "good":
      return "text-emerald-500";
    case "warning":
      return "text-amber-500";
    case "bad":
      return "text-red-500";
  }
}

function ratioBg(verdict: "good" | "warning" | "bad"): string {
  switch (verdict) {
    case "good":
      return "bg-emerald-500/10 border-emerald-500/30";
    case "warning":
      return "bg-amber-500/10 border-amber-500/30";
    case "bad":
      return "bg-red-500/10 border-red-500/30";
  }
}

function severityColor(sev: "safe" | "warning" | "critical"): string {
  switch (sev) {
    case "safe":
      return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    case "warning":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "critical":
      return "bg-red-500/15 text-red-500 border-red-500/30";
  }
}

function cnsZoneColor(zone: "safe" | "warning" | "critical"): string {
  switch (zone) {
    case "safe":
      return "text-emerald-500";
    case "warning":
      return "text-amber-500";
    case "critical":
      return "text-red-500";
  }
}

function categoryLabel(key: CategoryKey, locale: "ru" | "en"): string {
  const labels: Record<CategoryKey, { ru: string; en: string }> = {
    pull: { ru: "Тяги", en: "Pull" },
    push: { ru: "Жимы", en: "Push" },
    core: { ru: "Кор", en: "Core" },
    legs: { ru: "Ноги", en: "Legs" },
    static: { ru: "Статика", en: "Static" },
    mobility: { ru: "Мобильность", en: "Mobility" },
  };
  return labels[key][locale];
}

function bodyPartLabel(key: string, locale: "ru" | "en"): string {
  const labels: Record<string, { ru: string; en: string }> = {
    elbows: { ru: "Локти", en: "Elbows" },
    shoulders: { ru: "Плечи", en: "Shoulders" },
    wrists: { ru: "Запястья", en: "Wrists" },
    lowerBack: { ru: "Поясница", en: "Lower back" },
    knees: { ru: "Колени", en: "Knees" },
  };
  return labels[key]?.[locale] ?? key;
}

// ====== Main page ======

export default function BiomechPage() {
  const { t, locale } = useI18n();

  const summaryQuery = useQuery({
    queryKey: ["biomech", "summary"],
    queryFn: async () => {
      const res = await fetch("/api/biomech/summary");
      if (!res.ok) throw new Error("biomech summary fetch failed");
      return (await res.json()) as BiomechSummary;
    },
    staleTime: 60_000,
  });

  // Weekly sessions count (for the summary card)
  const sessionsQuery = useQuery({
    queryKey: ["sessions", "list", 100],
    queryFn: async () => {
      const res = await fetch("/api/workouts/sessions?limit=100");
      if (!res.ok) throw new Error("sessions fetch failed");
      return (await res.json()) as Array<{ startedAt: string }>;
    },
  });

  const summary = summaryQuery.data;
  const sessions = sessionsQuery.data ?? [];

  // Last 7 days count
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weeklySessionsCount = sessions.filter(
    (s) => new Date(s.startedAt).getTime() >= weekAgo,
  ).length;

  return (
    <MobileShell>
      <PageHeader
        title={t("biomech.title")}
        right={
          <Link href="/" aria-label={t("common.back")}>
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

      <div className="flex-1 px-4 py-4 space-y-4">
        {summaryQuery.isLoading ? (
          <SkeletonDashboard />
        ) : summaryQuery.isError ? (
          <ErrorState onRetry={() => summaryQuery.refetch()} />
        ) : !summary ? (
          <ErrorState onRetry={() => summaryQuery.refetch()} />
        ) : weeklySessionsCount === 0 && summary.weeklyVolume === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* 1. Weekly volume summary */}
            <WeeklyVolumeCard
              summary={summary}
              weeklySessionsCount={weeklySessionsCount}
            />

            {/* 2. Bars by category */}
            <CategoryBarsCard summary={summary} locale={locale} />

            {/* 3. Balance / symmetry */}
            <BalanceCard summary={summary} t={t} />

            {/* 4. Joint fatigue */}
            <JointFatigueCard summary={summary} t={t} locale={locale} />

            {/* 5. 4-week trend AreaChart */}
            <TrendCard summary={summary} locale={locale} t={t} />

            {/* 6. Relative strength */}
            {summary.relativeStrength && (
              <RelativeStrengthCard
                value={summary.relativeStrength.value}
                interpretation={summary.relativeStrength.interpretation}
                t={t}
                locale={locale}
              />
            )}

            {/* 7. Weight loss motivator */}
            {summary.weightLossImpact && (
              <WeightLossCard
                weightLostKg={summary.weightLossImpact.weightLostKg}
                forceReductionN={summary.weightLossImpact.forceReductionN}
                improvementPct={summary.weightLossImpact.plancheImprovementPct}
                t={t}
              />
            )}

            {/* 8. CNS Pulse (latest HIIT session) */}
            {summary.cnsPulse && (
              <CnsPulseCard
                cnsPulse={summary.cnsPulse}
                t={t}
                locale={locale}
              />
            )}

            {/* 9. Menstrual cycle adjustment (Phase 3, female only) */}
            {summary.menstrualAdjustment && (
              <MenstrualAdjustmentCard
                data={summary.menstrualAdjustment}
                t={t}
                locale={locale}
              />
            )}

            {/* Footer */}
            <footer className="pt-2 pb-4 text-center">
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
                {t("biomech.scienceNote")}
              </p>
              <Link
                href="/knowledge/theory"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline min-h-[44px] px-2"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {t("theory.title")}
              </Link>
            </footer>
          </>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

type TFunc = (
  key: import("@/lib/i18n").DictKey,
  vars?: Record<string, string | number>,
) => string;

function WeeklyVolumeCard({
  summary,
  weeklySessionsCount,
}: {
  summary: BiomechSummary;
  weeklySessionsCount: number;
}) {
  const { t } = useI18n();
  const avg =
    weeklySessionsCount > 0
      ? Math.round(summary.weeklyVolume / weeklySessionsCount)
      : 0;

  return (
    <Card className="p-3 gap-3 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
          {t("biomech.weeklyVolume")}
        </span>
      </div>
      <div className="text-2xl font-bold tabular-nums leading-none">
        {summary.weeklyVolume.toLocaleString("ru-RU")}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {t("biomech.workoutsThisWeek")}
          </div>
          <div className="text-xl font-bold tabular-nums mt-0.5">
            {weeklySessionsCount}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {t("biomech.avgPerWorkout")}
          </div>
          <div className="text-xl font-bold tabular-nums mt-0.5">{avg}</div>
        </div>
      </div>
    </Card>
  );
}

function CategoryBarsCard({
  summary,
  locale,
}: {
  summary: BiomechSummary;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  const max = Math.max(
    1,
    ...CATEGORY_ORDER.map((k) => summary.weeklyByCategory[k] ?? 0),
  );

  return (
    <Card className="p-3 gap-3">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("biomech.byCategory")}</span>
      </div>
      <div className="space-y-2.5">
        {CATEGORY_ORDER.map((key) => {
          const value = summary.weeklyByCategory[key] ?? 0;
          const percent = Math.round((value / max) * 100);
          const colors = CATEGORY_COLORS[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium text-muted-foreground shrink-0">
                {categoryLabel(key, locale)}
              </div>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", colors.bar)}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div
                className={cn(
                  "w-12 text-right text-xs font-bold tabular-nums",
                  colors.text,
                )}
              >
                {value}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function BalanceCard({
  summary,
  t,
}: {
  summary: BiomechSummary;
  t: TFunc;
}) {
  const pullPushVerdict = ratioVerdict(summary.balance.pullPushRatio, [0.8, 1.2]);
  const upperLowerVerdict = ratioVerdict(
    summary.balance.upperLowerRatio,
    [1.0, 1.5],
  );
  const overallBalanced = summary.balance.verdict === "balanced";

  return (
    <Card className="p-3 gap-3">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("biomech.balance")}</span>
      </div>

      <div className="space-y-2.5">
        <RatioRow
          label={t("biomech.pullPushRatio")}
          ratio={summary.balance.pullPushRatio}
          verdict={pullPushVerdict}
          ideal="0.8–1.2"
        />
        <RatioRow
          label={t("biomech.upperLowerRatio")}
          ratio={summary.balance.upperLowerRatio}
          verdict={upperLowerVerdict}
          ideal="1.0–1.5"
        />
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 mt-1",
          overallBalanced
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-amber-500/10 border-amber-500/30",
        )}
      >
        <span className="text-xs font-medium">
          {overallBalanced ? t("biomech.balanced") : t("biomech.imbalance")}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {overallBalanced ? "OK" : "—"}
        </span>
      </div>
    </Card>
  );
}

function RatioRow({
  label,
  ratio,
  verdict,
  ideal,
}: {
  label: string;
  ratio: number;
  verdict: "good" | "warning" | "bad";
  ideal: string;
}) {
  const ratioText = ratio === 99 ? "—" : ratio.toFixed(2);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[10px] text-muted-foreground">
          {ideal}
        </span>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-2 py-1",
          ratioBg(verdict),
        )}
      >
        <span
          className={cn(
            "text-base font-bold tabular-nums leading-none",
            ratioColor(verdict),
          )}
        >
          {ratioText}
        </span>
      </div>
    </div>
  );
}

function JointFatigueCard({
  summary,
  t,
  locale,
}: {
  summary: BiomechSummary;
  t: TFunc;
  locale: "ru" | "en";
}) {
  const hasWarnings = summary.jointWarnings.length > 0;
  const anyWarningOrCritical = summary.jointWarnings.some(
    (w) => w.severity !== "safe",
  );

  return (
    <Card className="p-3 gap-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("biomech.jointFatigue")}</span>
      </div>

      {hasWarnings ? (
        <div className="space-y-3">
          {anyWarningOrCritical && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2">
              <p className="text-[11px] text-amber-500 font-medium leading-snug">
                {locale === "ru"
                  ? "Обнаружены зоны с повышенной нагрузкой. Будь осторожен."
                  : "Detected zones with elevated load. Be careful."}
              </p>
            </div>
          )}
          {summary.jointWarnings.map((w) => (
            <div
              key={w.bodyPart}
              className="rounded-lg border border-border/60 px-3 py-2 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">
                  {bodyPartLabel(w.bodyPart, locale)}
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] uppercase", severityColor(w.severity))}
                >
                  {w.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                <span>
                  {t("biomech.weeklyLoad")}:{" "}
                  <span className="font-bold tabular-nums text-foreground">
                    {w.weeklyLoad}
                  </span>
                </span>
                <span>
                  {t("biomech.recommendedLimit")}:{" "}
                  <span className="font-bold tabular-nums text-foreground">
                    {w.threshold}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {locale === "ru" ? w.messageRu : w.messageEn}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(
            ["elbows", "shoulders", "wrists", "lowerBack", "knees"] as const
          ).map((key) => {
            const value = summary.jointFatigue[key];
            const thresholds = JOINT_DISPLAY_THRESHOLDS[key];
            const percent = Math.min(
              100,
              Math.round((value / thresholds.critical) * 100),
            );
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="w-20 text-muted-foreground">
                  {bodyPartLabel(key, locale)}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      percent < 50
                        ? "bg-emerald-500"
                        : percent < 80
                          ? "bg-amber-500"
                          : "bg-red-500",
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-12 text-right tabular-nums font-medium">
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

const JOINT_DISPLAY_THRESHOLDS = {
  elbows: { warning: 600, critical: 1200 },
  shoulders: { warning: 800, critical: 1500 },
  wrists: { warning: 500, critical: 1000 },
  lowerBack: { warning: 500, critical: 1000 },
  knees: { warning: 800, critical: 1600 },
} as const;

function TrendCard({
  summary,
  locale,
  t,
}: {
  summary: BiomechSummary;
  locale: "ru" | "en";
  t: TFunc;
}) {
  const data = summary.fourWeekTrend.map((p) => ({
    date: formatTrendDate(p.date, locale),
    volume: p.volume,
    load: p.load,
  }));

  return (
    <Card className="p-3 gap-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("biomech.trend4weeks")}</span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="biomechVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-border"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "currentColor" }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "currentColor" }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card, 0 0% 14%))",
                border: "1px solid hsl(var(--border, 0 0% 30%))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              labelStyle={{ color: "#a3a3a3", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#dc2626"
              strokeWidth={2}
              fill="url(#biomechVolumeGrad)"
              dot={{ r: 3, fill: "#dc2626", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name={t("biomech.weeklyVolume")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function RelativeStrengthCard({
  value,
  interpretation,
  t,
  locale,
}: {
  value: number;
  interpretation: string;
  t: TFunc;
  locale: "ru" | "en";
}) {
  // Normalize to a 0-100 progress bar where 20 = elite
  const percent = Math.min(100, Math.round((value / 20) * 100));
  const label = relativeStrengthInterpretationLabel(interpretation, locale);

  return (
    <Card className="p-3 gap-3 border-primary/20">
      <div className="flex items-center gap-2">
        <Gauge className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("biomech.relativeStrength")}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums leading-none text-primary">
          {value.toFixed(2)}
        </span>
        <span className="text-xs text-muted-foreground">R</span>
      </div>
      <div>
        <Progress value={percent} className="h-1.5" />
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>0</span>
          <span className="font-semibold text-foreground">{label}</span>
          <span>20+</span>
        </div>
      </div>
    </Card>
  );
}

function WeightLossCard({
  weightLostKg,
  forceReductionN,
  improvementPct,
  t,
}: {
  weightLostKg: number;
  forceReductionN: number;
  improvementPct: number;
  t: TFunc;
}) {
  return (
    <Card className="p-3 gap-3 border-emerald-500/20 bg-emerald-500/5">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-semibold">{t("biomech.weightLossMotivator")}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("biomech.weightLossDesc", {
          kg: weightLostKg,
          n: forceReductionN,
          pct: improvementPct,
        })}
      </p>
    </Card>
  );
}

function CnsPulseCard({
  cnsPulse,
  t,
  locale,
}: {
  cnsPulse: BiomechSummary["cnsPulse"];
  t: TFunc;
  locale: "ru" | "en";
}) {
  if (!cnsPulse) return null;
  const zoneColor = cnsZoneColor(cnsPulse.zone);
  return (
    <Card className="p-3 gap-3">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("biomech.cnsPulse")}</span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn("text-2xl font-bold tabular-nums leading-none", zoneColor)}>
          {cnsPulse.cnsPulse.toFixed(2)}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "uppercase text-[10px] font-bold",
            cnsPulse.zone === "safe"
              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
              : cnsPulse.zone === "warning"
                ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                : "bg-red-500/15 text-red-500 border-red-500/30",
          )}
        >
          {cnsPulse.zone}
        </Badge>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        {t("biomech.cnsPulseDesc")} · {formatSessionDate(cnsPulse.sessionDate, locale)}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {locale === "ru" ? cnsPulse.recommendation : cnsPulse.recommendationEn}
      </p>
    </Card>
  );
}

function MenstrualAdjustmentCard({
  data,
  t,
  locale,
}: {
  data: NonNullable<BiomechSummary["menstrualAdjustment"]>;
  t: TFunc;
  locale: "ru" | "en";
}) {
  return (
    <Card className="p-3 gap-3 border-primary/20">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{t("menstrual.biomechTitle")}</span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] uppercase font-bold",
            MENSTRUAL_PHASE_BADGE[data.phase],
          )}
        >
          {t(`menstrual.phase.${data.phase}` as DictKey)}
        </Badge>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold tabular-nums leading-none text-primary">
          {Math.round(data.trainingAdjustment * 100)}%
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t("menstrual.cycleDay")} {data.cycleDay}/28 ·{" "}
          {t("menstrual.daysUntilNext")}: {data.daysUntilNext}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-snug">
        {t("menstrual.biomechDesc")}
      </p>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {locale === "ru" ? data.recommendationRu : data.recommendationEn}
      </p>

      <div className="rounded-md bg-muted/40 p-2 border border-border/40">
        <p className="text-[10px] text-muted-foreground leading-snug">
          {t("menstrual.disclaimer")}
        </p>
      </div>
    </Card>
  );
}

// ====== States ======

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Activity className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-5 max-w-[260px]">
        {t("biomech.noSessions")}
      </p>
      <Link href="/builder">
        <Button className="min-h-[44px] h-11">
          {t("history.createWorkout")}
        </Button>
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
      <Button variant="outline" onClick={onRetry} className="min-h-[44px] h-11">
        <RotateCcw className="h-4 w-4" />
        {t("common.retry")}
      </Button>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-3">
      <Card className="p-3 gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
      <Card className="p-3 gap-3">
        <Skeleton className="h-4 w-32 mb-2" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </Card>
      <Card className="p-3 gap-3">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
      <Card className="p-3 gap-3">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-48 w-full" />
      </Card>
    </div>
  );
}
