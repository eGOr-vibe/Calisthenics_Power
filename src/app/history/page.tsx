"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dumbbell,
  AlertTriangle,
  RotateCcw,
  Plus,
  ChevronRight,
  Clock,
  Layers,
  Activity,
  BarChart3,
  TrendingUp,
  Upload,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/biomech";
import type {
  Exercise,
  SubstitutionRecord,
  WorkoutFormat,
  WorkoutSession,
  WorkoutSessionItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const FORMAT_COLORS: Record<WorkoutFormat, string> = {
  amrap: "bg-red-500/15 text-red-500 border-red-500/30",
  emom: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  tabata: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  interval: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

const FORMAT_LABEL_KEY: Record<WorkoutFormat, DictKey> = {
  amrap: "format.amrap",
  emom: "format.emom",
  tabata: "format.tabata",
  interval: "format.interval",
};

const SESSIONS_LIMIT = 100;

// ====== Helpers ======

/**
 * Normalize a session row coming from the API.
 * The list endpoint returns a properly mapped WorkoutSession, but defensively
 * accept raw prisma rows too (where format/substitutions/items may be raw).
 */
function normalizeSession(raw: any): WorkoutSession {
  const format = (
    typeof raw.format === "string" ? raw.format.toLowerCase() : raw.format
  ) as WorkoutFormat;

  let substitutions: SubstitutionRecord[] = [];
  if (Array.isArray(raw.substitutions)) {
    substitutions = raw.substitutions;
  } else if (typeof raw.substitutions === "string" && raw.substitutions) {
    try {
      substitutions = JSON.parse(raw.substitutions);
    } catch {
      substitutions = [];
    }
  }

  let items: WorkoutSessionItem[] = [];
  if (Array.isArray(raw.items)) {
    items = raw.items;
  } else if (typeof raw.items === "string" && raw.items) {
    try {
      items = JSON.parse(raw.items);
    } catch {
      items = [];
    }
  }

  const startedAt =
    typeof raw.startedAt === "string"
      ? raw.startedAt
      : raw.startedAt instanceof Date
        ? raw.startedAt.toISOString()
        : new Date().toISOString();

  const finishedAt =
    raw.finishedAt == null
      ? null
      : typeof raw.finishedAt === "string"
        ? raw.finishedAt
        : raw.finishedAt instanceof Date
          ? raw.finishedAt.toISOString()
          : null;

  return {
    id: raw.id,
    templateId: raw.templateId ?? null,
    format,
    startedAt,
    finishedAt,
    durationSec: raw.durationSec ?? 0,
    totalRounds: raw.totalRounds ?? 0,
    totalReps: raw.totalReps ?? 0,
    totalVolume: Number(raw.totalVolume ?? 0),
    substitutions,
    avgHr: raw.avgHr ?? null,
    maxHr: raw.maxHr ?? null,
    notes: raw.notes ?? null,
    feelingRating: raw.feelingRating ?? null,
    items,
  };
}

function formatDate(iso: string, locale: "ru" | "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ====== Main component ======

export default function HistoryListPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ["sessions", "list", SESSIONS_LIMIT],
    queryFn: async () => {
      const res = await fetch(`/api/workouts/sessions?limit=${SESSIONS_LIMIT}`);
      if (!res.ok) {
        throw new Error("sessions fetch failed");
      }
      const data = (await res.json()) as any[];
      return data.map(normalizeSession);
    },
  });

  // Prefetch exercises so the cache is warm when entering a detail page
  // (the detail page needs to resolve exercise slugs to names).
  useQuery({
    queryKey: ["exercises", { all: true }],
    queryFn: async () => {
      const res = await fetch("/api/exercises");
      if (!res.ok) throw new Error("exercises fetch failed");
      return (await res.json()) as Exercise[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const sessions = sessionsQuery.data ?? [];
  const totalWorkouts = sessions.length;
  const totalVolume = sessions.reduce(
    (s, w) => s + (Number(w.totalVolume) || 0),
    0
  );
  const totalDurationSec = sessions.reduce(
    (s, w) => s + (w.durationSec || 0),
    0
  );
  const avgDurationSec =
    totalWorkouts > 0 ? Math.round(totalDurationSec / totalWorkouts) : 0;

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  return (
    <MobileShell>
      <PageHeader
        title={t("history.title")}
        subtitle={`${t("history.total")}: ${totalWorkouts}`}
        right={
          <div className="flex items-center gap-1">
            <Link
              href="/diary"
              className="contents"
              aria-label={t("diary.importCsv")}
            >
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] h-11 w-11"
                aria-label={t("diary.importCsv")}
              >
                <Upload className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleManualRefresh}
              aria-label={t("common.retry")}
              className="min-h-[44px] min-w-[44px] h-11 w-11"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="flex-1 px-4 py-3 space-y-3">
        {sessionsQuery.isLoading ? (
          <SkeletonList />
        ) : sessionsQuery.isError ? (
          <ErrorState onRetry={() => sessionsQuery.refetch()} />
        ) : totalWorkouts === 0 ? (
          <EmptyState />
        ) : (
          <>
            <SummaryCard
              totalWorkouts={totalWorkouts}
              totalVolume={totalVolume}
              avgDurationSec={avgDurationSec}
            />

            <ProgressCharts sessions={sessions} locale={locale} />

            <div className="grid grid-cols-2 gap-2 pb-2">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} locale={locale} />
              ))}
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function SummaryCard({
  totalWorkouts,
  totalVolume,
  avgDurationSec,
}: {
  totalWorkouts: number;
  totalVolume: number;
  avgDurationSec: number;
}) {
  const { t } = useI18n();

  const stats: Array<{ label: string; value: string; icon: React.ReactNode }> = [
    {
      label: t("history.total"),
      value: String(totalWorkouts),
      icon: <Layers className="h-4 w-4 text-primary" />,
    },
    {
      label: t("history.totalVolume"),
      value: totalVolume.toFixed(0),
      icon: <Activity className="h-4 w-4 text-primary" />,
    },
    {
      label: t("history.avgDuration"),
      value: formatTime(avgDurationSec),
      icon: <Clock className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <Card className="p-3 gap-3 border-primary/20 bg-primary/5">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-start justify-center gap-1 px-1"
          >
            <div className="flex items-center gap-1 text-muted-foreground">
              {s.icon}
              <span className="text-[10px] uppercase tracking-wide font-medium leading-none">
                {s.label}
              </span>
            </div>
            <span className="text-xl font-bold tabular-nums leading-none">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SessionCard({
  session,
  locale,
}: {
  session: WorkoutSession;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  const dateLabel = formatDate(session.startedAt, locale);

  return (
    <Link
      href={`/history/${session.id}`}
      className="block touch-manipulation"
      aria-label={`${session.format} ${dateLabel}`}
    >
      <Card className="relative p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer overflow-hidden">
        {/* Row 1: format badge + date */}
        <div className="flex items-center justify-between gap-2 pr-6">
          <Badge
            variant="outline"
            className={cn(
              "uppercase font-bold tracking-wide text-[10px]",
              FORMAT_COLORS[session.format]
            )}
          >
            {t(FORMAT_LABEL_KEY[session.format])}
          </Badge>
          <span className="text-xs text-muted-foreground tabular-nums">
            {dateLabel}
          </span>
        </div>

        {/* Row 2: 3 metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Metric
            label={t("history.duration")}
            value={formatTime(session.durationSec)}
          />
          <Metric
            label={t("history.rounds")}
            value={String(session.totalRounds)}
          />
          <Metric
            label={t("history.volume")}
            value={session.totalVolume.toFixed(0)}
          />
        </div>

        {/* Row 3 (optional): feeling */}
        {session.feelingRating != null && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60 mt-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              {t("history.feeling")}
            </span>
            <FeelingDots value={session.feelingRating} />
          </div>
        )}

        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </Card>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium leading-none">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums leading-none">
        {value}
      </span>
    </div>
  );
}

function FeelingDots({ value }: { value: number }) {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${v}/10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            i < v ? "bg-primary" : "bg-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Dumbbell className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-5 max-w-[240px]">
        {t("history.empty")}
      </p>
      <Link href="/builder">
        <Button className="min-h-[44px] h-11">
          <Plus className="h-4 w-4" />
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

function SkeletonList() {
  return (
    <div className="space-y-3">
      {/* Summary skeleton */}
      <Card className="p-3 gap-3">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </Card>
      {/* Session cards skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-3 gap-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ====== Progress charts (Phase 2) ======

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(ts: number): number {
  // Bucket start = Monday 00:00 local time
  const d = new Date(ts);
  const day = d.getDay(); // 0 (Sun) .. 6 (Sat)
  const diff = (day === 0 ? 6 : day - 1) * DAY_MS;
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return midnight - diff;
}

function formatWeekLabel(mondayTs: number, locale: "ru" | "en"): string {
  try {
    const d = new Date(mondayTs);
    return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return String(mondayTs);
  }
}

function formatSessionShortDate(iso: string, locale: "ru" | "en"): string {
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

function ProgressCharts({
  sessions,
  locale,
}: {
  sessions: WorkoutSession[];
  locale: "ru" | "en";
}) {
  const { t } = useI18n();

  // --- BarChart: last 8 weeks of volume ---
  const now = Date.now();
  const thisMonday = startOfWeek(now);
  const weekBuckets: Array<{ label: string; volume: number }> = [];
  for (let i = 7; i >= 0; i--) {
    const monday = thisMonday - i * 7 * DAY_MS;
    const nextMonday = monday + 7 * DAY_MS;
    const volume = sessions
      .filter((s) => {
        const ts = new Date(s.startedAt).getTime();
        return ts >= monday && ts < nextMonday;
      })
      .reduce((sum, s) => sum + (Number(s.totalVolume) || 0), 0);
    weekBuckets.push({
      label: formatWeekLabel(monday, locale),
      volume: Math.round(volume),
    });
  }

  // --- LineChart: last 10 sessions (chronological) ---
  const last10 = sessions.slice(0, 10).reverse();
  const roundsData = last10.map((s) => ({
    date: formatSessionShortDate(s.startedAt, locale),
    rounds: s.totalRounds,
  }));

  // Hide charts if there's no data at all
  const hasAnyVolume = weekBuckets.some((b) => b.volume > 0);
  const hasAnyRounds = roundsData.some((d) => d.rounds > 0);
  if (!hasAnyVolume && !hasAnyRounds) return null;

  return (
    <>
      {hasAnyVolume && (
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              {t("history.weeklyVolume")}
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekBuckets}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "currentColor" }}
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
                  cursor={{ fill: "rgba(220,38,38,0.08)" }}
                />
                <Bar
                  dataKey="volume"
                  fill="#dc2626"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                  name={t("history.volume")}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {hasAnyRounds && (
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              {t("history.roundsProgress")}
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={roundsData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: "currentColor" }}
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
                  allowDecimals={false}
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
                  cursor={{ stroke: "#dc2626", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="rounds"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#dc2626", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name={t("history.rounds")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </>
  );
}
