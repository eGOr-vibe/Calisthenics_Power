import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import {
  calcRelativeStrength,
  calcWeightLossImpact,
  calcAgeCoefficient,
  calcCNSPulse,
  type CNSPulseResult,
} from "@/lib/biomech";
import { calcMenstrualCycle, type MenstrualPhase } from "@/lib/menstrual-cycle";
import type {
  Exercise,
  ExerciseType,
  WorkoutSession,
  WorkoutSessionItem,
  SubstitutionRecord,
  WorkoutFormat,
  AthleteProfile,
  Injury,
  BodyPart,
  Vector,
} from "@/lib/types";

export const dynamic = "force-dynamic";

// ====== Types (response shape) ======

export interface BiomechSummary {
  weeklyVolume: number;
  weeklyByCategory: Record<ExerciseType, number>;
  balance: {
    pullPushRatio: number;
    upperLowerRatio: number;
    verdict: string;
  };
  jointFatigue: {
    elbows: number;
    shoulders: number;
    wrists: number;
    lowerBack: number;
    knees: number;
  };
  jointWarnings: Array<{
    bodyPart: string;
    weeklyLoad: number;
    threshold: number;
    severity: "safe" | "warning" | "critical";
    messageRu: string;
    messageEn: string;
  }>;
  fourWeekTrend: Array<{
    date: string;
    volume: number;
    load: number;
  }>;
  relativeStrength: {
    value: number;
    interpretation: string;
  } | null;
  weightLossImpact: {
    weightLostKg: number;
    forceReductionN: number;
    plancheImprovementPct: number;
  } | null;
  cnsPulse: {
    cnsPulse: number;
    zone: "safe" | "warning" | "critical";
    recommendation: string;
    recommendationEn: string;
    sessionDate: string;
    sessionFormat: WorkoutFormat;
    totalReps: number;
    totalRounds: number;
    durationSec: number;
  } | null;
  menstrualAdjustment: {
    phase: MenstrualPhase;
    cycleDay: number;
    daysUntilNext: number;
    trainingAdjustment: number; // 0.85-1.1 — умножать на плановый объём
    descriptionRu: string;
    descriptionEn: string;
    recommendationRu: string;
    recommendationEn: string;
  } | null;
}

// ====== Row mappers (replicate existing logic from sessions/profile/injuries APIs) ======

function mapSessionRow(row: any): WorkoutSession {
  const format = (
    typeof row.format === "string" ? row.format.toLowerCase() : "amrap"
  ) as WorkoutFormat;
  let substitutions: SubstitutionRecord[] = [];
  if (Array.isArray(row.substitutions)) {
    substitutions = row.substitutions;
  } else if (typeof row.substitutions === "string" && row.substitutions) {
    try {
      substitutions = JSON.parse(row.substitutions);
    } catch {
      substitutions = [];
    }
  }
  let items: WorkoutSessionItem[] = [];
  if (Array.isArray(row.items)) {
    items = row.items;
  } else if (typeof row.items === "string" && row.items) {
    try {
      items = JSON.parse(row.items);
    } catch {
      items = [];
    }
  }
  return {
    id: row.id,
    templateId: row.templateId ?? null,
    format,
    startedAt: row.startedAt instanceof Date ? row.startedAt.toISOString() : row.startedAt,
    finishedAt:
      row.finishedAt == null
        ? null
        : row.finishedAt instanceof Date
          ? row.finishedAt.toISOString()
          : row.finishedAt,
    durationSec: row.durationSec ?? 0,
    totalRounds: row.totalRounds ?? 0,
    totalReps: row.totalReps ?? 0,
    totalVolume: Number(row.totalVolume ?? 0),
    substitutions,
    avgHr: row.avgHr ?? null,
    maxHr: row.maxHr ?? null,
    notes: row.notes ?? null,
    feelingRating: row.feelingRating ?? null,
    items,
  };
}

