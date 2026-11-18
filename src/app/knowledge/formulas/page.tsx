"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Sigma,
  FunctionSquare,
  User,
  Ruler,
  Weight,
  Calendar,
  TrendingUp,
  Zap,
  Gauge,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  calcAgeCoefficient,
  calcCNSPulse,
  calcLeverCoefficient,
  calcRelativeStrength,
  calcStressIndex,
  calcWeightLossImpact,
  estimateAmrapRounds,
  stressIndexLabel,
  type CNSPulseResult,
} from "@/lib/biomech";
import type {
  AthleteProfile,
  Exercise,
  WorkoutItem,
  WorkoutSession,
  WorkoutSessionItem,
} from "@/lib/types";
import type { ProfileSummaryResponse } from "@/app/api/calc/profile-summary/route";

// ====== Types ======

type FormulaType = "validated" | "empirical" | "mixed";

type FormulaId =
  | "totalStress"
  | "substitution"
  | "lever"
  | "gravity"
  | "age"
  | "stress"
  | "ti"
  | "relativeStrength"
  | "weightLoss"
  | "amrap";

interface FormulaDef {
  id: FormulaId;
  type: FormulaType;
  /** Optional secondary line under the main formula (e.g. volume definition). */
  formulaNoteKey?: DictKey;
  /** Optional "Alternative" callout (e.g. HRV + Hooper Index). */
  alternativeKey?: DictKey;
  /** Optional thresholds line (e.g. TI safe/warning/critical). */
  thresholdKey?: DictKey;
}

// ====== Formula catalog (order = display order on the page) ======

const FORMULAS: FormulaDef[] = [
  {
    id: "totalStress",
    type: "empirical",
    formulaNoteKey: "formulas.formula.totalStressNote",
  },
  { id: "substitution", type: "empirical" },
  { id: "lever", type: "validated" },
  { id: "gravity", type: "validated" },
  { id: "age", type: "empirical" },
  {
    id: "stress",
    type: "empirical",
    alternativeKey: "formulas.alternative.stress",
  },
  {
    id: "ti",
    type: "empirical",
    alternativeKey: "formulas.alternative.ti",
    thresholdKey: "formulas.threshold.ti",
  },
  { id: "relativeStrength", type: "empirical" },
  { id: "weightLoss", type: "mixed" },
  { id: "amrap", type: "empirical" },
];

// ====== Authoritative external sources (disclaimer footer) ======

const SOURCES: Array<{ label: string; href: string }> = [
  { label: "NSCA", href: "https://www.nsca.com/" },
  { label: "ACSM", href: "https://www.acsm.org/" },
  { label: "Overcoming Gravity (Steven Low)", href: "https://shop.eatmoveimprove.com/products/overcoming-gravity" },
  { label: "ExRx.net", href: "https://exrx.net/" },
];

// ====== Types for fetched data ======

interface SessionLike {
  id: string;
  startedAt: string;
  format: string;
  durationSec: number;
  totalRounds: number;
  totalReps: number;
  totalVolume: number;
  items: WorkoutSessionItem[];
}

// ====== Main page ======

