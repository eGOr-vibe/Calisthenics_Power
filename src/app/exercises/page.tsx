"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Dumbbell,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type {
  Exercise,
  ExerciseType,
  Equipment,
  LevelBase,
  Vector,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const TYPE_OPTIONS: ExerciseType[] = [
  "pull",
  "push",
  "core",
  "legs",
  "static",
  "mobility",
];
const EQUIPMENT_OPTIONS: Equipment[] = [
  "bar",
  "dips",
  "floor",
  "parallettes",
  "none",
  "wall",
  "rings",
  "bands",
  "weighted",
];
const LEVEL_OPTIONS: LevelBase[] = ["beginner", "intermediate", "advanced"];
const VECTOR_OPTIONS: Vector[] = ["reps", "static", "cut"];

const TYPE_COLORS: Record<ExerciseType, string> = {
  pull: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  push: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  core: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  legs: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  static: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  mobility: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
};

const LEVEL_COLORS: Record<LevelBase, string> = {
  beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-500 border-red-500/30",
};

// ====== Helpers ======

function loadCoefColor(coef: number): string {
  if (coef <= 2) return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
  if (coef <= 5) return "bg-amber-500/15 text-amber-500 border-amber-500/30";
  return "bg-red-500/15 text-red-500 border-red-500/30";
}

function muscleList(ex: Exercise, locale: "ru" | "en"): string[] {
  return locale === "ru" ? ex.targetMusclesRu : ex.targetMusclesEn;
}

