"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Clock,
  ArrowRight,
  Calendar,
  StickyNote,
  Dumbbell,
  Repeat,
  Layers,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
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

// ====== Helpers ======

/**
 * Normalize a session row coming from the API.
 * Accepts both a properly mapped WorkoutSession (from list endpoint)
 * and a raw prisma row (from [id] endpoint where items/substitutions
 * are JSON strings and format is uppercase).
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

function formatFullDate(iso: string, locale: "ru" | "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimeOfDay(iso: string, locale: "ru" | "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(locale === "ru" ? "ru-RU" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exerciseName(
  slug: string,
  exercises: Exercise[] | undefined,
  locale: "ru" | "en"
): string {
  const ex = exercises?.find((e) => e.slug === slug);
  if (!ex) return slug;
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

// ====== Main component ======

export default function SessionDetailPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = String((params as { id: string }).id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const sessionQuery = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const res = await fetch(`/api/workouts/sessions/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) {
        throw new Error("session fetch failed");
      }
      const data = await res.json();
      return normalizeSession(data);
    },
    retry: false,
  });

  const exercisesQuery = useQuery({
    queryKey: ["exercises", { all: true }],
    queryFn: async () => {
      const res = await fetch("/api/exercises");
      if (!res.ok) throw new Error("exercises fetch failed");
      return (await res.json()) as Exercise[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workouts/sessions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("delete failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.removeQueries({ queryKey: ["session", id] });
      toast({ title: t("history.deletedToast") });
      router.push("/history");
    },
    onError: () => {
      toast({ title: t("common.error") });
    },
  });

  const handleBack = () => {
    if (history.length > 1) {
      router.back();
    } else {
      router.push("/history");
    }
  };

  const session = sessionQuery.data;
  const exercises = exercisesQuery.data;
  const dateTitle = session
    ? formatFullDate(session.startedAt, locale)
    : t("history.title");

  return (
    <MobileShell>
      <PageHeader
        title={dateTitle}
        subtitle={session ? t(FORMAT_LABEL_KEY[session.format]) : undefined}
        right={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label={t("common.back")}
            className="min-h-[44px] min-w-[44px] h-11 w-11"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />

      <div className="flex-1 px-4 py-3 space-y-4">
        {sessionQuery.isLoading ? (
          <SkeletonDetail />
        ) : sessionQuery.isError ? (
          <ErrorState onRetry={() => sessionQuery.refetch()} />
        ) : !session ? (
          <NotFoundState onBack={handleBack} />
        ) : (
          <>
            <SummaryCard
              session={session}
              exercises={exercises}
              locale={locale}
            />

            <ExercisesSection
              session={session}
              exercises={exercises}
              locale={locale}
            />

            {session.substitutions.length > 0 && (
              <SubstitutionsSection
                session={session}
                exercises={exercises}
                locale={locale}
              />
            )}

            {session.notes && session.notes.trim() && (
              <NotesSection notes={session.notes} />
            )}

            {/* Delete action */}
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full min-h-[48px] h-12"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteMutation.isPending
                    ? t("common.loading")
                    : t("history.delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("history.confirmDelete")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("history.confirmDeleteDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={deleteMutation.isPending}
                    className="min-h-[44px]"
                  >
                    {t("common.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      deleteMutation.mutate();
                    }}
                    disabled={deleteMutation.isPending}
                    className="min-h-[44px] bg-destructive text-white hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending
                      ? t("common.loading")
                      : t("history.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function SummaryCard({
  session,
  exercises,
  locale,
}: {
  session: WorkoutSession;
  exercises: Exercise[] | undefined;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  const startTime = formatTimeOfDay(session.startedAt, locale);
  const finishTime = session.finishedAt
    ? formatTimeOfDay(session.finishedAt, locale)
    : "—";

  const metrics: Array<{ label: string; value: string; icon: React.ReactNode }> = [
    {
      label: t("history.rounds"),
      value: String(session.totalRounds),
      icon: <Repeat className="h-4 w-4 text-primary" />,
    },
    {
      label: t("history.reps"),
      value: String(session.totalReps),
      icon: <Dumbbell className="h-4 w-4 text-primary" />,
    },
    {
      label: t("history.volume"),
      value: session.totalVolume.toFixed(0),
      icon: <Layers className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <Card className="p-3 gap-3 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn(
            "uppercase font-bold tracking-wide",
            FORMAT_COLORS[session.format]
          )}
        >
          {t(FORMAT_LABEL_KEY[session.format])}
        </Badge>
        {session.feelingRating != null && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              {t("history.feeling")}
            </span>
            <FeelingDots value={session.feelingRating} />
          </div>
        )}
      </div>

      {/* Time range */}
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span className="tabular-nums">
            {startTime}
            <ArrowRight className="inline h-3 w-3 mx-1 align-middle" />
            {finishTime}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold tabular-nums">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {formatTime(session.durationSec)}
        </div>
      </div>

      {/* 3 large metrics */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-start justify-center gap-1"
          >
            <div className="flex items-center gap-1 text-muted-foreground">
              {m.icon}
              <span className="text-[10px] uppercase tracking-wide font-medium leading-none">
                {m.label}
              </span>
            </div>
            <span className="text-2xl font-bold tabular-nums leading-none">
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExercisesSection({
  session,
  exercises,
  locale,
}: {
  session: WorkoutSession;
  exercises: Exercise[] | undefined;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();

  if (session.items.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1">
        {t("history.exercises")}
      </h3>
      <div className="space-y-2">
        {session.items.map((item, idx) => {
          const ex = exercises?.find((e) => e.slug === item.exerciseSlug);
          return (
            <ExerciseItemRow
              key={`${item.exerciseSlug}-${idx}`}
              item={item}
              name={exerciseName(item.exerciseSlug, exercises, locale)}
              loadCoef={ex?.loadCoef ?? null}
            />
          );
        })}
      </div>
    </section>
  );
}

function ExerciseItemRow({
  item,
  name,
  loadCoef,
}: {
  item: WorkoutSessionItem;
  name: string;
  loadCoef: number | null;
}) {
  const { t } = useI18n();
  return (
    <Card className="p-3 gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm truncate flex-1">{name}</span>
        {loadCoef != null && (
          <Badge
            variant="outline"
            className="tabular-nums font-bold text-[10px] border-primary/30 bg-primary/10 text-primary"
          >
            K {loadCoef}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground tabular-nums">
        <span>
          {item.reps} {t("common.reps")} × {item.rounds}{" "}
          {t("timer.round").toLowerCase()}
        </span>
        <span className="font-medium text-foreground">
          {t("history.volume")}: {item.volume.toFixed(0)}
        </span>
      </div>
    </Card>
  );
}

function SubstitutionsSection({
  session,
  exercises,
  locale,
}: {
  session: WorkoutSession;
  exercises: Exercise[] | undefined;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();

  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1">
        {t("history.substitutions")} ({session.substitutions.length})
      </h3>
      <div className="space-y-2">
        {session.substitutions.map((subst, idx) => (
          <SubstitutionRow
            key={`${subst.fromSlug}-${subst.toSlug}-${subst.roundIndex}-${idx}`}
            subst={subst}
            exercises={exercises}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

function SubstitutionRow({
  subst,
  exercises,
  locale,
}: {
  subst: SubstitutionRecord;
  exercises: Exercise[] | undefined;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  const fromName = exerciseName(subst.fromSlug, exercises, locale);
  const toName = exerciseName(subst.toSlug, exercises, locale);

  const direction: "easier" | "harder" | "same" =
    subst.diffCoef < 0
      ? "easier"
      : subst.diffCoef > 0
        ? "harder"
        : "same";

  const diffColor =
    direction === "easier"
      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
      : direction === "harder"
        ? "bg-red-500/15 text-red-500 border-red-500/30"
        : "bg-muted text-muted-foreground border-border";

  const diffSign = direction === "easier" ? "−" : direction === "harder" ? "+" : "";

  return (
    <Card className="p-3 gap-2">
      {/* from → to */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium truncate flex-1">{fromName}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-primary truncate flex-1 text-right">
          {toName}
        </span>
      </div>
      {/* meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
        <span>
          {t("timer.round")} {subst.roundIndex}
        </span>
        <span>
          {t("history.reps")}: {subst.oldReps} → {subst.newReps}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "tabular-nums font-bold text-[10px]",
            diffColor
          )}
        >
          {t("history.diff")}: {diffSign}
          {Math.abs(subst.diffCoef)}
        </Badge>
      </div>
    </Card>
  );
}

function NotesSection({ notes }: { notes: string }) {
  const { t } = useI18n();
  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1 flex items-center gap-1.5">
        <StickyNote className="h-3.5 w-3.5" />
        {t("history.notes")}
      </h3>
      <Card className="p-3">
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {notes}
        </p>
      </Card>
    </section>
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

function NotFoundState({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        {t("history.notFound")}
      </p>
      <Button variant="outline" onClick={onBack} className="min-h-[44px] h-11">
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Button>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <Card className="p-3 gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-7 w-10" />
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-3 gap-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </Card>
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
