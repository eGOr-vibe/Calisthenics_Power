"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Utensils,
  AlertCircle,
  User,
  Info,
  ChevronRight,
  Pill,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AthleteProfile } from "@/lib/types";
import {
  calcTDEE,
  calcMacros,
  distributeMacros,
  calcAgeFromBirthDate,
  NUTRITION_GOALS,
  ACTIVITY_LEVELS,
  type ActivityLevel,
  type NutritionGoal,
} from "@/lib/nutrition";
import { cn } from "@/lib/utils";

// ====== Constants ======

const ACTIVITY_IDS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "veryActive",
];

const GOAL_IDS: NutritionGoal[] = [
  "bulk",
  "cut",
  "recomp",
  "endurance",
  "maintain",
];

// Accent colors per macro (графитовый фон + цветные акценты)
const MACRO_META = {
  protein: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-500",
    icon: <Beef className="h-5 w-5" />,
  },
  fat: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-500",
    icon: <Droplet className="h-5 w-5" />,
  },
  carbs: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    icon: <Wheat className="h-5 w-5" />,
  },
} as const;

// ====== Main page ======

export default function NutritionPage() {
  const { t, locale } = useI18n();
  const [activity, setActivity] = React.useState<ActivityLevel>("moderate");
  const [goal, setGoal] = React.useState<NutritionGoal>("maintain");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("profile fetch failed");
      return (await res.json()) as AthleteProfile;
    },
  });

  const profile = profileQuery.data ?? null;

  // Validate that profile has all required fields for TDEE calc.
  const age = profile?.birthDate
    ? calcAgeFromBirthDate(profile.birthDate)
    : null;
  const hasRequiredProfile =
    !!profile &&
    typeof profile.heightCm === "number" &&
    profile.heightCm > 0 &&
    typeof profile.weightKg === "number" &&
    profile.weightKg > 0 &&
    age !== null &&
    age > 0;

  return (
    <MobileShell>
      <PageHeader
        title={t("nutrition.title")}
        subtitle={t("nutrition.subtitle")}
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
          {t("nutrition.intro")}
        </p>

        {profileQuery.isLoading ? (
          <SkeletonBlock />
        ) : profileQuery.isError ? (
          <ErrorState onRetry={() => profileQuery.refetch()} />
        ) : !hasRequiredProfile ? (
          <NeedProfileCard />
        ) : (
          <Calculator
            profile={profile}
            age={age as number}
            activity={activity}
            goal={goal}
            onActivityChange={setActivity}
            onGoalChange={setGoal}
            locale={locale}
            t={t}
          />
        )}

        {/* Disclaimer (always visible) */}
        <Card className="p-3 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-foreground/90">
              {t("nutrition.disclaimer")}
            </p>
          </div>
        </Card>

        {/* Link to theory */}
        <Link
          href="/knowledge/theory/nutrition"
          className="block touch-manipulation"
        >
          <Card className="p-3 flex items-center justify-between hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-sky-500/15">
                <Info className="h-5 w-5 text-sky-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">
                  {t("nutrition.readTheory")}
                </h3>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Card>
        </Link>

        {/* Link to supplements */}
        <Link
          href="/supplements"
          className="block touch-manipulation"
        >
          <Card className="p-3 flex items-center justify-between hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/15">
                <Pill className="h-5 w-5 text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">
                  {t("supplements.title")}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {t("supplements.subtitle")}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Card>
        </Link>
      </div>
    </MobileShell>
  );
}

// ====== Calculator (core block) ======

