"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  GripVertical,
  Search,
  Save,
  Play,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Clock,
  Repeat,
  HeartPulse,
  Layers,
  Infinity as InfinityIcon,
  Square,
  Activity,
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
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { calcTotalStress, estimateAmrapRounds } from "@/lib/biomech";
import type {
  Exercise,
  ExerciseType,
  WorkoutFormat,
  WorkoutItem,
  WorkoutTemplate,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const FORMATS: WorkoutFormat[] = ["amrap", "emom", "tabata", "interval"];

const TYPE_OPTIONS: ExerciseType[] = [
  "pull",
  "push",
  "core",
  "legs",
  "static",
  "mobility",
];

// sessionStorage ключ для передачи конфигурации в /timer
const WORKOUT_CONFIG_KEY = "cp_workout_config";

// ====== Helpers ======

function exerciseName(ex: Exercise | undefined, locale: "ru" | "en"): string {
  if (!ex) return "?";
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

function muscleList(ex: Exercise, locale: "ru" | "en"): string[] {
  return locale === "ru" ? ex.targetMusclesRu : ex.targetMusclesEn;
}

const TYPE_STRIPE: Record<ExerciseType, string> = {
  pull: "bg-red-500",
  push: "bg-orange-500",
  core: "bg-amber-500",
  legs: "bg-emerald-500",
  static: "bg-purple-500",
  mobility: "bg-slate-500",
};

const TYPE_LABEL_KEY: Record<ExerciseType, DictKey> = {
  pull: "ex.type.pull",
  push: "ex.type.push",
  core: "ex.type.core",
  legs: "ex.type.legs",
  static: "ex.type.static",
  mobility: "ex.type.mobility",
};

const FORMAT_LABEL_KEY: Record<WorkoutFormat, DictKey> = {
  amrap: "format.amrap",
  emom: "format.emom",
  tabata: "format.tabata",
  interval: "format.interval",
};

const FORMAT_DESC_KEY: Record<WorkoutFormat, DictKey> = {
  amrap: "format.amrap.desc",
  emom: "format.emom.desc",
  tabata: "format.tabata.desc",
  interval: "format.interval.desc",
};

// ====== Builder state ======

interface BuilderState {
  format: WorkoutFormat;
  durationSec: number; // AMRAP
  rounds: number;      // EMOM, Intervals
  workSec: number;     // Intervals
  restSec: number;     // Intervals
  items: WorkoutItem[];
}

function defaultState(format: WorkoutFormat): BuilderState {
  return {
    format,
    durationSec: 20 * 60, // 20 минут
    rounds: format === "interval" ? 8 : 10,
    workSec: 30,
    restSec: 20,
    items: [],
  };
}

// ====== Sortable item ======

function SortableExerciseRow({
  item,
  exercise,
  locale,
  t,
  onChange,
  onRemove,
}: {
  item: WorkoutItem;
  exercise: Exercise | undefined;
  locale: "ru" | "en";
  t: (key: DictKey) => string;
  onChange: (next: WorkoutItem) => void;
  onRemove: () => void;
}) {
  const id = item.exerciseSlug;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const isStatic = exercise?.type === "static";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-stretch rounded-xl border bg-card overflow-hidden",
        isDragging && "opacity-70 ring-2 ring-primary z-10"
      )}
    >
      {/* Цветная полоса слева по типу упражнения */}
      <div
        className={cn(
          "w-1.5 shrink-0",
          exercise ? TYPE_STRIPE[exercise.type] : "bg-muted-foreground/30"
        )}
      />
      {/* Drag handle */}
      <button
        type="button"
        className="px-2 flex items-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none min-h-[44px]"
        aria-label="drag"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 flex items-center gap-3 py-2 pr-2 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {exerciseName(exercise, locale)}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {exercise
              ? `${t("subst.coef")} ${exercise.loadCoef} · ${t(
                  TYPE_LABEL_KEY[exercise.type]
                )}`
              : item.exerciseSlug}
          </div>
        </div>

        {/* Reps / duration input */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isStatic ? (
            <>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={item.durationSec || 0}
                onChange={(e) =>
                  onChange({
                    ...item,
                    durationSec: Math.max(0, parseInt(e.target.value || "0", 10)),
                    reps: 0,
                  })
                }
                className="h-9 w-16 text-center tabular-nums"
                aria-label={t("builder.exerciseDurationLabel")}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {t("builder.sec")}
              </span>
            </>
          ) : (
            <>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={item.reps || 0}
                onChange={(e) =>
                  onChange({
                    ...item,
                    reps: Math.max(0, parseInt(e.target.value || "0", 10)),
                    durationSec: 0,
                  })
                }
                className="h-9 w-16 text-center tabular-nums"
                aria-label={t("builder.exerciseRepsLabel")}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {t("builder.reps")}
              </span>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
          aria-label={t("builder.removeExercise")}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ====== Add-exercise sheet ======

function AddExerciseSheet({
  open,
  onOpenChange,
  onPick,
  existingSlugs,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (ex: Exercise) => void;
  existingSlugs: string[];
}) {
  const { t, locale } = useI18n();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<ExerciseType | "all">("all");

  // Загружаем все упражнения (один query)
  const exercisesQuery = useQuery({
    queryKey: ["exercises", { forBuilder: true }],
    queryFn: async () => {
      const res = await fetch("/api/exercises");
      if (!res.ok) throw new Error("fetch exercises failed");
      return (await res.json()) as Exercise[];
    },
    enabled: open,
  });

  const exercises = React.useMemo(() => {
    const arr = exercisesQuery.data ?? [];
    let filtered = arr;
    if (typeFilter !== "all") {
      filtered = filtered.filter((e) => e.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.nameRu.toLowerCase().includes(q) ||
          e.nameEn.toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => a.loadCoef - b.loadCoef);
  }, [exercisesQuery.data, search, typeFilter]);

  const handlePick = (ex: Exercise) => {
    onPick(ex);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>{t("builder.addExerciseTitle")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("builder.addExerciseTitle")}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-2 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              inputMode="search"
              placeholder={t("builder.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-9"
            />
          </div>

          {/* Type filter — Select */}
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as ExerciseType | "all")}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder={t("builder.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("builder.allTypes")}</SelectItem>
              {TYPE_OPTIONS.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {t(TYPE_LABEL_KEY[tp])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {exercisesQuery.isLoading && (
            <div className="space-y-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          )}
          {exercisesQuery.isError && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("common.error")}
            </div>
          )}
          {!exercisesQuery.isLoading && exercises.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("ex.empty")}
            </div>
          )}
          {exercises.map((ex) => {
            const already = existingSlugs.includes(ex.slug);
            return (
              <button
                key={ex.slug}
                type="button"
                onClick={() => handlePick(ex)}
                className="w-full text-left"
              >
                <Card className="p-3 flex items-center gap-3 hover:border-primary/50 transition-colors active:scale-[0.99]">
                  <div
                    className={cn(
                      "w-1.5 self-stretch rounded-full",
                      TYPE_STRIPE[ex.type]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {exerciseName(ex, locale)}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {muscleList(ex, locale).slice(0, 3).join(" · ")}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      K {ex.loadCoef}
                    </Badge>
                    {already && (
                      <span className="text-[10px] text-muted-foreground">
                        + ещё
                      </span>
                    )}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ====== Save template sheet ======

function SaveTemplateSheet({
  open,
  onOpenChange,
  defaultName,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultName: string;
  onSave: (name: string) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = React.useState(defaultName);

  React.useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>{t("builder.saveTemplate")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("builder.saveTemplate")}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-3">
          <Label htmlFor="tpl-name">{t("builder.templateName")}</Label>
          <Input
            id="tpl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("builder.templateName")}
            className="h-11"
          />
        </div>
        <SheetFooter className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="flex-1 h-11"
            disabled={!name.trim()}
            onClick={() => onSave(name.trim())}
          >
            {t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ====== Templates collapsible ======

function TemplatesList({
  templates,
  onLoad,
  onDelete,
}: {
  templates: WorkoutTemplate[];
  onLoad: (tpl: WorkoutTemplate) => void;
  onDelete: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="p-0 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 hover:bg-accent/40 transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{t("builder.templates")}</span>
              {templates.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {templates.length}
                </Badge>
              )}
            </div>
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {templates.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                {t("builder.noTemplates")}
              </p>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center gap-2 rounded-lg border bg-card p-3"
                >
                  <button
                    type="button"
                    onClick={() => onLoad(tpl)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="font-medium text-sm truncate">{tpl.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {t(FORMAT_LABEL_KEY[tpl.format])} · {tpl.items.length}{" "}
                      {t("builder.exercises").toLowerCase()}
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    aria-label={t("builder.delete")}
                    onClick={() => onDelete(tpl.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ====== Inner component (consumes useSearchParams) ======

function BuilderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ====== State ======
  const [state, setState] = React.useState<BuilderState>(() => {
    const fmtParam = searchParams.get("format") as WorkoutFormat | null;
    const fmt: WorkoutFormat =
      fmtParam && FORMATS.includes(fmtParam) ? fmtParam : "amrap";
    return defaultState(fmt);
  });

  const [addSheetOpen, setAddSheetOpen] = React.useState(false);
  const [saveSheetOpen, setSaveSheetOpen] = React.useState(false);

  // ====== Format change ======
  const setFormat = React.useCallback((fmt: WorkoutFormat) => {
    setState((s) => {
      // Сохраняем items, сбрасываем config под формат
      const next = defaultState(fmt);
      return { ...next, items: s.items };
    });
    // Обновляем URL
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("format", fmt);
    sp.delete("templateId");
    router.replace(`/builder?${sp.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // ====== Items mutations ======
  const addItem = (ex: Exercise) => {
    setState((s) => ({
      ...s,
      items: [
        ...s.items,
        ex.type === "static"
          ? { exerciseSlug: ex.slug, reps: 0, durationSec: 30 }
          : { exerciseSlug: ex.slug, reps: 10, durationSec: 0 },
      ],
    }));
  };

  const updateItem = (index: number, next: WorkoutItem) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it, i) => (i === index ? next : it)),
    }));
  };

  const removeItem = (index: number) => {
    setState((s) => ({
      ...s,
      items: s.items.filter((_, i) => i !== index),
    }));
  };

  // ====== DnD ======
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setState((s) => {
      const oldIndex = s.items.findIndex((i) => i.exerciseSlug === active.id);
      const newIndex = s.items.findIndex((i) => i.exerciseSlug === over.id);
      if (oldIndex < 0 || newIndex < 0) return s;
      return { ...s, items: arrayMove(s.items, oldIndex, newIndex) };
    });
  };

  // ====== Load exercises (for displaying names) ======
  const exercisesQuery = useQuery({
    queryKey: ["exercises", { forBuilderNames: true }],
    queryFn: async () => {
      const res = await fetch("/api/exercises");
      if (!res.ok) throw new Error("fetch exercises failed");
      return (await res.json()) as Exercise[];
    },
  });

  const exercises = exercisesQuery.data ?? [];

  // ====== Load template if ?templateId=xxx ======
  const templateIdParam = searchParams.get("templateId");
  const templatesQuery = useQuery({
    queryKey: ["workout-templates"],
    queryFn: async () => {
      const res = await fetch("/api/workouts/templates");
      if (!res.ok) throw new Error("fetch templates failed");
      return (await res.json()) as WorkoutTemplate[];
    },
  });

  // Если есть templateId в URL — подгружаем шаблон один раз
  const initialTemplateLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (!templateIdParam || initialTemplateLoadedRef.current) return;
    if (!templatesQuery.data) return;
    const tpl = templatesQuery.data.find((tt) => tt.id === templateIdParam);
    if (!tpl) return;
    initialTemplateLoadedRef.current = true;
    setState({
      format: tpl.format,
      durationSec: tpl.durationSec ?? 20 * 60,
      rounds: tpl.rounds ?? 10,
      workSec: tpl.workSec ?? 30,
      restSec: tpl.restSec ?? 20,
      items: tpl.items,
    });
  }, [templateIdParam, templatesQuery.data]);

  // ====== Save template mutation ======
  const saveTemplateMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/workouts/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          format: state.format,
          durationSec: state.format === "amrap" ? state.durationSec : null,
          rounds:
            state.format === "emom" || state.format === "interval"
              ? state.rounds
              : null,
          restSec: state.format === "interval" ? state.restSec : null,
          workSec:
            state.format === "interval" ? state.workSec : state.format === "tabata" ? 20 : null,
          items: state.items,
        }),
      });
      if (!res.ok) throw new Error("save template failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
      setSaveSheetOpen(false);
      toast({ title: t("builder.templateSavedToast") });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  // ====== Delete template mutation ======
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workouts/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete template failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
      toast({ title: t("builder.templateDeletedToast") });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  // ====== Start workout ======
  const startWorkout = () => {
    if (state.items.length === 0) {
      toast({ title: t("builder.cantStartEmpty"), variant: "destructive" });
      return;
    }
    const config = {
      format: state.format,
      durationSec: state.durationSec,
      rounds: state.rounds,
      workSec: state.workSec,
      restSec: state.restSec,
      items: state.items,
    };
    try {
      sessionStorage.setItem(WORKOUT_CONFIG_KEY, JSON.stringify(config));
    } catch {
      /* noop */
    }
    router.push("/timer");
  };

  // ====== Derived ======
  const totalStress = React.useMemo(
    () => calcTotalStress(state.items, exercises, 1),
    [state.items, exercises]
  );

  const amrapEstimated = React.useMemo(() => {
    if (state.format !== "amrap") return null;
    const slow = estimateAmrapRounds(state.items, exercises, state.durationSec, "slow");
    const fast = estimateAmrapRounds(state.items, exercises, state.durationSec, "fast");
    return { slow, fast };
  }, [state.format, state.items, exercises, state.durationSec]);

  const emomTotalSec = state.format === "emom" ? state.rounds * 60 : null;

  const templates = templatesQuery.data ?? [];

  // ====== Render ======
  return (
    <MobileShell hasBottomPadding={false}>
      <PageHeader title={t("builder.title")} />

      <div className="flex-1 px-4 py-4 space-y-4 pb-40">
        {/* Format segmented control */}
        <section>
          <Label className="text-xs uppercase text-muted-foreground mb-2">
            {t("builder.format")}
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {FORMATS.map((f) => {
              const active = state.format === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border py-2.5 min-h-[64px] transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent/40"
                  )}
                  aria-pressed={active}
                >
                  <FormatIcon format={f} className="h-4 w-4" />
                  <span className="text-[10px] font-medium leading-none">
                    {t(FORMAT_LABEL_KEY[f])}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t(FORMAT_DESC_KEY[state.format])}
          </p>
        </section>

        {/* Format-specific config */}
        <Card className="p-3 gap-3">
          {state.format === "amrap" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  {t("builder.duration")}
                </Label>
                <span className="text-sm font-semibold tabular-nums">
                  {Math.floor(state.durationSec / 60)}{" "}
                  {t("builder.duration.minutes")}
                </span>
              </div>
              <Slider
                min={5}
                max={60}
                step={1}
                value={[Math.floor(state.durationSec / 60)]}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, durationSec: v[0] * 60 }))
                }
                className="min-h-[44px]"
              />
            </div>
          )}

          {state.format === "emom" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Repeat className="h-3.5 w-3.5" />
                  {t("builder.rounds")}
                </Label>
                <span className="text-sm font-semibold tabular-nums">
                  {state.rounds}
                </span>
              </div>
              <Slider
                min={5}
                max={30}
                step={1}
                value={[state.rounds]}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, rounds: v[0] }))
                }
                className="min-h-[44px]"
              />
              <div className="text-[11px] text-muted-foreground pt-1">
                {t("builder.duration")}:{" "}
                <span className="font-medium tabular-nums">
                  {Math.floor((emomTotalSec ?? 0) / 60)}:
                  {((emomTotalSec ?? 0) % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          )}

          {state.format === "tabata" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Square className="h-3.5 w-3.5" />
                {t("builder.tabataPreset")}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat label={t("builder.rounds")} value="8" />
                <Stat
                  label={t("builder.work")}
                  value={`20 ${t("builder.sec")}`}
                />
                <Stat
                  label={t("builder.rest")}
                  value={`10 ${t("builder.sec")}`}
                />
              </div>
            </div>
          )}

          {state.format === "interval" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Repeat className="h-3.5 w-3.5" />
                    {t("builder.rounds")}
                  </Label>
                  <span className="text-sm font-semibold tabular-nums">
                    {state.rounds}
                  </span>
                </div>
                <Slider
                  min={4}
                  max={20}
                  step={1}
                  value={[state.rounds]}
                  onValueChange={(v) =>
                    setState((s) => ({ ...s, rounds: v[0] }))
                  }
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Activity className="h-3.5 w-3.5" />
                    {t("builder.work")}
                  </Label>
                  <span className="text-sm font-semibold tabular-nums">
                    {state.workSec} {t("builder.sec")}
                  </span>
                </div>
                <Slider
                  min={10}
                  max={60}
                  step={5}
                  value={[state.workSec]}
                  onValueChange={(v) =>
                    setState((s) => ({ ...s, workSec: v[0] }))
                  }
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <HeartPulse className="h-3.5 w-3.5" />
                    {t("builder.rest")}
                  </Label>
                  <span className="text-sm font-semibold tabular-nums">
                    {state.restSec} {t("builder.sec")}
                  </span>
                </div>
                <Slider
                  min={10}
                  max={60}
                  step={5}
                  value={[state.restSec]}
                  onValueChange={(v) =>
                    setState((s) => ({ ...s, restSec: v[0] }))
                  }
                  className="min-h-[44px]"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Exercises list */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase text-muted-foreground">
              {t("builder.exercises")} ({state.items.length})
            </Label>
          </div>

          {state.items.length === 0 ? (
            <Card className="p-3 text-center border-dashed">
              <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("builder.empty")}</p>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={state.items.map((i) => i.exerciseSlug)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {state.items.map((item, idx) => {
                    const ex = exercises.find((e) => e.slug === item.exerciseSlug);
                    return (
                      <SortableExerciseRow
                        key={`${item.exerciseSlug}-${idx}`}
                        item={item}
                        exercise={ex}
                        locale={locale}
                        t={t}
                        onChange={(next) => updateItem(idx, next)}
                        onRemove={() => removeItem(idx)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-dashed"
            onClick={() => setAddSheetOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("builder.addExercise")}
          </Button>
        </section>

        {/* Calculations card */}
        {state.items.length > 0 && (
          <Card className="p-3 border-primary/40 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {t("builder.totalLoad")}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-primary">
                {totalStress}
              </span>
              <span className="text-xs text-muted-foreground">
                / {t("timer.round").toLowerCase()}
              </span>
            </div>
            {amrapEstimated && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="text-xs text-muted-foreground mb-1">
                  {t("builder.estimatedRounds")}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums">
                    {amrapEstimated.slow}–{amrapEstimated.fast}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("timer.round").toLowerCase()}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Saved templates */}
        <TemplatesList
          templates={templates}
          onLoad={(tpl) => {
            setState({
              format: tpl.format,
              durationSec: tpl.durationSec ?? 20 * 60,
              rounds: tpl.rounds ?? 10,
              workSec: tpl.workSec ?? 30,
              restSec: tpl.restSec ?? 20,
              items: tpl.items,
            });
            const sp = new URLSearchParams();
            sp.set("format", tpl.format);
            sp.set("templateId", tpl.id);
            router.replace(`/builder?${sp.toString()}`, { scroll: false });
            toast({ title: `${t("builder.use")}: ${tpl.name}` });
          }}
          onDelete={(id) => deleteTemplateMutation.mutate(id)}
        />
      </div>

      {/* Sticky bottom buttons */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
        <div className="flex gap-2 bg-background/95 backdrop-blur rounded-xl border border-border p-2 shadow-lg safe-bottom">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => setSaveSheetOpen(true)}
            disabled={state.items.length === 0}
          >
            <Save className="h-4 w-4 mr-1" />
            {t("builder.saveTemplate")}
          </Button>
          <Button
            className="flex-1 h-12"
            onClick={startWorkout}
            disabled={state.items.length === 0}
          >
            <Play className="h-4 w-4 mr-1" />
            {t("builder.start")}
          </Button>
        </div>
      </div>

      {/* Sheets */}
      <AddExerciseSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onPick={addItem}
        existingSlugs={state.items.map((i) => i.exerciseSlug)}
      />
      <SaveTemplateSheet
        open={saveSheetOpen}
        onOpenChange={setSaveSheetOpen}
        defaultName={`${t(FORMAT_LABEL_KEY[state.format])} ${new Date().toLocaleDateString(
          locale === "ru" ? "ru-RU" : "en-US"
        )}`}
        onSave={(name) => saveTemplateMutation.mutate(name)}
      />
    </MobileShell>
  );
}

// ====== Small components ======

function FormatIcon({
  format,
  className,
}: {
  format: WorkoutFormat;
  className?: string;
}) {
  switch (format) {
    case "amrap":
      return <InfinityIcon className={className} />;
    case "emom":
      return <Clock className={className} />;
    case "tabata":
      return <Square className={className} />;
    case "interval":
      return <Repeat className={className} />;
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2 text-center">
      <div className="text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase mt-0.5">
        {label}
      </div>
    </div>
  );
}

// ====== Default export with Suspense wrapper for useSearchParams ======

export default function BuilderPage() {
  return (
    <React.Suspense
      fallback={
        <MobileShell>
          <PageHeader title="" />
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </MobileShell>
      }
    >
      <BuilderPageInner />
    </React.Suspense>
  );
}
