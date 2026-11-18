import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import {
  calcAgeCoefficient,
  calcRelativeStrength,
  calcStressIndex,
  calcWeightLossImpact,
  stressIndexLabel,
} from "@/lib/biomech";
import { calcAgeFromBirthDate, calcTDEE, type ActivityLevel } from "@/lib/nutrition";
import type { AthleteProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

// ====== Response shape ======

export interface ProfileSummaryResponse {
  kAge: number;
  age: number | null;
  relativeStrength: number | null;
  stressIndex: {
    value: number;
    zone: "low" | "medium" | "high";
    label: string;
  } | null;
  weightLossImpact: {
    weightLostKg: number; // гипотетическая потеря (2 кг)
    forceReductionN: number;
    improvementPct: number;
  } | null;
  tdee: number | null;
  bmr: number | null;
  bmi: number | null;
  // Сигналы «что заполнить» для UI:
  hasWeight: boolean;
  hasHeight: boolean;
  hasAge: boolean;
  hasGender: boolean;
  hasPullups: boolean;
  hasStressInputs: boolean;
}

// ====== Row mapper (matches api/profile/route.ts) ======

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
    primaryVector: row.primaryVector ? (row.primaryVector.toLowerCase() as any) : null,
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

// ====== Main handler ======

export async function GET() {
  await ensureSeeded();

  const row = await db.athleteProfile.findUnique({ where: { id: "default" } });
  const profile: AthleteProfile | null = row ? mapProfileRow(row) : null;

  const hasWeight = profile?.weightKg != null && profile.weightKg > 0;
  const hasHeight = profile?.heightCm != null && profile.heightCm > 0;
  const hasAge = profile?.birthDate != null && calcAgeFromBirthDate(profile.birthDate) != null;
  const hasGender = profile?.gender != null;
  const hasPullups =
    profile?.maxPullups != null && profile.maxPullups > 0 && hasWeight && hasHeight;
  const hasStressInputs =
    profile?.lastSleepHours != null &&
    profile?.lastMood != null &&
    profile?.lastSoreness != null;

  // --- K_age (всегда вычисляется, по умолчанию 1.0) ---
  const kAge = calcAgeCoefficient(profile?.birthDate ?? null);

  // --- Возраст (годы) ---
  const age = profile?.birthDate ? calcAgeFromBirthDate(profile.birthDate) : null;

  // --- Относительная сила (maxPullups × bodyMass / (height - 100)) ---
  let relativeStrength: number | null = null;
  if (
    profile?.maxPullups != null &&
    profile?.weightKg != null &&
    profile?.heightCm != null &&
    profile.maxPullups > 0 &&
    profile.weightKg > 0 &&
    profile.heightCm > 100
  ) {
    relativeStrength = calcRelativeStrength(
      profile.maxPullups,
      profile.weightKg,
      profile.heightCm,
    );
  }

  // --- Индекс стресса (sleep / mood / soreness) ---
  let stressIndex: ProfileSummaryResponse["stressIndex"] = null;
  const iStress =
    profile?.lastSleepHours != null &&
    profile?.lastMood != null &&
    profile?.lastSoreness != null
      ? calcStressIndex(
          profile.lastSleepHours,
          profile.lastMood,
          profile.lastSoreness,
        )
      : null;
  if (iStress !== null) {
    const label = stressIndexLabel(iStress);
    stressIndex = {
      value: iStress,
      zone: label.zone,
      label: label.label,
    };
  }

  // --- Влияние потери 2 кг на силу в горизонте (K_lever = 1.0) ---
  let weightLossImpact: ProfileSummaryResponse["weightLossImpact"] = null;
  if (hasWeight && profile && profile.weightKg != null && profile.weightKg > 0) {
    const impact = calcWeightLossImpact(2, profile.weightKg);
    weightLossImpact = {
      weightLostKg: impact.weightLostKg,
      forceReductionN: impact.forceReductionN,
      improvementPct: impact.plancheImprovementPct,
    };
  }

  // --- BMI = weight / (height_m)² ---
  let bmi: number | null = null;
  if (hasWeight && hasHeight && profile) {
    const hM = profile.heightCm! / 100;
    if (hM > 0) {
      bmi = Number((profile.weightKg! / (hM * hM)).toFixed(1));
    }
  }

  // --- TDEE (Mifflin-St Jeor) — нужен вес + рост + возраст + пол.
  // Если пол не указан — используем male (как в nutrition.ts calcBMR по умолчанию). ---
  let tdee: number | null = null;
  let bmr: number | null = null;
  if (hasWeight && hasHeight && hasAge && profile && age != null) {
    const genderForCalc =
      profile.gender === "female"
        ? "female"
        : profile.gender === "other"
          ? "other"
          : "male";
    // По умолчанию moderate (3-5 тренировок/нед) — реалистичная базовая оценка
    const activity: ActivityLevel = "moderate";
    try {
      const tdeeResult = calcTDEE(
        profile.weightKg!,
        profile.heightCm!,
        age,
        genderForCalc as any,
        activity,
      );
      bmr = tdeeResult.bmr;
      tdee = tdeeResult.tdee;
    } catch {
      tdee = null;
      bmr = null;
    }
  }

  const summary: ProfileSummaryResponse = {
    kAge,
    age,
    relativeStrength,
    stressIndex,
    weightLossImpact,
    tdee,
    bmr,
    bmi,
    hasWeight,
    hasHeight,
    hasAge,
    hasGender,
    hasPullups,
    hasStressInputs,
  };

  return NextResponse.json(summary);
}
