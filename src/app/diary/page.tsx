"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Download,
  FileText,
  BookMarked,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  Activity,
  Tag,
  StickyNote,
  Plus,
  Dumbbell,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/lib/biomech";
import {
  parseCSV,
  parseTags,
  validateCSVRow,
  generateCSVTemplate,
  type CSVRow,
} from "@/lib/csv-import";
import type {
  SubstitutionRecord,
  WorkoutFormat,
  WorkoutSession,
  WorkoutSessionItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const SESSIONS_LIMIT = 200;

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

/**
 * Палитра цветов для тегов (детерминированный выбор по хэшу строки).
 * Графитово-красная тема + несколько акцентных оттенков для читаемости.
 */
const TAG_COLOR_CLASSES = [
  "bg-red-500/15 text-red-400 border-red-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "bg-teal-500/15 text-teal-400 border-teal-500/30",
];

function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % TAG_COLOR_CLASSES.length;
  return TAG_COLOR_CLASSES[idx];
}

// ====== Helpers ======

/**
 * Normalize a session row coming from the API.
 * Принимает как корректно смапленный WorkoutSession (со списком `tags`),
 * так и «сырую» строку из БД (`tags` как JSON-строка).
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

  let tags: string[] | null = null;
  if (Array.isArray(raw.tags)) {
    tags = raw.tags.filter((t: unknown): t is string => typeof t === "string");
  } else if (typeof raw.tags === "string" && raw.tags.trim() !== "") {
    try {
      const parsed = JSON.parse(raw.tags);
      if (Array.isArray(parsed)) {
        tags = parsed.filter(
          (t: unknown): t is string => typeof t === "string",
        );
      }
    } catch {
      tags = null;
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
    tags,
    source: (raw.source as WorkoutSession["source"]) ?? "manual",
  };
}

function formatDate(iso: string, locale: "ru" | "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTopTag(sessions: WorkoutSession[]): string | null {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (!s.tags || s.tags.length === 0) continue;
    for (const tag of s.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  let topTag: string | null = null;
  let topCount = 0;
  for (const [tag, count] of counts) {
    if (count > topCount) {
      topTag = tag;
      topCount = count;
    }
  }
  return topTag;
}

// ====== Main component ======

export default function DiaryPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
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

  const sessions = sessionsQuery.data ?? [];
  const totalWorkouts = sessions.length;
  const totalVolume = sessions.reduce(
    (s, w) => s + (Number(w.totalVolume) || 0),
    0,
  );
  const totalDurationSec = sessions.reduce(
    (s, w) => s + (w.durationSec || 0),
    0,
  );
  const avgDurationSec =
    totalWorkouts > 0 ? Math.round(totalDurationSec / totalWorkouts) : 0;
  const topTag = getTopTag(sessions);

  // --- Import flow ---
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = React.useState<CSVRow[] | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setParsedRows(null);
      setFileName(null);
      setParseError(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result ?? "");
      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setParsedRows(null);
          setParseError(t("diary.invalidFormat"));
          return;
        }
        setParsedRows(rows);
        setParseError(null);
      } catch {
        setParsedRows(null);
        setParseError(t("diary.invalidFormat"));
      }
    };
    reader.onerror = () => {
      setParsedRows(null);
      setParseError(t("diary.invalidFormat"));
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workout-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importMutation = useMutation({
    mutationFn: async (rows: CSVRow[]) => {
      const res = await fetch("/api/workouts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions: rows, source: "csv" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "import_failed");
      }
      return res.json();
    },
    onSuccess: (data: { imported?: number }) => {
      const imported = data?.imported ?? 0;
      toast({
        title: t("diary.importSuccess", { n: imported }),
      });
      setParsedRows(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: t("diary.importError", { error: msg }),
        variant: "destructive",
      });
    },
  });

  const validRows = React.useMemo<CSVRow[]>(() => {
    if (!parsedRows) return [];
    return parsedRows.filter((_, idx) => {
      const err = validateCSVRow(parsedRows[idx], idx + 2);
      return err === null;
    });
  }, [parsedRows]);

  const previewRows = parsedRows?.slice(0, 10) ?? [];

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  return (
    <MobileShell>
      <PageHeader
        title={t("diary.title")}
        subtitle={t("diary.subtitle")}
        right={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleManualRefresh}
            aria-label={t("common.retry")}
            className="min-h-[44px] min-w-[44px] h-11 w-11"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        }
      />

      <div className="flex-1 px-4 py-3 space-y-4">
        {/* === Import section === */}
        <ImportSection
          fileName={fileName}
          parseError={parseError}
          parsedRows={parsedRows}
          previewRows={previewRows}
          validCount={validRows.length}
          totalCount={parsedRows?.length ?? 0}
          onDownloadTemplate={handleDownloadTemplate}
          onSelectFileClick={handleSelectFileClick}
          onFileChange={handleFileChange}
          onImport={() => importMutation.mutate(validRows)}
          isImporting={importMutation.isPending}
          fileInputRef={fileInputRef}
          locale={locale}
        />

        {/* === Stats === */}
        {sessionsQuery.isLoading ? (
          <SkeletonStats />
        ) : sessionsQuery.isError ? (
          <ErrorState onRetry={() => sessionsQuery.refetch()} />
        ) : totalWorkouts > 0 ? (
          <StatsCard
            totalWorkouts={totalWorkouts}
            totalVolume={totalVolume}
            avgDurationSec={avgDurationSec}
            topTag={topTag}
          />
        ) : null}

        {/* === My workouts === */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 px-1">
            <BookMarked className="h-4 w-4 text-primary" />
            {t("diary.myWorkouts")}
          </h2>

          {sessionsQuery.isLoading ? (
            <SkeletonList />
          ) : sessionsQuery.isError ? null : totalWorkouts === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <DiarySessionCard key={s.id} session={s} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function ImportSection({
  fileName,
  parseError,
  parsedRows,
  previewRows,
  validCount,
  totalCount,
  onDownloadTemplate,
  onSelectFileClick,
  onFileChange,
  onImport,
  isImporting,
  fileInputRef,
  locale,
}: {
  fileName: string | null;
  parseError: string | null;
  parsedRows: CSVRow[] | null;
  previewRows: CSVRow[];
  validCount: number;
  totalCount: number;
  onDownloadTemplate: () => void;
  onSelectFileClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  isImporting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();

  return (
    <Card className="p-3 gap-3 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{t("diary.import")}</h2>
      </div>

      {/* 3-step instruction */}
      <ol className="space-y-1.5 text-xs text-muted-foreground">
        <li className="flex gap-2">
          <span className="font-medium text-foreground shrink-0">
            {t("diary.importStep1")}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-foreground shrink-0">
            {t("diary.importStep2")}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-foreground shrink-0">
            {t("diary.importStep3")}
          </span>
        </li>
      </ol>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={onDownloadTemplate}
          className="min-h-[44px] h-11 justify-start"
        >
          <Download className="h-4 w-4" />
          {t("diary.downloadTemplate")}
        </Button>

        <Button
          variant="default"
          onClick={onSelectFileClick}
          className="min-h-[44px] h-11"
        >
          <FileText className="h-4 w-4" />
          {t("diary.selectFile")}
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileChange}
          className="hidden"
        />

        {fileName && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate">{fileName}</span>
          </p>
        )}
        {!fileName && !parseError && (
          <p className="text-xs text-muted-foreground">{t("diary.noFile")}</p>
        )}
        {parseError && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            {parseError}
          </p>
        )}
      </div>

      {/* Preview */}
      {parsedRows && parsedRows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("diary.preview")}
            </h3>
            <Badge variant="secondary" className="text-[10px]">
              {validCount}/{totalCount}
            </Badge>
          </div>

          <div className="overflow-x-auto -mx-1 rounded-md border border-border/60 bg-background/40">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">
                    date
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">
                    format
                  </th>
                  <th className="px-2 py-1 text-right font-medium text-muted-foreground">
                    min
                  </th>
                  <th className="px-2 py-1 text-right font-medium text-muted-foreground">
                    rds
                  </th>
                  <th className="px-2 py-1 text-right font-medium text-muted-foreground">
                    vol
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">
                    tags
                  </th>
                  <th className="px-2 py-1 text-right font-medium text-muted-foreground">
                    feel
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => {
                  const rowNum = idx + 2;
                  const err = validateCSVRow(row, rowNum);
                  const tagList = parseTags(row.tags);
                  return (
                    <tr
                      key={`${row.date}-${idx}`}
                      className={cn(
                        "border-t border-border/40",
                        err && "bg-destructive/10",
                      )}
                    >
                      <td className="px-2 py-1 whitespace-nowrap">{row.date}</td>
                      <td className="px-2 py-1 uppercase font-medium">
                        {row.format}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {row.duration_min ?? ""}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {row.rounds ?? ""}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {row.volume ?? ""}
                      </td>
                      <td className="px-2 py-1 truncate max-w-[120px]">
                        {tagList.length > 0 ? tagList.join("; ") : ""}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {row.feeling ?? ""}
                      </td>
                    </tr>
                  );
                })}
                {totalCount > previewRows.length && (
                  <tr className="border-t border-border/40">
                    <td
                      colSpan={7}
                      className="px-2 py-1 text-center text-muted-foreground italic"
                    >
                      +{totalCount - previewRows.length}{" "}
                      {locale === "ru" ? "ещё" : "more"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Button
            onClick={onImport}
            disabled={validCount === 0 || isImporting}
            className="w-full min-h-[44px] h-11"
          >
            <Upload className="h-4 w-4" />
            {isImporting
              ? t("common.loading")
              : t("diary.importButton", { n: validCount })}
          </Button>
        </div>
      )}
    </Card>
  );
}

