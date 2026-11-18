import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { AthleteProfile, Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): AthleteProfile {
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
    language: (row.language as Locale) ?? "ru",
    theme: (row.theme as any) ?? "system",
    ttsEnabled: row.ttsEnabled,
    voiceControl: row.voiceControl,
    showPresets: row.showPresets ?? true,
    aiProvider: (row.aiProvider as any) ?? "zai",
    aiCustomUrl: row.aiCustomUrl,
    aiModel: row.aiModel,
    // Phase 3: menstrual cycle tracking
    menstrualPhase: row.menstrualPhase ?? null,
    menstrualCycleDay: row.menstrualCycleDay ?? null,
    lastMenstrualDate: row.lastMenstrualDate ? row.lastMenstrualDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  await ensureSeeded();
  const row = await db.athleteProfile.findUnique({ where: { id: "default" } });
  if (!row) {
    return NextResponse.json(
      {
        id: "default",
        name: null,
        language: "ru",
        theme: "system",
        ttsEnabled: true,
        voiceControl: false,
        showPresets: true,
      } as any
    );
  }
  return NextResponse.json(mapRow(row));
}

export async function PUT(request: Request) {
  await ensureSeeded();
  const body = await request.json();

  // Partial update: only update fields that are explicitly present in body.
  // This prevents accidental nulling of fields not sent in the request
  // (e.g. when only updating stress index, we don't want to wipe height/weight).
  const data: any = {};
  if ("name" in body) data.name = body.name ?? null;
  if ("birthDate" in body) data.birthDate = body.birthDate ? new Date(body.birthDate) : null;
  if ("gender" in body) data.gender = body.gender ? body.gender.toUpperCase() : null;
  if ("heightCm" in body) data.heightCm = body.heightCm ?? null;
  if ("weightKg" in body) data.weightKg = body.weightKg ?? null;
  if ("armLengthCm" in body) data.armLengthCm = body.armLengthCm ?? null;
  if ("torsoLengthCm" in body) data.torsoLengthCm = body.torsoLengthCm ?? null;
  if ("legLengthCm" in body) data.legLengthCm = body.legLengthCm ?? null;
  if ("maxPullups" in body) data.maxPullups = body.maxPullups ?? null;
  if ("maxPushups" in body) data.maxPushups = body.maxPushups ?? null;
  if ("maxDips" in body) data.maxDips = body.maxDips ?? null;
  if ("maxSquats" in body) data.maxSquats = body.maxSquats ?? null;
  if ("maxPlankSec" in body) data.maxPlankSec = body.maxPlankSec ?? null;
  if ("primaryVector" in body) data.primaryVector = body.primaryVector ? body.primaryVector.toUpperCase() : null;
  if ("lastSleepHours" in body) data.lastSleepHours = body.lastSleepHours ?? null;
  if ("lastMood" in body) data.lastMood = body.lastMood ?? null;
  if ("lastSoreness" in body) data.lastSoreness = body.lastSoreness ?? null;
  if ("lastStressIndex" in body) data.lastStressIndex = body.lastStressIndex ?? null;
  if ("lastStressUpdated" in body) data.lastStressUpdated = body.lastStressUpdated ? new Date(body.lastStressUpdated) : null;
  if ("language" in body) data.language = body.language ?? "ru";
  if ("theme" in body) data.theme = body.theme ?? "system";
  if ("ttsEnabled" in body) data.ttsEnabled = body.ttsEnabled ?? true;
  if ("voiceControl" in body) data.voiceControl = body.voiceControl ?? false;
  if ("showPresets" in body) data.showPresets = body.showPresets ?? true;
  if ("aiProvider" in body) data.aiProvider = body.aiProvider ?? "zai";
  if ("aiCustomUrl" in body) data.aiCustomUrl = body.aiCustomUrl ?? null;
  if ("aiModel" in body) data.aiModel = body.aiModel ?? null;
  // Phase 3: menstrual cycle tracking (for female athletes)
  if ("menstrualPhase" in body) data.menstrualPhase = body.menstrualPhase ?? null;
  if ("menstrualCycleDay" in body) data.menstrualCycleDay = body.menstrualCycleDay ?? null;
  if ("lastMenstrualDate" in body) data.lastMenstrualDate = body.lastMenstrualDate ? new Date(body.lastMenstrualDate) : null;

  const row = await db.athleteProfile.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  return NextResponse.json(mapRow(row));
}