function Calculator({
  profile,
  age,
  activity,
  goal,
  onActivityChange,
  onGoalChange,
  locale,
  t,
}: {
  profile: AthleteProfile;
  age: number;
  activity: ActivityLevel;
  goal: NutritionGoal;
  onActivityChange: (a: ActivityLevel) => void;
  onGoalChange: (g: NutritionGoal) => void;
  locale: "ru" | "en";
  t: (k: DictKey) => string;
}) {
  const gender = profile.gender ?? "other";
  const weightKg = profile.weightKg as number;
  const heightCm = profile.heightCm as number;

  const tdee = React.useMemo(
    () => calcTDEE(weightKg, heightCm, age, gender, activity),
    [weightKg, heightCm, age, gender, activity],
  );

  const macros = React.useMemo(
    () => calcMacros(tdee.tdee, weightKg, goal),
    [tdee.tdee, weightKg, goal],
  );

  const mealPlan = React.useMemo(
    () => distributeMacros(macros),
    [macros],
  );

  const goalMeta = NUTRITION_GOALS.find((g) => g.id === goal);
  const goalDesc = goalMeta
    ? locale === "ru"
      ? goalMeta.descRu
      : goalMeta.descEn
    : "";

  return (
    <div className="space-y-4">
      {/* ====== TDEE card ====== */}
      <Card className="p-3 border-red-500/30 bg-gradient-to-b from-red-500/10 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-red-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("nutrition.tdeeFull")}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-red-500 leading-none">
            {tdee.tdee}
          </span>
          <span className="text-sm text-muted-foreground">
            {t("nutrition.caloriesPerDay")}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <TdeeStat
            label={t("nutrition.bmr")}
            value={tdee.bmr}
            unit={t("nutrition.caloriesPerDay")}
          />
          <TdeeStat
            label={t("nutrition.activityFactor")}
            value={tdee.activityFactor}
            unit="×"
            precision={2}
          />
          <TdeeStat
            label={t("nutrition.ageYears")}
            value={age}
            unit={t("nutrition.years")}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
          {t("nutrition.bmrDesc")}
        </p>
      </Card>

      {/* ====== Activity selector ====== */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          {t("nutrition.activity")}
        </h2>
        <div className="space-y-1.5">
          {ACTIVITY_IDS.map((id) => {
            const meta = ACTIVITY_LEVELS.find((a) => a.id === id);
            const isActive = activity === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onActivityChange(id)}
                aria-pressed={isActive}
                className={cn(
                  "w-full min-h-[44px] flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all touch-manipulation text-left",
                  isActive
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-border bg-card hover:bg-accent/40",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {t(`nutrition.activity.${id}` as DictKey)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {meta ? (locale === "ru" ? meta.descRu : meta.descEn) : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] tabular-nums",
                      isActive && "bg-red-500/15 text-red-500",
                    )}
                  >
                    ×{meta?.factor.toFixed(3)}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ====== Goal selector ====== */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          {t("nutrition.goal")}
        </h2>
        <div className="space-y-1.5">
          {GOAL_IDS.map((id) => {
            const meta = NUTRITION_GOALS.find((g) => g.id === id);
            const isActive = goal === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onGoalChange(id)}
                aria-pressed={isActive}
                className={cn(
                  "w-full min-h-[44px] flex items-start justify-between gap-3 px-3 py-2 rounded-lg border transition-all touch-manipulation text-left",
                  isActive
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-border bg-card hover:bg-accent/40",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {t(`nutrition.goal.${id}` as DictKey)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {meta ? (locale === "ru" ? meta.descRu : meta.descEn) : ""}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border tabular-nums"
                    >
                      {meta?.calorieAdjustment}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border tabular-nums"
                    >
                      {t("nutrition.protein")}: {meta?.proteinRange}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {goalDesc && (
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {goalDesc}
          </p>
        )}
      </section>

      {/* ====== Macros (3 big numbers) ====== */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("nutrition.targetCalories")}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {macros.calories}
          </span>
          <span className="text-sm text-muted-foreground">
            {t("nutrition.caloriesPerDay")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MacroCard
            meta={MACRO_META.protein}
            label={t("nutrition.protein")}
            value={macros.protein}
            unit={t("nutrition.grams")}
            perKg={macros.proteinPerKg}
          />
          <MacroCard
            meta={MACRO_META.fat}
            label={t("nutrition.fat")}
            value={macros.fat}
            unit={t("nutrition.grams")}
            perKg={macros.fatPerKg}
          />
          <MacroCard
            meta={MACRO_META.carbs}
            label={t("nutrition.carbs")}
            value={macros.carbs}
            unit={t("nutrition.grams")}
            perKg={macros.carbsPerKg}
          />
        </div>
      </Card>

      {/* ====== Per kg summary ====== */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("nutrition.perKg")}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PerKgStat
            label={t("nutrition.protein")}
            value={macros.proteinPerKg}
            color="text-red-500"
          />
          <PerKgStat
            label={t("nutrition.fat")}
            value={macros.fatPerKg}
            color="text-amber-500"
          />
          <PerKgStat
            label={t("nutrition.carbs")}
            value={macros.carbsPerKg}
            color="text-emerald-500"
          />
        </div>
      </Card>

      {/* ====== Meal distribution ====== */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {t("nutrition.mealPlan")}
          </span>
        </div>
        <div className="space-y-1.5">
          {mealPlan.meals.map((meal, i) => {
            const mealLabel =
              meal.nameEn === "Breakfast"
                ? t("nutrition.breakfast")
                : meal.nameEn === "Lunch"
                  ? t("nutrition.lunch")
                  : meal.nameEn === "Snack"
                    ? t("nutrition.snack")
                    : t("nutrition.dinner");
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-3 py-2 border-b border-border/60 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {mealLabel}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    <span className="text-red-500">
                      {meal.protein}
                      {t("nutrition.grams")}
                    </span>
                    <span className="text-amber-500">
                      {meal.fat}
                      {t("nutrition.grams")}
                    </span>
                    <span className="text-emerald-500">
                      {meal.carbs}
                      {t("nutrition.grams")}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold tabular-nums">
                    {meal.calories}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t("nutrition.caloriesPerDay")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ====== Sub-components ======

function TdeeStat({
  label,
  value,
  unit,
  precision = 0,
}: {
  label: string;
  value: number;
  unit: string;
  precision?: number;
}) {
  const display =
    precision > 0 ? value.toFixed(precision) : String(Math.round(value));
  return (
    <div className="rounded-md bg-background/60 p-2 border border-border/60">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums leading-tight mt-0.5">
        {display}
        <span className="text-[10px] text-muted-foreground ml-1 font-normal">
          {unit}
        </span>
      </div>
    </div>
  );
}

function MacroCard({
  meta,
  label,
  value,
  unit,
  perKg,
}: {
  meta: (typeof MACRO_META)[keyof typeof MACRO_META];
  label: string;
  value: number;
  unit: string;
  perKg: number;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-2.5 border flex flex-col items-center text-center",
        meta.bg,
        meta.border,
      )}
    >
      <div className={cn("mb-1", meta.text)}>{meta.icon}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide truncate w-full">
        {label}
      </div>
      <div
        className={cn(
          "text-2xl font-bold tabular-nums leading-none mt-1",
          meta.text,
        )}
      >
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{unit}</div>
      <div className="text-[10px] text-muted-foreground/80 mt-1 tabular-nums">
        {perKg} {unit}/kg
      </div>
    </div>
  );
}

function PerKgStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-md bg-background/60 p-2 border border-border/60 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
        {label}
      </div>
      <div
        className={cn(
          "text-lg font-bold tabular-nums leading-tight mt-0.5",
          color,
        )}
      >
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">г/кг</div>
    </div>
  );
}

function NeedProfileCard() {
  const { t } = useI18n();
  return (
    <Card className="p-3 border-amber-500/30 bg-amber-500/5">
      <div className="flex flex-col items-center text-center py-2">
        <div className="h-12 w-12 rounded-full bg-amber-500/15 flex items-center justify-center mb-3">
          <User className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          {t("nutrition.needProfile")}
        </p>
        <Link href="/profile">
          <Button className="min-h-[44px] w-full sm:w-auto">
            {t("nutrition.openProfile")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-4">
      <Card className="p-3">
        <Skeleton className="h-4 w-1/3 mb-3" />
        <Skeleton className="h-12 w-2/5 mb-3" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </Card>
      <Card className="p-3">
        <Skeleton className="h-4 w-1/4 mb-3" />
        <Skeleton className="h-12 w-1/2 mb-3" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </Card>
      <Card className="p-3">
        <Skeleton className="h-4 w-1/3 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
      <Button variant="outline" onClick={onRetry} className="min-h-[44px]">
        {t("common.retry")}
      </Button>
    </div>
  );
}