export default function FormulasPage() {
  const { t, locale } = useI18n();

  // Profile (for the passport card)
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      return (await res.json()) as AthleteProfile | null;
    },
  });

  // Profile summary (kAge, age, relStrength, stressIndex, weightLossImpact, tdee, bmi)
  const summaryQuery = useQuery<ProfileSummaryResponse>({
    queryKey: ["profile-summary"],
    queryFn: async () => {
      const res = await fetch("/api/calc/profile-summary");
      if (!res.ok) throw new Error("profile-summary fetch failed");
      return (await res.json()) as ProfileSummaryResponse;
    },
    staleTime: 60_000,
  });

  // Recent sessions (for Total Stress + AMRAP rounds + TI)
  const sessionsQuery = useQuery<SessionLike[]>({
    queryKey: ["sessions", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/workouts/sessions?limit=5");
      if (!res.ok) return [];
      return (await res.json()) as SessionLike[];
    },
  });

  // Exercises (lazy — only enabled if we have at least one session for TI/AMRAP)
  const hasSessions = (sessionsQuery.data?.length ?? 0) > 0;
  const exercisesQuery = useQuery<Exercise[]>({
    queryKey: ["exercises", "all"],
    queryFn: async () => {
      const res = await fetch("/api/exercises");
      if (!res.ok) throw new Error("exercises fetch failed");
      return (await res.json()) as Exercise[];
    },
    enabled: hasSessions,
    staleTime: 5 * 60_000,
  });

  const profile = profileQuery.data ?? null;
  const summary = summaryQuery.data ?? null;
  const sessions = sessionsQuery.data ?? [];
  const exercises = exercisesQuery.data ?? [];
  const lastSession = sessions.length > 0 ? sessions[0] : null;
  const lastAmrapSession =
    sessions.find((s) => s.format.toLowerCase() === "amrap" && s.durationSec > 0) ?? null;

  // Pre-computed live calc values
  const liveCalcs = React.useMemo(() => {
    const kAge = summary?.kAge ?? calcAgeCoefficient(profile?.birthDate ?? null);
    const weightKg = profile?.weightKg ?? null;
    const heightCm = profile?.heightCm ?? null;
    const birthDate = profile?.birthDate ?? null;
    const maxPullups = profile?.maxPullups ?? null;

    // 1. Total Stress from last session (totalVolume already = Σ loadCoef × reps × rounds)
    const totalStressValue = lastSession?.totalVolume ?? null;

    // 2. Lever coefficient for pushup-classic using user's weight
    const leverResult =
      weightKg != null && weightKg > 0
        ? calcLeverCoefficient("pushup-classic", weightKg)
        : null;

    // 3. Gravity force on body weight: F = m × g
    const gravityForceN =
      weightKg != null && weightKg > 0
        ? Number((weightKg * 9.81).toFixed(1))
        : null;

    // 4. Age coefficient (kAge, also via summary)
    const ageYears = summary?.age ?? null;

    // 5. Stress index from profile sleep/mood/soreness
    const stressIdx =
      profile?.lastSleepHours != null &&
      profile?.lastMood != null &&
      profile?.lastSoreness != null
        ? calcStressIndex(
            profile.lastSleepHours,
            profile.lastMood,
            profile.lastSoreness,
          )
        : null;
    const stressLabel = stressIdx != null ? stressIndexLabel(stressIdx, locale) : null;

    // 6. TI / CNS Pulse from last session + profile + exercises
    let tiResult: CNSPulseResult | null = null;
    if (lastSession && profile && exercises.length > 0) {
      const latest = lastSession;
      if (latest.totalRounds > 0 && latest.durationSec > 0) {
        const restSec = Math.max(5, Math.round((latest.durationSec / latest.totalRounds) * 0.4));
        let kDiff = 1.0;
        if (latest.items.length > 0) {
          let sumLoad = 0;
          let count = 0;
          for (const item of latest.items) {
            const ex = exercises.find((e) => e.slug === item.exerciseSlug);
            if (ex) {
              sumLoad += ex.loadCoef;
              count++;
            }
          }
          if (count > 0) kDiff = Number((sumLoad / count).toFixed(2));
        }
        const phase =
          profile.primaryVector === "cut"
            ? "cut"
            : profile.primaryVector === "static"
              ? "static"
              : "reps";
        const reps = latest.totalReps > 0 ? latest.totalReps : 1;
        tiResult = calcCNSPulse(reps, kDiff, restSec, kAge, phase);
      }
    }

    // 7. Relative strength (from summary, but also recompute as fallback)
    const relStrength =
      summary?.relativeStrength ??
      (maxPullups != null && weightKg != null && heightCm != null && maxPullups > 0 && weightKg > 0 && heightCm > 100
        ? calcRelativeStrength(maxPullups, weightKg, heightCm)
        : null);

    // 8. Weight loss impact (2 kg hypothetical)
    const weightLoss =
      summary?.weightLossImpact ??
      (weightKg != null && weightKg > 0
        ? (() => {
            const w = calcWeightLossImpact(2, weightKg);
            return {
              weightLostKg: w.weightLostKg,
              forceReductionN: w.forceReductionN,
              improvementPct: w.plancheImprovementPct,
            };
          })()
        : null);

    // 9. AMRAP rounds prediction for the last AMRAP session
    let amrapRounds: number | null = null;
    if (lastAmrapSession && exercises.length > 0) {
      const itemsPerRound: WorkoutItem[] = [];
      for (const item of lastAmrapSession.items) {
        const ex = exercises.find((e) => e.slug === item.exerciseSlug);
        if (!ex) continue;
        const perRoundRounds = Math.max(1, item.rounds || lastAmrapSession.totalRounds || 1);
        if (ex.type === "static") {
          // For statics, session.reps stored durationSec per round (total / rounds)
          itemsPerRound.push({
            exerciseSlug: item.exerciseSlug,
            reps: 0,
            durationSec: Math.max(1, Math.round(item.reps / perRoundRounds)),
          });
        } else {
          itemsPerRound.push({
            exerciseSlug: item.exerciseSlug,
            reps: Math.max(1, Math.round(item.reps / perRoundRounds)),
            durationSec: 0,
          });
        }
      }
      if (itemsPerRound.length > 0) {
        amrapRounds = estimateAmrapRounds(
          itemsPerRound,
          exercises,
          lastAmrapSession.durationSec,
          "medium",
        );
      }
    }

    // 10. BMI and TDEE from summary
    const bmi = summary?.bmi ?? null;
    const tdee = summary?.tdee ?? null;

    return {
      kAge,
      ageYears,
      weightKg,
      heightCm,
      birthDate,
      totalStressValue,
      leverResult,
      gravityForceN,
      stressIdx,
      stressLabel,
      tiResult,
      relStrength,
      weightLoss,
      amrapRounds,
      amrapActualRounds: lastAmrapSession?.totalRounds ?? null,
      amrapDurationSec: lastAmrapSession?.durationSec ?? null,
      bmi,
      tdee,
      lastSessionStartedAt: lastSession?.startedAt ?? null,
    };
  }, [profile, summary, lastSession, lastAmrapSession, exercises, locale]);

  const hasProfile =
    profile != null &&
    (profile.heightCm != null ||
      profile.weightKg != null ||
      profile.birthDate != null ||
      profile.gender != null);

  return (
    <MobileShell>
      <PageHeader
        title={t("formulas.title")}
        subtitle={t("formulas.subtitle")}
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

      <div className="flex-1 px-4 py-4 space-y-3">
        {/* Intro */}
        <Card className="p-3 gap-2 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <FunctionSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("formulas.subtitle")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("formulas.disclaimer")}
          </p>
        </Card>

        {/* Athlete passport */}
        <AthletePassportCard
          profile={profile}
          summary={summary}
          liveCalcs={liveCalcs}
          loading={profileQuery.isLoading || summaryQuery.isLoading}
          hasProfile={hasProfile}
        />

        {/* Formula cards */}
        {FORMULAS.map((def) => (
          <FormulaCard
            key={def.id}
            def={def}
            liveCalcs={liveCalcs}
            lastSession={lastSession}
            loadingSessions={sessionsQuery.isLoading}
          />
        ))}

        {/* Disclaimer + sources */}
        <DisclaimerCard />
      </div>
    </MobileShell>
  );
}

