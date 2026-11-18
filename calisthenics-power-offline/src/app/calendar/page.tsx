"use client";

import * as React from "react";
import {
  getPlannedWorkouts,
  addPlannedWorkout,
  updatePlannedWorkout,
  deletePlannedWorkout,
  getSessions,
} from "@/lib/local-storage";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PlannedWorkout {
  id: string;
  date: string;
  title: string;
  format: string;
  durationMin: number;
  notes: string | null;
  completed: boolean;
}

const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FORMATS = ["AMRAP", "EMOM", "TABATA", "INTERVAL", "CUSTOM"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Понедельник = 0
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export default function CalendarPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    format: "AMRAP",
    durationMin: 30,
    notes: "",
  });

  // --- Data: planned workouts + sessions (localStorage) ---
  const [workouts, setWorkouts] = React.useState<PlannedWorkout[]>(() => getPlannedWorkouts());
  const sessions = React.useMemo(() => getSessions().slice(0, 100), []);

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const weekdays = locale === "ru" ? WEEKDAYS_RU : WEEKDAYS_EN;
  const months = locale === "ru" ? MONTHS_RU : MONTHS_EN;

  // Map workouts by day
  const workoutsByDay = React.useMemo(() => {
    const map = new Map<number, PlannedWorkout[]>();
    for (const w of workouts) {
      const day = new Date(w.date).getDate();
      const arr = map.get(day) ?? [];
      arr.push(w);
      map.set(day, arr);
    }
    return map;
  }, [workouts]);

  // Map sessions by day (completed workouts)
  const sessionsByDay = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const s of sessions) {
      const day = new Date(s.startedAt).getDate();
      const month = new Date(s.startedAt).getMonth();
      const year = new Date(s.startedAt).getFullYear();
      if (month === currentMonth && year === currentYear) {
        map.set(day, (map.get(day) ?? 0) + 1);
      }
    }
    return map;
  }, [sessions, currentMonth, currentYear]);

  // Stats
  const plannedCount = workouts.length;
  const completedCount = workouts.filter((w) => w.completed).length;
  const sessionsCount = Array.from(sessionsByDay.values()).reduce((a, b) => a + b, 0);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day: number | null) => {
    if (day === null) return;
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date.toISOString());
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedDate) return;
    try {
      addPlannedWorkout({
        date: selectedDate,
        title: form.title.trim() || `${form.format} ${form.durationMin}min`,
        format: form.format,
        durationMin: form.durationMin,
        notes: form.notes.trim() || "",
      });
      setWorkouts(getPlannedWorkouts());
      toast({ description: t("calendar.saved") });
      setSheetOpen(false);
      setForm({ title: "", format: "AMRAP", durationMin: 30, notes: "" });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  // Selected day workouts
  const selectedDay = selectedDate ? new Date(selectedDate).getDate() : null;
  const selectedDayWorkouts = selectedDay !== null
    ? workoutsByDay.get(selectedDay) ?? []
    : [];

  return (
    <MobileShell>
      {/* Compact header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button
            onClick={handlePrevMonth}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-sm">{months[currentMonth]}</div>
            <div className="text-[10px] text-muted-foreground">{currentYear}</div>
          </div>
          <button
            onClick={handleNextMonth}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent touch-manipulation"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-3 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-2 text-center">
            <div className="text-lg font-bold tabular-nums text-amber-500">{plannedCount}</div>
            <div className="text-[9px] text-muted-foreground">{t("calendar.planned")}</div>
          </Card>
          <Card className="p-2 text-center">
            <div className="text-lg font-bold tabular-nums text-emerald-500">{sessionsCount}</div>
            <div className="text-[9px] text-muted-foreground">{t("calendar.done")}</div>
          </Card>
          <Card className="p-2 text-center">
            <div className="text-lg font-bold tabular-nums text-primary">{completedCount}</div>
            <div className="text-[9px] text-muted-foreground">{t("calendar.checked")}</div>
          </Card>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((wd) => (
            <div
              key={wd}
              className="text-center text-[9px] font-semibold uppercase text-muted-foreground py-1"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first week */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            const today = isToday(date);
            const dayWorkouts = workoutsByDay.get(day) ?? [];
            const sessionCount = sessionsByDay.get(day) ?? 0;
            const hasPlanned = dayWorkouts.length > 0;
            const hasCompleted = sessionCount > 0;
            const allCompleted = hasPlanned && dayWorkouts.every((w) => w.completed);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-colors touch-manipulation min-h-[36px]",
                  today
                    ? "border-primary bg-primary/10"
                    : hasCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : hasPlanned
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-card hover:bg-accent/40",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    today ? "text-primary font-bold" : "text-foreground",
                  )}
                >
                  {day}
                </span>
                {/* Indicators */}
                <div className="flex gap-0.5 absolute bottom-1">
                  {hasPlanned && (
                    <div
                      className={cn(
                        "h-1 w-1 rounded-full",
                        allCompleted ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    />
                  )}
                  {hasCompleted && (
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t("calendar.planned")}
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t("calendar.done")}
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t("calendar.today")}
          </div>
        </div>
      </div>

      {/* Add/View Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="p-0 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-base">
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString(
                  locale === "ru" ? "ru-RU" : "en-US",
                  { weekday: "long", day: "numeric", month: "long" },
                )}
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 py-3 space-y-3">
            {/* Existing workouts for this day */}
            {selectedDayWorkouts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("calendar.scheduled")}
                </Label>
                {selectedDayWorkouts.map((w) => (
                  <Card
                    key={w.id}
                    className={cn(
                      "p-2.5 flex items-center gap-2 border",
                      w.completed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30",
                    )}
                  >
                    <button
                      onClick={() => {
                        updatePlannedWorkout(w.id, { completed: !w.completed });
                        setWorkouts(getPlannedWorkouts());
                      }}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 touch-manipulation",
                        w.completed
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-muted-foreground",
                      )}
                    >
                      {w.completed && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{w.title}</div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] h-4 px-1">
                          {w.format}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {w.durationMin}min
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => {
                        deletePlannedWorkout(w.id);
                        setWorkouts(getPlannedWorkouts());
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            {/* Add new */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("calendar.addNew")}
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("calendar.titlePlaceholder")}
                className="h-9"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[9px] text-muted-foreground">{t("calendar.format")}</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {FORMATS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setForm({ ...form, format: f })}
                        className={cn(
                          "px-2 h-7 rounded text-[10px] font-medium border transition-colors touch-manipulation",
                          form.format === f
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-[9px] text-muted-foreground">{t("calendar.duration")}</Label>
                  <Input
                    type="number"
                    value={form.durationMin}
                    onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) || 30 })}
                    className="h-7 mt-1"
                  />
                </div>
              </div>
              <Button
                className="w-full h-9"
                onClick={handleSubmit}
                disabled={false}
              >
                <Plus className="h-4 w-4" />
                {t("calendar.add")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
}
