"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Target,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  CalendarDays,
  Flag,
  ChevronRight,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import type {
  Goal,
  GoalType,
  GoalStatus,
  StaticElement,
  SkillNode,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const GOAL_TYPES: GoalType[] = ["element", "reps", "weight", "habit", "custom"];

const TYPE_COLORS: Record<GoalType, string> = {
  element: "bg-red-500/15 text-red-500 border-red-500/30",
  reps: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  weight: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  habit: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  custom: "bg-sky-500/15 text-sky-500 border-sky-500/30",
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  completed: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  paused: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  abandoned: "bg-muted text-muted-foreground border-border",
};

// ====== Helpers ======

function calcProgress(g: Goal): number {
  if (!g.targetValue || g.targetValue <= 0) return 0;
  const pct = (g.currentValue / g.targetValue) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const now = Date.now();
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string | null, locale: "ru" | "en"): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ====== Main component ======

export default function GoalsPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Data: goals ---
  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("goals fetch failed");
      return (await res.json()) as Goal[];
    },
  });

  // --- Data: static elements (for select) ---
  const staticsQuery = useQuery({
    queryKey: ["static-elements"],
    queryFn: async () => {
      const res = await fetch("/api/static-elements");
      if (!res.ok) throw new Error("static-elements fetch failed");
      return (await res.json()) as StaticElement[];
    },
  });

  // --- Data: skills (for select) ---
  const skillsQuery = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await fetch("/api/skills");
      if (!res.ok) throw new Error("skills fetch failed");
      return (await res.json()) as SkillNode[];
    },
  });

  // --- Create/Edit sheet ---
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    type: "reps" as GoalType,
    targetValue: "",
    targetUnit: "",
    targetDate: "",
    currentValue: "",
    staticElementSlug: "none",
    skillNodeSlug: "none",
  });

  function resetForm() {
    setForm({
      title: "",
      description: "",
      type: "reps",
      targetValue: "",
      targetUnit: "",
      targetDate: "",
      currentValue: "",
      staticElementSlug: "none",
      skillNodeSlug: "none",
    });
    setEditingGoal(null);
  }

  function openCreate() {
    resetForm();
    setSheetOpen(true);
  }

  function openEdit(g: Goal) {
    setEditingGoal(g);
    setForm({
      title: g.title,
      description: g.description ?? "",
      type: g.type,
      targetValue: g.targetValue?.toString() ?? "",
      targetUnit: g.targetUnit ?? "",
      targetDate: g.targetDate ? g.targetDate.slice(0, 10) : "",
      currentValue: g.currentValue?.toString() ?? "",
      staticElementSlug: g.staticElementSlug ?? "none",
      skillNodeSlug: g.skillNodeSlug ?? "none",
    });
    setSheetOpen(true);
  }

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("goal create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: t("goals.created") });
      setSheetOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("goal update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: t("goals.updated") });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("goal delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: t("goals.deleted") });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) throw new Error("goal complete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: t("goals.completedToast") });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  // --- Delete confirm ---
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // --- Progress sheet (per-goal slider) ---
  const [progressGoal, setProgressGoal] = React.useState<Goal | null>(null);
  const [progressValue, setProgressValue] = React.useState(0);

  function openProgress(g: Goal) {
    setProgressGoal(g);
    setProgressValue(g.currentValue);
  }

  function saveProgress() {
    if (!progressGoal) return;
    updateMutation.mutate({
      id: progressGoal.id,
      payload: { currentValue: progressValue },
    });
    setProgressGoal(null);
  }

  // --- Save (create/update) ---
  function handleSave() {
    const isEdit = !!editingGoal;
    const title = form.title.trim();
    if (!title) return;
    const payload: Record<string, unknown> = {
      title,
      description: form.description.trim() || null,
      type: form.type,
      targetValue: form.targetValue === "" ? null : Number(form.targetValue),
      targetUnit: form.targetUnit.trim() || null,
      targetDate: form.targetDate || null,
      currentValue: form.currentValue === "" ? 0 : Number(form.currentValue),
      staticElementSlug: form.staticElementSlug === "none" ? null : form.staticElementSlug,
      skillNodeSlug: form.skillNodeSlug === "none" ? null : form.skillNodeSlug,
    };
    if (isEdit && editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, payload });
      setSheetOpen(false);
    } else {
      createMutation.mutate(payload);
    }
  }

  // --- Derived lists ---
  const allGoals = goalsQuery.data ?? [];
  const activeGoals = allGoals.filter(
    (g) => g.status === "active" || g.status === "paused",
  );
  const completedGoals = allGoals.filter((g) => g.status === "completed");

  return (
    <MobileShell>
      <PageHeader
        title={t("goals.title")}
        subtitle={t("goals.subtitle")}
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
          {t("goals.intro")}
        </p>

        {/* Active goals */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-2">
            <Flag className="h-3.5 w-3.5" />
            <span>{t("goals.active")}</span>
            <Badge variant="secondary" className="text-[10px]">
              {activeGoals.length}
            </Badge>
          </h3>

          {goalsQuery.isLoading ? (
            <SkeletonList />
          ) : goalsQuery.isError ? (
            <ErrorState onRetry={() => goalsQuery.refetch()} />
          ) : activeGoals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {activeGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  locale={locale}
                  onEdit={() => openEdit(g)}
                  onProgress={() => openProgress(g)}
                  onComplete={() => completeMutation.mutate(g.id)}
                  onDelete={() => setDeleteId(g.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed goals (collapsible) */}
        {completedGoals.length > 0 && (
          <section className="space-y-2">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between h-11 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground touch-manipulation"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t("goals.completed")}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {completedGoals.length}
                    </Badge>
                  </span>
                  <span className="text-foreground/60 text-base">▾</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 pt-1">
                  {completedGoals.map((g) => (
                    <GoalCard
                      key={g.id}
                      goal={g}
                      locale={locale}
                      onEdit={() => openEdit(g)}
                      onProgress={() => openProgress(g)}
                      onComplete={() => completeMutation.mutate(g.id)}
                      onDelete={() => setDeleteId(g.id)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>
        )}

        {/* Link to problems */}
        <Link
          href="/problems"
          className="block touch-manipulation"
        >
          <Card className="p-3 flex items-center justify-between hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/15">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">
                  {t("problems.title")}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {t("problems.subtitle")}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Card>
        </Link>
      </div>

      {/* Floating create button */}
      <div className="sticky bottom-24 z-30 px-4 pb-2 pt-2">
        <Button
          variant="default"
          className="w-full h-12 shadow-lg"
          onClick={openCreate}
        >
          <Plus className="h-5 w-5" />
          <span>{t("goals.create")}</span>
        </Button>
      </div>

      {/* Create/Edit sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) resetForm();
        }}
      >
        <SheetContent
          side="bottom"
          className="h-[90vh] max-w-md mx-auto w-full rounded-t-xl p-0 gap-0"
        >
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="text-base">
              {editingGoal ? t("goals.edit") : t("goals.create")}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {t("goals.intro")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="goal-title" className="text-xs text-muted-foreground">
                {t("goals.title_field")}
              </Label>
              <Input
                id="goal-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="h-11"
                placeholder={t("goals.title_field")}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("goals.type")}
              </Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as GoalType }))
                }
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((ty) => (
                    <SelectItem key={ty} value={ty}>
                      {t(`goals.type.${ty}` as DictKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target value + unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {t("goals.target")}
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={form.targetValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetValue: e.target.value }))
                  }
                  className="h-11"
                  placeholder="20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {t("goals.unit")}
                </Label>
                <Input
                  value={form.targetUnit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetUnit: e.target.value }))
                  }
                  className="h-11"
                  placeholder="reps / sec / kg"
                />
              </div>
            </div>

            {/* Current progress */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("goals.current")}
              </Label>
              <Input
                type="number"
                inputMode="decimal"
                value={form.currentValue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, currentValue: e.target.value }))
                }
                className="h-11"
                placeholder="0"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <Label htmlFor="goal-deadline" className="text-xs text-muted-foreground">
                {t("goals.deadline")}
              </Label>
              <Input
                id="goal-deadline"
                type="date"
                value={form.targetDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetDate: e.target.value }))
                }
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="goal-desc" className="text-xs text-muted-foreground">
                {t("goals.description")}
              </Label>
              <Textarea
                id="goal-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder={t("goals.description")}
                rows={3}
              />
            </div>

            {/* Linked static element */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("goals.linkedElement")}
              </Label>
              <Select
                value={form.staticElementSlug}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, staticElementSlug: v }))
                }
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("goals.none")}</SelectItem>
                  {(staticsQuery.data ?? []).map((el) => (
                    <SelectItem key={el.slug} value={el.slug}>
                      {locale === "ru" ? el.nameRu : el.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Linked skill node */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("goals.linkedSkill")}
              </Label>
              <Select
                value={form.skillNodeSlug}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, skillNodeSlug: v }))
                }
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("goals.none")}</SelectItem>
                  {(skillsQuery.data ?? []).map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {locale === "ru" ? s.nameRu : s.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="border-t border-border p-4">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => {
                setSheetOpen(false);
                resetForm();
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="w-full h-11"
              onClick={handleSave}
              disabled={!form.title.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {t("common.save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Progress update sheet */}
      <Sheet
        open={!!progressGoal}
        onOpenChange={(v) => {
          if (!v) setProgressGoal(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-w-md mx-auto w-full rounded-t-xl p-0 gap-0"
        >
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="text-base">
              {t("goals.updateProgress")}
            </SheetTitle>
            {progressGoal && (
              <SheetDescription className="text-sm">
                {progressGoal.title}
                {progressGoal.targetValue
                  ? ` / ${progressGoal.targetValue} ${progressGoal.targetUnit ?? ""}`
                  : ""}
              </SheetDescription>
            )}
          </SheetHeader>
          <div className="flex-1 px-4 py-6 space-y-4">
            {progressGoal?.targetValue && progressGoal.targetValue > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold tabular-nums">
                  {progressValue}
                  <span className="text-base text-muted-foreground ml-1">
                    / {progressGoal.targetValue} {progressGoal.targetUnit ?? ""}
                  </span>
                </div>
                <Progress
                  value={calcProgress({
                    ...progressGoal,
                    currentValue: progressValue,
                  })}
                  className="h-2 mt-3"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {t("goals.current")}
              </Label>
              <Slider
                min={0}
                max={
                  progressGoal?.targetValue && progressGoal.targetValue > 0
                    ? Math.max(progressGoal.targetValue, progressValue)
                    : 100
                }
                step={1}
                value={[progressValue]}
                onValueChange={(v) => setProgressValue(v[0] ?? 0)}
              />
            </div>
            <Input
              type="number"
              inputMode="decimal"
              value={progressValue}
              onChange={(e) => setProgressValue(Number(e.target.value) || 0)}
              className="h-11"
            />
          </div>
          <SheetFooter className="border-t border-border p-4">
            <Button
              className="w-full h-11"
              onClick={saveProgress}
              disabled={updateMutation.isPending}
            >
              {t("common.save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("goals.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("goals.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
}

// ====== Sub-components ======

function GoalCard({
  goal,
  locale,
  onEdit,
  onProgress,
  onComplete,
  onDelete,
}: {
  goal: Goal;
  locale: "ru" | "en";
  onEdit: () => void;
  onProgress: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const progress = calcProgress(goal);
  const days = daysUntil(goal.targetDate);
  const isCompleted = goal.status === "completed";

  return (
    <Card
      className={cn(
        "p-3 gap-2 transition-all",
        isCompleted && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn("border text-[10px]", TYPE_COLORS[goal.type])}
            >
              {t(`goals.type.${goal.type}` as DictKey)}
            </Badge>
            {goal.status !== "active" && (
              <Badge
                variant="outline"
                className={cn("border text-[10px]", STATUS_COLORS[goal.status])}
              >
                {goal.status}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-base leading-tight mt-1.5">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mt-1">
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {goal.targetValue ? (
        <div className="space-y-1.5 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium tabular-nums">
              {goal.currentValue}
              <span className="text-muted-foreground">
                {" / "}
                {goal.targetValue} {goal.targetUnit ?? ""}
              </span>
            </span>
            <span className="text-muted-foreground tabular-nums">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          {t("goals.current")}: {goal.currentValue}
          {goal.targetUnit ? ` ${goal.targetUnit}` : ""}
        </div>
      )}

      {/* Deadline info */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {goal.targetDate
            ? formatDate(goal.targetDate, locale)
            : t("goals.noDeadline")}
        </span>
        {days !== null && !isCompleted && (
          <span
            className={cn(
              "font-medium",
              days < 0
                ? "text-red-500"
                : days <= 7
                  ? "text-amber-500"
                  : "text-emerald-500",
            )}
          >
            {days < 0
              ? t("goals.overdue")
              : t("goals.daysLeft", { n: days })}
          </span>
        )}
        {isCompleted && goal.completedAt && (
          <span className="text-emerald-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t("goals.completedAt")}: {formatDate(goal.completedAt, locale)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-1">
        {!isCompleted && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex-1"
              onClick={onProgress}
            >
              <Target className="h-4 w-4" />
              <span>{t("goals.updateProgress")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={onComplete}
              aria-label={t("goals.markComplete")}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={onEdit}
              aria-label={t("goals.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label={t("common.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        {isCompleted && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={onEdit}
              aria-label={t("goals.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label={t("common.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-3 gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="h-5 w-2/3 mt-1.5" />
          <Skeleton className="h-2 w-full mt-2" />
          <div className="flex gap-1.5 mt-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Target className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("goals.noGoals")}</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
      <Button variant="outline" onClick={onRetry} className="min-h-[44px]">
        {t("common.retry")}
      </Button>
    </div>
  );
}