// ====== Athlete passport card ======

interface AthletePassportCardProps {
  profile: AthleteProfile | null;
  summary: ProfileSummaryResponse | null;
  liveCalcs: LiveCalcs;
  loading: boolean;
  hasProfile: boolean;
}

function AthletePassportCard({
  profile,
  summary,
  liveCalcs,
  loading,
  hasProfile,
}: AthletePassportCardProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <Card className="p-3 gap-3 border-primary/30">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("formulas.yourProfile")}
          </span>
        </div>
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card className="p-3 gap-3 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("formulas.yourProfile")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("formulas.passport.empty")}
        </p>
        <Link href="/profile">
          <Button className="w-full h-11" variant="default">
            <User className="h-4 w-4 mr-1.5" />
            {t("formulas.openProfile")}
          </Button>
        </Link>
      </Card>
    );
  }

  // Show key passport fields
  const items: Array<{
    icon: React.ElementType;
    label: string;
    value: string;
  }> = [];

  if (profile?.heightCm != null) {
    items.push({
      icon: Ruler,
      label: t("formulas.passport.height"),
      value: `${profile.heightCm} ${t("formulas.cm")}`,
    });
  }
  if (profile?.weightKg != null) {
    items.push({
      icon: Weight,
      label: t("formulas.passport.weight"),
      value: `${profile.weightKg} ${t("formulas.kg")}`,
    });
  }
  if (liveCalcs.ageYears != null) {
    items.push({
      icon: Calendar,
      label: t("formulas.passport.age"),
      value: `${liveCalcs.ageYears} ${t("formulas.years")}`,
    });
  }
  items.push({
    icon: Gauge,
    label: t("formulas.passport.kAge"),
    value: liveCalcs.kAge.toFixed(3),
  });
  if (liveCalcs.relStrength != null) {
    items.push({
      icon: TrendingUp,
      label: t("formulas.passport.relStrength"),
      value: String(liveCalcs.relStrength),
    });
  }
  if (liveCalcs.bmi != null) {
    items.push({
      icon: Sigma,
      label: t("formulas.bmi"),
      value: String(liveCalcs.bmi),
    });
  }
  if (liveCalcs.tdee != null) {
    items.push({
      icon: Zap,
      label: t("formulas.tdee"),
      value: `${liveCalcs.tdee} ${t("formulas.kcal")}`,
    });
  }

  return (
    <Card className="p-3 gap-3 border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground truncate">
            {t("formulas.yourProfile")}
          </span>
        </div>
        <Link href="/profile" className="shrink-0">
          <Button variant="ghost" size="sm" className="h-9 min-h-[36px] text-xs">
            {t("formulas.openProfile")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((it, idx) => {
          const Icon = it.icon;
          return (
            <div
              key={idx}
              className="rounded-lg border border-border bg-background/60 px-3 py-2 flex flex-col gap-0.5"
            >
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground truncate">
                  {it.label}
                </span>
              </div>
              <span className="text-base font-semibold tabular-nums leading-tight">
                {it.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rel strength norm hint */}
      {liveCalcs.relStrength != null && (
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t("formulas.relStrengthNorm")}
        </p>
      )}
    </Card>
  );
}

// ====== Live calc result block ======

interface LiveCalcs {
  kAge: number;
  ageYears: number | null;
  weightKg: number | null;
  heightCm: number | null;
  birthDate: string | null;
  totalStressValue: number | null;
  leverResult: { kLever: number; effectiveMassKg: number; explanation: string } | null;
  gravityForceN: number | null;
  stressIdx: number | null;
  stressLabel: { zone: "low" | "medium" | "high"; label: string } | null;
  tiResult: CNSPulseResult | null;
  relStrength: number | null;
  weightLoss: {
    weightLostKg: number;
    forceReductionN: number;
    improvementPct: number;
  } | null;
  amrapRounds: number | null;
  amrapActualRounds: number | null;
  amrapDurationSec: number | null;
  bmi: number | null;
  tdee: number | null;
  lastSessionStartedAt: string | null;
}

interface LiveResultBlockProps {
  formulaId: FormulaId;
  liveCalcs: LiveCalcs;
  lastSession: SessionLike | null;
  loadingSessions: boolean;
}

function LiveResultBlock({
  formulaId,
  liveCalcs,
  lastSession,
  loadingSessions,
}: LiveResultBlockProps) {
  const { t, locale } = useI18n();

  // Determine the result text and missing-data flag for each formula
  let resultText: string | null = null;
  let missingText: string | null = null;

  switch (formulaId) {
    case "totalStress": {
      if (liveCalcs.totalStressValue != null) {
        const dateStr = formatDateShort(liveCalcs.lastSessionStartedAt, locale);
        resultText = `${liveCalcs.totalStressValue} ${t("formulas.stressUnits")}${dateStr ? " · " + dateStr : ""}`;
      } else {
        missingText = loadingSessions
          ? t("common.loading")
          : t("formulas.passport.noWorkouts");
      }
      break;
    }
    case "substitution": {
      // Substitution is contextual to an active workout — not a per-profile calc.
      missingText = t("formulas.fillProfile");
      break;
    }
    case "lever": {
      if (liveCalcs.leverResult) {
        resultText = `K_lever=${liveCalcs.leverResult.kLever.toFixed(2)}, ${t(
          "formulas.effMass",
        )}=${liveCalcs.leverResult.effectiveMassKg} ${t("formulas.kg")}`;
      } else {
        missingText = t("formulas.fillProfile");
      }
      break;
    }
    case "gravity": {
      if (liveCalcs.gravityForceN != null) {
        resultText = `F = ${liveCalcs.gravityForceN} ${t("formulas.newtons")}`;
      } else {
        missingText = t("formulas.fillProfile");
      }
      break;
    }
    case "age": {
      if (liveCalcs.ageYears != null) {
        resultText = `K_age=${liveCalcs.kAge.toFixed(3)} (${liveCalcs.ageYears} ${t(
          "formulas.years",
        )})`;
      } else {
        // K_age defaults to 1.0 if no birthDate — still show it
        resultText = `K_age=${liveCalcs.kAge.toFixed(3)}`;
      }
      break;
    }
    case "stress": {
      if (liveCalcs.stressIdx != null && liveCalcs.stressLabel) {
        const pct = (liveCalcs.stressIdx * 100).toFixed(0);
        resultText = `I_stress=${liveCalcs.stressIdx.toFixed(3)} (${pct}%, ${liveCalcs.stressLabel.label})`;
      } else {
        missingText = t("formulas.fillProfile");
      }
      break;
    }
    case "ti": {
      if (liveCalcs.tiResult) {
        resultText = `TI=${liveCalcs.tiResult.cnsPulse.toFixed(2)} · ${liveCalcs.tiResult.zone}`;
      } else {
        missingText = loadingSessions
          ? t("common.loading")
          : t("formulas.passport.noWorkouts");
      }
      break;
    }
    case "relativeStrength": {
      if (liveCalcs.relStrength != null) {
        resultText = `R=${liveCalcs.relStrength}`;
      } else {
        missingText = t("formulas.fillProfile");
      }
      break;
    }
    case "weightLoss": {
      if (liveCalcs.weightLoss) {
        resultText = `ΔF=${liveCalcs.weightLoss.forceReductionN} ${t(
          "formulas.newtons",
        )} (~${liveCalcs.weightLoss.improvementPct}%)`;
      } else {
        missingText = t("formulas.fillProfile");
      }
      break;
    }
    case "amrap": {
      if (liveCalcs.amrapRounds != null) {
        const actual = liveCalcs.amrapActualRounds;
        const durMin = liveCalcs.amrapDurationSec
          ? Math.round(liveCalcs.amrapDurationSec / 60)
          : null;
        resultText = `${liveCalcs.amrapRounds} ${t("formulas.rounds")}${
          actual != null ? ` (${actual} ${t("formulas.rounds")} ${t("formulas.predictedRounds").toLowerCase()})` : ""
        }${durMin != null ? ` · ${durMin} ${t("common.minutes")}` : ""}`;
      } else {
        missingText = loadingSessions
          ? t("common.loading")
          : t("formulas.passport.noWorkouts");
      }
      break;
    }
  }

  if (resultText) {
    return (
      <div className="flex items-start gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-emerald-700 dark:text-emerald-400">
            {t("formulas.yourResult")}
          </p>
          <code className="block text-xs font-mono text-emerald-800 dark:text-emerald-300 leading-relaxed break-words">
            {resultText}
          </code>
        </div>
      </div>
    );
  }

  if (missingText) {
    return (
      <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 dark:text-amber-400">
            {t("formulas.fillProfile")}
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {missingText}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ====== Sub-components ======

interface FormulaCardProps {
  def: FormulaDef;
  liveCalcs: LiveCalcs;
  lastSession: SessionLike | null;
  loadingSessions: boolean;
}

function FormulaCard({ def, liveCalcs, lastSession, loadingSessions }: FormulaCardProps) {
  const { t } = useI18n();

  const titleKey = `formulas.card.${def.id}` as DictKey;
  const descKey = `formulas.desc.${def.id}` as DictKey;
  const formulaKey = `formulas.formula.${def.id}` as DictKey;
  const inputsKey = `formulas.inputs.${def.id}` as DictKey;
  const exampleKey = `formulas.example.${def.id}` as DictKey;
  const sourceKey = `formulas.source.${def.id}` as DictKey;

  return (
    <Card className="p-3 gap-3">
      {/* Title + type badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-base leading-tight">
          {t(titleKey)}
        </h3>
        <TypeBadge type={def.type} />
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t(descKey)}
      </p>

      {/* Formula code block */}
      <div className="space-y-1.5">
        <Label>{t("formulas.formula")}</Label>
        <div className="bg-muted rounded-md px-3 py-2.5">
          <code className="text-sm font-mono break-words whitespace-pre-wrap leading-relaxed">
            {t(formulaKey)}
          </code>
          {def.formulaNoteKey && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {t(def.formulaNoteKey)}
            </p>
          )}
        </div>
      </div>

      {/* Live result */}
      <LiveResultBlock
        formulaId={def.id}
        liveCalcs={liveCalcs}
        lastSession={lastSession}
        loadingSessions={loadingSessions}
      />

      {/* Inputs */}
      <KeyValue label={t("formulas.inputs")} value={t(inputsKey)} />

      {/* Example */}
      <KeyValue
        label={t("formulas.example")}
        value={t(exampleKey)}
        mono
      />

      {/* Alternative (e.g. HRV) */}
      {def.alternativeKey && (
        <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
            {t(def.alternativeKey)}
          </p>
        </div>
      )}

      {/* Thresholds (e.g. TI safe/warning/critical) */}
      {def.thresholdKey && (
        <KeyValue
          label={t("formulas.thresholds")}
          value={t(def.thresholdKey)}
          mono
        />
      )}

      {/* Source */}
      <KeyValue label={t("formulas.source")} value={t(sourceKey)} />
    </Card>
  );
}

function TypeBadge({ type }: { type: FormulaType }) {
  const { t } = useI18n();

  if (type === "validated") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 shrink-0",
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="text-[10px]">{t("formulas.validated")}</span>
      </Badge>
    );
  }
  if (type === "mixed") {
    return (
      <Badge
        variant="outline"
        className="border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 gap-1 shrink-0"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span className="text-[10px]">{t("formulas.mixed")}</span>
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 shrink-0"
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      <span className="text-[10px]">{t("formulas.empirical")}</span>
    </Badge>
  );
}

function KeyValue({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
        {label}
      </p>
      {mono ? (
        <code className="block text-xs font-mono text-foreground leading-relaxed break-words">
          {value}
        </code>
      ) : (
        <p className="text-xs text-foreground leading-relaxed">{value}</p>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
      {children}
    </p>
  );
}

function DisclaimerCard() {
  const { t } = useI18n();

  return (
    <Card className="p-3 gap-3 border-2 border-primary/30 bg-primary/5">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("formulas.sources")}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("formulas.disclaimerLong")}
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Badge
          variant="outline"
          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="text-[10px]">{t("formulas.validated")}</span>
        </Badge>
        <Badge
          variant="outline"
          className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-[10px]">{t("formulas.empirical")}</span>
        </Badge>
        <Badge
          variant="outline"
          className="border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 gap-1"
        >
          <Sigma className="h-3.5 w-3.5" />
          <span className="text-[10px]">{t("formulas.mixed")}</span>
        </Badge>
      </div>

      {/* External sources */}
      <div className="space-y-1 pt-1">
        {SOURCES.map((src) => (
          <a
            key={src.href}
            href={src.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all touch-manipulation min-h-[44px]"
          >
            <span className="text-sm font-medium">{src.label}</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
          </a>
        ))}
      </div>
    </Card>
  );
}

// ====== Helpers ======

function formatDateShort(iso: string | null, locale: "ru" | "en"): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return null;
  }
}