function mapProfileRow(row: any): AthleteProfile {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birthDate ? row.birthDate.toISOString() : null,
    gender: row.gender ? (row.gender.toLowerCase() as any) : null,
    heightCm: row.heightCm,
    weightKg: row.weightKg,
    armLengthCm: row.armLengthCm,
    torsoLengthCm: row.torsoLengthCm,
    legLengthCm: row.legLengthCm,
    maxPullups: row.maxPullups,
    maxPushups: row.maxPushups,
    maxDips: row.maxDips,
    maxSquats: row.maxSquats,
    maxPlankSec: row.maxPlankSec,
    primaryVector: row.primaryVector ? (row.primaryVector.toLowerCase() as Vector) : null,
    lastSleepHours: row.lastSleepHours,
    lastMood: row.lastMood,
    lastSoreness: row.lastSoreness,
    lastStressIndex: row.lastStressIndex,
    lastStressUpdated: row.lastStressUpdated ? row.lastStressUpdated.toISOString() : null,
    language: (row.language as any) ?? "ru",
    theme: (row.theme as any) ?? "system",
    ttsEnabled: row.ttsEnabled,
    voiceControl: row.voiceControl,
    showPresets: row.showPresets ?? true,
    aiProvider: (row.aiProvider as any) ?? "zai",
    aiCustomUrl: row.aiCustomUrl,
    aiModel: row.aiModel,
    menstrualPhase: (row.menstrualPhase ?? null) as AthleteProfile["menstrualPhase"],
    menstrualCycleDay: row.menstrualCycleDay ?? null,
    lastMenstrualDate: row.lastMenstrualDate ? row.lastMenstrualDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapInjuryRow(row: any): Injury {
  return {
    id: row.id,
    bodyPart: row.bodyPart.toLowerCase() as BodyPart,
    type: row.type,
    severity: row.severity,
    notes: row.notes,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapExerciseRow(row: any): Exercise {
  return {
    id: row.id,
    slug: row.slug,
    nameRu: row.nameRu,
    nameEn: row.nameEn,
    descriptionRu: row.descriptionRu,
    descriptionEn: row.descriptionEn,
    howToRu: row.howToRu,
    howToEn: row.howToEn,
    type: (typeof row.type === "string" ? row.type.toLowerCase() : row.type) as ExerciseType,
    equipment: row.equipment ? JSON.parse(row.equipment) : [],
    levelBase: row.levelBase.toLowerCase() as any,
    levelSub: row.levelSub as 1 | 2 | 3,
    vectors: row.vectors ? JSON.parse(row.vectors) : [],
    loadCoef: row.loadCoef,
    targetMusclesRu: row.targetMusclesRu ? JSON.parse(row.targetMusclesRu) : [],
    targetMusclesEn: row.targetMusclesEn ? JSON.parse(row.targetMusclesEn) : [],
    illustrationUrl: row.illustrationUrl ?? null,
    scienceRu: row.scienceRu ?? null,
    scienceEn: row.scienceEn ?? null,
    sources: row.sources ? JSON.parse(row.sources) : null,
    alternatives: row.alternatives ? JSON.parse(row.alternatives) : [],
  };
}

// ====== Helpers ======

const DAY_MS = 24 * 60 * 60 * 1000;

function emptyByCategory(): Record<ExerciseType, number> {
  return {
    pull: 0,
    push: 0,
    core: 0,
    legs: 0,
    static: 0,
    mobility: 0,
  };
}

function emptyJointFatigue() {
  return {
    elbows: 0,
    shoulders: 0,
    wrists: 0,
    lowerBack: 0,
    knees: 0,
  };
}

/**
 * Map a body part from Injury.bodyPart to one of our 5 joint fatigue buckets.
 * Returns null for parts we don't track (e.g. neck).
 */
function bodyPartToFatigueKey(
  bodyPart: BodyPart,
): "elbows" | "shoulders" | "wrists" | "lowerBack" | "knees" | null {
  switch (bodyPart) {
    case "leftElbow":
    case "rightElbow":
      return "elbows";
    case "leftShoulder":
    case "rightShoulder":
      return "shoulders";
    case "leftWrist":
    case "rightWrist":
      return "wrists";
    case "lowerBack":
      return "lowerBack";
    case "knees":
      return "knees";
    default:
      return null;
  }
}

// Empirically-derived weekly load thresholds (loadCoef × volume).
// Above warning → caution; above critical → avoid zone.
const JOINT_THRESHOLDS: Record<
  "elbows" | "shoulders" | "wrists" | "lowerBack" | "knees",
  { warning: number; critical: number }
> = {
  elbows: { warning: 600, critical: 1200 },
  shoulders: { warning: 800, critical: 1500 },
  wrists: { warning: 500, critical: 1000 },
  lowerBack: { warning: 500, critical: 1000 },
  knees: { warning: 800, critical: 1600 },
};

// ====== Main handler ======

export async function GET() {
  await ensureSeeded();

  // --- Fetch all data in parallel ---
  const [sessionRows, profileRow, injuryRows, exerciseRows] = await Promise.all([
    db.workoutSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 200,
    }),
    db.athleteProfile.findUnique({ where: { id: "default" } }),
    db.injury.findMany({ where: { active: true } }),
    db.exercise.findMany(),
  ]);

  const sessions = sessionRows.map(mapSessionRow);
  const profile = profileRow ? mapProfileRow(profileRow) : null;
  const injuries = injuryRows.map(mapInjuryRow);
  const exercises = exerciseRows.map(mapExerciseRow);

  // Build slug → exercise lookup
  const exerciseBySlug = new Map<string, Exercise>();
  for (const ex of exercises) exerciseBySlug.set(ex.slug, ex);

  // --- Time windows ---
  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const fourWeeksAgo = now - 28 * DAY_MS;

  // --- Weekly stats ---
  const weeklySessions = sessions.filter((s) => new Date(s.startedAt).getTime() >= weekAgo);
  const weeklyVolume = weeklySessions.reduce(
    (sum, s) => sum + (Number(s.totalVolume) || 0),
    0,
  );

  const weeklyByCategory = emptyByCategory();
  const jointFatigue = emptyJointFatigue();

  for (const session of weeklySessions) {
    for (const item of session.items) {
      const ex = exerciseBySlug.get(item.exerciseSlug);
      if (!ex) continue;
      const vol = Number(item.volume) || 0;
      // Accumulate by exercise type
      weeklyByCategory[ex.type] += vol;
      // Accumulate joint fatigue: loadCoef × volume, distributed to relevant joints
      const jointLoad = ex.loadCoef * vol;
      switch (ex.type) {
        case "pull":
        case "push":
          jointFatigue.elbows += jointLoad;
          jointFatigue.shoulders += jointLoad;
          jointFatigue.wrists += jointLoad;
          break;
        case "static":
          jointFatigue.shoulders += jointLoad;
          jointFatigue.wrists += jointLoad;
          jointFatigue.elbows += jointLoad * 0.5; // statics shift more to shoulders
          break;
        case "core":
          jointFatigue.lowerBack += jointLoad;
          break;
        case "legs":
          jointFatigue.knees += jointLoad;
          jointFatigue.lowerBack += jointLoad * 0.5;
          break;
        case "mobility":
        default:
          // No joint accumulation
          break;
      }
    }
  }

  // Round joint fatigue
  for (const key of Object.keys(jointFatigue) as Array<keyof typeof jointFatigue>) {
    jointFatigue[key] = Math.round(jointFatigue[key]);
  }
  for (const key of Object.keys(weeklyByCategory) as ExerciseType[]) {
    weeklyByCategory[key] = Math.round(weeklyByCategory[key]);
  }

  // --- Balance ratios ---
  const pullVol = weeklyByCategory.pull;
  const pushVol = weeklyByCategory.push;
  const upperVol = pullVol + pushVol;
  const lowerVol = weeklyByCategory.legs + weeklyByCategory.core;

  const pullPushRatio =
    pushVol === 0
      ? pullVol === 0
        ? 1
        : 99 // pull without push — extreme imbalance
      : Number((pullVol / pushVol).toFixed(2));

  const upperLowerRatio =
    lowerVol === 0
      ? upperVol === 0
        ? 1
        : 99
      : Number((upperVol / lowerVol).toFixed(2));

  const balanceVerdictParts: string[] = [];
  if (pullPushRatio < 0.5 || pullPushRatio > 2) {
    balanceVerdictParts.push(
      `pull/push=${pullPushRatio}`,
    );
  }
  if (upperLowerRatio < 0.5 || upperLowerRatio > 3) {
    balanceVerdictParts.push(
      `upper/lower=${upperLowerRatio}`,
    );
  }
  const balanceVerdict =
    balanceVerdictParts.length === 0 ? "balanced" : `imbalance: ${balanceVerdictParts.join(", ")}`;

  // --- Joint warnings (based on injuries) ---
  const jointWarnings: BiomechSummary["jointWarnings"] = [];
  // Group injuries by fatigue key (a user can have multiple injuries to the same joint).
  const injuriesByKey = new Map<
    "elbows" | "shoulders" | "wrists" | "lowerBack" | "knees",
    { bodyPart: string; maxSeverity: number; ruLabel: string; enLabel: string }
  >();
  for (const inj of injuries) {
    const key = bodyPartToFatigueKey(inj.bodyPart);
    if (!key) continue;
    const existing = injuriesByKey.get(key);
    if (existing) {
      existing.maxSeverity = Math.max(existing.maxSeverity, inj.severity);
      existing.bodyPart = `${existing.bodyPart},${inj.bodyPart}`;
    } else {
      injuriesByKey.set(key, {
        bodyPart: inj.bodyPart,
        maxSeverity: inj.severity,
        ruLabel: ruBodyPartLabel(key),
        enLabel: enBodyPartLabel(key),
      });
    }
  }

  for (const [key, info] of injuriesByKey.entries()) {
    const weeklyLoad = jointFatigue[key];
    const thresholds = JOINT_THRESHOLDS[key];
    // Lower threshold if injury severity is high (1-5 scale → more severe = stricter limit)
    const severityMultiplier = 1 - (info.maxSeverity - 1) * 0.15; // 1.0 → 0.4
    const warningThreshold = Math.round(thresholds.warning * severityMultiplier);
    const criticalThreshold = Math.round(thresholds.critical * severityMultiplier);

    let severity: "safe" | "warning" | "critical";
    let messageRu: string;
    let messageEn: string;
    if (weeklyLoad >= criticalThreshold) {
      severity = "critical";
      messageRu = `Критическая нагрузка на ${info.ruLabel}. Снизь объём или сделай разгрузочную неделю.`;
      messageEn = `Critical load on ${info.enLabel}. Reduce volume or take a deload week.`;
    } else if (weeklyLoad >= warningThreshold) {
      severity = "warning";
      messageRu = `Высокая нагрузка на ${info.ruLabel}. Будь осторожен с упражнениями, нагружающими эту зону.`;
      messageEn = `High load on ${info.enLabel}. Be careful with exercises stressing this area.`;
    } else {
      severity = "safe";
      messageRu = `Нагрузка на ${info.ruLabel} в безопасной зоне.`;
      messageEn = `${info.enLabel} load is in the safe zone.`;
    }
    jointWarnings.push({
      bodyPart: key,
      weeklyLoad,
      threshold: warningThreshold,
      severity,
      messageRu,
      messageEn,
    });
  }

  // --- 4-week trend (8 buckets of 3.5 days) ---
  const BUCKET_MS = 3.5 * DAY_MS;
  const buckets: Array<{ date: string; volume: number; load: number }> = [];
  for (let i = 0; i < 8; i++) {
    const start = fourWeeksAgo + i * BUCKET_MS;
    const end = start + BUCKET_MS;
    const midDate = new Date(start + (end - start) / 2);
    let volume = 0;
    let load = 0;
    for (const session of sessions) {
      const ts = new Date(session.startedAt).getTime();
      if (ts < start || ts >= end) continue;
      volume += Number(session.totalVolume) || 0;
      for (const item of session.items) {
        const ex = exerciseBySlug.get(item.exerciseSlug);
        if (!ex) continue;
        load += ex.loadCoef * (Number(item.volume) || 0);
      }
    }
    buckets.push({
      date: midDate.toISOString(),
      volume: Math.round(volume),
      load: Math.round(load),
    });
  }

  // --- Relative strength (if profile has pullups + weight + height) ---
  let relativeStrength: BiomechSummary["relativeStrength"] = null;
  if (
    profile?.maxPullups != null &&
    profile?.weightKg != null &&
    profile?.heightCm != null &&
    profile.maxPullups > 0 &&
    profile.weightKg > 0 &&
    profile.heightCm > 100
  ) {
    const value = calcRelativeStrength(
      profile.maxPullups,
      profile.weightKg,
      profile.heightCm,
    );
    let interpretation: string;
    if (value < 5) interpretation = "below average";
    else if (value < 10) interpretation = "average";
    else if (value < 15) interpretation = "above average";
    else interpretation = "elite";
    relativeStrength = { value, interpretation };
  }

  // --- Weight loss impact (if profile has weight) ---
  let weightLossImpact: BiomechSummary["weightLossImpact"] = null;
  if (profile?.weightKg != null && profile.weightKg > 0) {
    const impact = calcWeightLossImpact(2, profile.weightKg);
    weightLossImpact = {
      weightLostKg: impact.weightLostKg,
      forceReductionN: impact.forceReductionN,
      plancheImprovementPct: impact.plancheImprovementPct,
    };
  }

  // --- CNS Pulse from the latest HIIT session (any format) ---
  let cnsPulse: BiomechSummary["cnsPulse"] = null;
  if (sessions.length > 0 && profile) {
    const latest = sessions[0];
    const latestTs = new Date(latest.startedAt).getTime();
    if (latestTs >= weekAgo && latest.totalRounds > 0 && latest.durationSec > 0) {
      // Estimate average rest between rounds: (totalDuration - workTimeEstimate) / rounds
      // Simplification: restSec ≈ durationSec / totalRounds × 0.4 (40% of round time is rest)
      const restSec = Math.max(5, Math.round((latest.durationSec / latest.totalRounds) * 0.4));
      // kDifficulty: use average loadCoef of items in latest session (or 1.0 fallback)
      let kDiff = 1.0;
      if (latest.items.length > 0) {
        let sumLoad = 0;
        let count = 0;
        for (const item of latest.items) {
          const ex = exerciseBySlug.get(item.exerciseSlug);
          if (ex) {
            sumLoad += ex.loadCoef;
            count++;
          }
        }
        if (count > 0) kDiff = Number((sumLoad / count).toFixed(2));
      }
      const kAge = calcAgeCoefficient(profile.birthDate);
      const phase = profile.primaryVector === "cut" ? "cut" : profile.primaryVector === "static" ? "static" : "reps";
      const reps = latest.totalReps > 0 ? latest.totalReps : 1;
      const result: CNSPulseResult = calcCNSPulse(reps, kDiff, restSec, kAge, phase);
      cnsPulse = {
        cnsPulse: result.cnsPulse,
        zone: result.zone,
        recommendation: result.recommendation,
        recommendationEn: result.recommendationEn,
        sessionDate: latest.startedAt,
        sessionFormat: latest.format,
        totalReps: latest.totalReps,
        totalRounds: latest.totalRounds,
        durationSec: latest.durationSec,
      };
    }
  }

  // --- Menstrual cycle adjustment (Phase 3: female athletes only) ---
  let menstrualAdjustment: BiomechSummary["menstrualAdjustment"] = null;
  if (profile?.gender === "female" && profile.lastMenstrualDate) {
    const cycle = calcMenstrualCycle(profile.lastMenstrualDate);
    if (cycle) {
      menstrualAdjustment = {
        phase: cycle.phase,
        cycleDay: cycle.cycleDay,
        daysUntilNext: cycle.daysUntilNext,
        trainingAdjustment: cycle.trainingAdjustment,
        descriptionRu: cycle.descriptionRu,
        descriptionEn: cycle.descriptionEn,
        recommendationRu: cycle.recommendationRu,
        recommendationEn: cycle.recommendationEn,
      };
    }
  }

  const summary: BiomechSummary = {
    weeklyVolume: Math.round(weeklyVolume),
    weeklyByCategory,
    balance: {
      pullPushRatio,
      upperLowerRatio,
      verdict: balanceVerdict,
    },
    jointFatigue,
    jointWarnings,
    fourWeekTrend: buckets,
    relativeStrength,
    weightLossImpact,
    cnsPulse,
    menstrualAdjustment,
  };

  return NextResponse.json(summary);
}

// ====== Label helpers ======

function ruBodyPartLabel(
  key: "elbows" | "shoulders" | "wrists" | "lowerBack" | "knees",
): string {
  switch (key) {
    case "elbows":
      return "локти";
    case "shoulders":
      return "плечи";
    case "wrists":
      return "запястья";
    case "lowerBack":
      return "поясницу";
    case "knees":
      return "колени";
  }
}

function enBodyPartLabel(
  key: "elbows" | "shoulders" | "wrists" | "lowerBack" | "knees",
): string {
  switch (key) {
    case "elbows":
      return "elbows";
    case "shoulders":
      return "shoulders";
    case "wrists":
      return "wrists";
    case "lowerBack":
      return "lower back";
    case "knees":
      return "knees";
  }
}