function StatsCard({
  totalWorkouts,
  totalVolume,
  avgDurationSec,
  topTag,
}: {
  totalWorkouts: number;
  totalVolume: number;
  avgDurationSec: number;
  topTag: string | null;
}) {
  const { t } = useI18n();

  const stats: Array<{ label: string; value: string; icon: React.ReactNode }> =
    [
      {
        label: t("diary.totalWorkouts"),
        value: String(totalWorkouts),
        icon: <Layers className="h-4 w-4 text-primary" />,
      },
      {
        label: t("diary.totalVolume"),
        value: totalVolume.toFixed(0),
        icon: <Activity className="h-4 w-4 text-primary" />,
      },
      {
        label: t("diary.avgDuration"),
        value: formatTime(avgDurationSec),
        icon: <Clock className="h-4 w-4 text-primary" />,
      },
      {
        label: t("diary.topTag"),
        value: topTag ?? t("diary.noTopTag"),
        icon: <Tag className="h-4 w-4 text-primary" />,
      },
    ];

  return (
    <Card className="p-3 gap-3 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{t("diary.stats")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
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
            <span className="text-base font-bold tabular-nums leading-none truncate max-w-full">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DiarySessionCard({
  session,
  locale,
}: {
  session: WorkoutSession;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  const dateLabel = formatDate(session.startedAt, locale);
  const tags = session.tags ?? [];

  return (
    <Link
      href={`/history/${session.id}`}
      className="block touch-manipulation"
      aria-label={`${session.format} ${dateLabel}`}
    >
      <Card className="relative p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer overflow-hidden">
        {/* Row 1: format badge + date + source indicator */}
        <div className="flex items-center justify-between gap-2 pr-6">
          <div className="flex items-center gap-2 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                "uppercase font-bold tracking-wide text-[10px]",
                FORMAT_COLORS[session.format],
              )}
            >
              {t(FORMAT_LABEL_KEY[session.format])}
            </Badge>
            {session.source && session.source !== "manual" && (
              <Badge
                variant="secondary"
                className="text-[9px] uppercase tracking-wide"
              >
                {session.source}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums truncate">
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

        {/* Tags row */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-border/60 mt-1">
            <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
            {tags.slice(0, 6).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn("text-[10px] font-medium", tagColor(tag))}
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 6 && (
              <span className="text-[10px] text-muted-foreground">
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Notes preview */}
        {session.notes && session.notes.trim() !== "" && (
          <div className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
            <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
            <p className="line-clamp-2 leading-snug">{session.notes}</p>
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

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Dumbbell className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-5 max-w-[260px]">
        {t("diary.empty")}
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
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
      <Button variant="outline" onClick={onRetry} className="min-h-[44px] h-11">
        <RotateCcw className="h-4 w-4" />
        {t("common.retry")}
      </Button>
    </div>
  );
}

function SkeletonStats() {
  return (
    <Card className="p-3 gap-3">
      <Skeleton className="h-4 w-24" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function SkeletonList() {
  return (
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
  );
}