function exerciseName(ex: Exercise, locale: "ru" | "en"): string {
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

// ====== Main component ======

function ExercisesCatalog() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL filters
  const typeFilter = (searchParams.get("type") ?? "all") as ExerciseType | "all";
  const equipmentFilter = (searchParams.get("equipment") ?? "all") as
    | Equipment
    | "all";
  const levelFilter = (searchParams.get("level") ?? "all") as
    | LevelBase
    | "all";
  const vectorFilter = (searchParams.get("vector") ?? "all") as Vector | "all";
  const urlQuery = searchParams.get("q") ?? "";

  // Search state with debounce (300ms)
  const [search, setSearch] = React.useState(urlQuery);
  const debouncedSearch = React.useDeferredValue(search);

  // Sync local search state when URL changes externally
  React.useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  // Push debounced search to URL
  React.useEffect(() => {
    if (debouncedSearch === urlQuery) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch.trim()) {
      params.set("q", debouncedSearch.trim());
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.replace(qs ? `/exercises?${qs}` : "/exercises");
  }, [debouncedSearch]);

  // Filter sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Has any active filters (excluding search)
  const hasActiveFilters =
    typeFilter !== "all" ||
    equipmentFilter !== "all" ||
    levelFilter !== "all" ||
    vectorFilter !== "all";

  // Data fetching
  const exercisesQuery = useQuery({
    queryKey: [
      "exercises",
      {
        type: typeFilter,
        equipment: equipmentFilter,
        level: levelFilter,
        vector: vectorFilter,
        q: debouncedSearch.trim(),
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (equipmentFilter !== "all") params.set("equipment", equipmentFilter);
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (vectorFilter !== "all") params.set("vector", vectorFilter);
      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());

      const url = `/api/exercises${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("exercises fetch failed");
      }
      return (await res.json()) as Exercise[];
    },
  });

  // --- Filter helpers ---

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `/exercises?${qs}` : "/exercises");
  };

  const resetFilters = () => {
    router.replace("/exercises");
    setSheetOpen(false);
  };

  const exercises = exercisesQuery.data ?? [];

  // --- Render ---

  return (
    <MobileShell>
      <PageHeader
        title={t("ex.title")}
        right={
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSheetOpen(true)}
            aria-label="Filters"
            className="relative min-h-[44px] min-w-[44px] h-11 w-11"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
            )}
          </Button>
        }
      />

      <div className="flex-1 px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("ex.search")}
            className="h-11 pl-9"
            inputMode="search"
            type="search"
            aria-label={t("ex.search")}
          />
        </div>

        {/* Quick type chips */}
        <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
          <div className="flex items-center gap-2 w-max pb-1">
            <FilterChip
              active={typeFilter === "all"}
              onClick={() => setFilter("type", "all")}
              label={t("ex.filter.all")}
            />
            {TYPE_OPTIONS.map((type) => (
              <FilterChip
                key={type}
                active={typeFilter === type}
                onClick={() => setFilter("type", type)}
                label={t(`ex.type.${type}` as DictKey)}
              />
            ))}
          </div>
        </div>

        {/* List */}
        {exercisesQuery.isLoading ? (
          <SkeletonList />
        ) : exercisesQuery.isError ? (
          <ErrorState onRetry={() => exercisesQuery.refetch()} />
        ) : exercises.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-2">
            {exercises.map((ex) => (
              <ExerciseCard key={ex.slug} exercise={ex} />
            ))}
          </div>
        )}
      </div>

      {/* Filter sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
            <SheetTitle className="text-base font-bold">
              {t("ex.title")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("ex.title")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Type */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                {t("ex.filter.type")}
              </Label>
              <Select
                value={typeFilter}
                onValueChange={(v) => setFilter("type", v)}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("ex.filter.all")}</SelectItem>
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`ex.type.${type}` as DictKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                {t("ex.filter.equipment")}
              </Label>
              <Select
                value={equipmentFilter}
                onValueChange={(v) => setFilter("equipment", v)}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("ex.filter.all")}</SelectItem>
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {t(`eq.${eq}` as DictKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                {t("ex.filter.level")}
              </Label>
              <Select
                value={levelFilter}
                onValueChange={(v) => setFilter("level", v)}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("ex.filter.all")}</SelectItem>
                  {LEVEL_OPTIONS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {t(`level.${lvl}` as DictKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vector */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                {t("ex.filter.vector")}
              </Label>
              <Select
                value={vectorFilter}
                onValueChange={(v) => setFilter("vector", v)}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("ex.filter.all")}</SelectItem>
                  {VECTOR_OPTIONS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {t(`vector.${v}` as DictKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="border-t border-border px-4 py-3 flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t("ex.reset")}</span>
            </Button>
            <Button
              className="flex-1 h-11"
              onClick={() => setSheetOpen(false)}
            >
              {t("common.close")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const { t, locale } = useI18n();
  const name = exerciseName(exercise, locale);
  const muscles = muscleList(exercise, locale);

  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className="block touch-manipulation"
      aria-label={name}
    >
      <Card className="p-2.5 gap-1.5 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98] transition-all cursor-pointer h-full min-h-[100px] flex flex-col">
        <h3 className="font-semibold text-xs leading-tight line-clamp-2 min-h-[2rem]">
          {name}
        </h3>
        <div className="flex flex-wrap items-center gap-1 mt-auto">
          <Badge
            variant="outline"
            className={cn("border text-[9px] h-4 px-1", TYPE_COLORS[exercise.type])}
          >
            {t(`ex.type.${exercise.type}` as DictKey)}
          </Badge>
          <Badge
            variant="outline"
            className={cn("border text-[9px] h-4 px-1 font-bold tabular-nums", loadCoefColor(exercise.loadCoef))}
          >
            K{exercise.loadCoef}
          </Badge>
        </div>
        {muscles.length > 0 && (
          <p className="text-[9px] text-muted-foreground truncate leading-tight">
            {muscles.slice(0, 2).join(" · ")}
          </p>
        )}
      </Card>
    </Link>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-2.5 gap-1.5 min-h-[100px]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-5 rounded" />
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
        <Dumbbell className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("ex.empty")}</p>
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

// ====== Page wrapper (Suspense required for useSearchParams in Next.js 16) ======

export default function ExercisesPage() {
  return (
    <React.Suspense
      fallback={
        <MobileShell>
          <PageHeader title="" />
          <div className="flex-1 px-4 py-3 space-y-3">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-9 w-48 rounded-full" />
            <SkeletonList />
          </div>
        </MobileShell>
      }
    >
      <ExercisesCatalog />
    </React.Suspense>
  );
}
