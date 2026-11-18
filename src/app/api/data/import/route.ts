import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

const EXPORT_VERSION = "0.2.0";

interface ImportPayload {
  version?: string;
  profile?: unknown;
  injuries?: unknown[];
  templates?: unknown[];
  sessions?: unknown[];
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function toDate(v: unknown): Date | null {
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : v;
  }
  if (!isString(v)) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function numOrNull(v: unknown): number | null {
  if (isNumber(v)) return v;
  if (isString(v) && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

// Map профиль из JSON-бэкапа → Prisma-совместимый объект для upsert.
function profileToPrisma(p: Record<string, unknown> | null | undefined) {
  const empty = {
    id: "default",
    name: null,
    birthDate: null,
    gender: null,
    heightCm: null,
    weightKg: null,
    armLengthCm: null,
    torsoLengthCm: null,
    legLengthCm: null,
    maxPullups: null,
    maxPushups: null,
    maxDips: null,
    maxSquats: null,
    maxPlankSec: null,
    primaryVector: null,
    lastSleepHours: null,
    lastMood: null,
    lastSoreness: null,
    lastStressIndex: null,
    lastStressUpdated: null,
    language: "ru",
    theme: "system",
    ttsEnabled: true,
    voiceControl: false,
    showPresets: true,
    aiProvider: "zai",
    aiCustomUrl: null,
    aiModel: null,
  } as const;

  if (!p || typeof p !== "object") return empty;

  const obj = p as Record<string, unknown>;
  return {
    id: "default",
    name: isString(obj.name) ? obj.name : null,
    birthDate: toDate(obj.birthDate),
    gender: isString(obj.gender) ? obj.gender.toUpperCase() : null,
    heightCm: numOrNull(obj.heightCm),
    weightKg: numOrNull(obj.weightKg),
    armLengthCm: numOrNull(obj.armLengthCm),
    torsoLengthCm: numOrNull(obj.torsoLengthCm),
    legLengthCm: numOrNull(obj.legLengthCm),
    maxPullups: numOrNull(obj.maxPullups),
    maxPushups: numOrNull(obj.maxPushups),
    maxDips: numOrNull(obj.maxDips),
    maxSquats: numOrNull(obj.maxSquats),
    maxPlankSec: numOrNull(obj.maxPlankSec),
    primaryVector: isString(obj.primaryVector) ? obj.primaryVector.toUpperCase() : null,
    lastSleepHours: numOrNull(obj.lastSleepHours),
    lastMood: numOrNull(obj.lastMood),
    lastSoreness: numOrNull(obj.lastSoreness),
    lastStressIndex: numOrNull(obj.lastStressIndex),
    lastStressUpdated: toDate(obj.lastStressUpdated),
    language: isString(obj.language) ? obj.language : "ru",
    theme: isString(obj.theme) ? obj.theme : "system",
    ttsEnabled: isBoolean(obj.ttsEnabled) ? obj.ttsEnabled : true,
    voiceControl: isBoolean(obj.voiceControl) ? obj.voiceControl : false,
    showPresets: isBoolean(obj.showPresets) ? obj.showPresets : true,
    aiProvider: isString(obj.aiProvider) ? obj.aiProvider : "zai",
    aiCustomUrl: isString(obj.aiCustomUrl) ? obj.aiCustomUrl : null,
    aiModel: isString(obj.aiModel) ? obj.aiModel : null,
  };
}

// POST /api/data/import
// Принимает JSON-бэкап (как при экспорте) и заменяет все пользовательские данные.
// Профиль — upsert; injuries/templates/sessions — deleteMany + createMany.
// Справочники (exercises/techniques/theory) НЕ трогаются — они всегда
// восстанавливаются из сида.
export async function POST(request: Request) {
  await ensureSeeded();

  let payload: ImportPayload;
  try {
    payload = (await request.json()) as ImportPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const rawInjuries = Array.isArray(payload.injuries) ? payload.injuries : [];
  const rawTemplates = Array.isArray(payload.templates) ? payload.templates : [];
  const rawSessions = Array.isArray(payload.sessions) ? payload.sessions : [];

  // === Transaction: wipe + recreate user data ===
  const counts = await db.$transaction(async (tx) => {
    await Promise.all([
      tx.injury.deleteMany(),
      tx.workoutTemplate.deleteMany(),
      tx.workoutSession.deleteMany(),
    ]);

    let injuryCount = 0;
    let templateCount = 0;
    let sessionCount = 0;

    if (rawInjuries.length > 0) {
      const r = await tx.injury.createMany({
        data: rawInjuries
          .filter(
            (r): r is Record<string, unknown> =>
              typeof r === "object" && r !== null,
          )
          .map((r) => ({
            bodyPart: isString(r.bodyPart) ? r.bodyPart.toUpperCase() : "NECK",
            type: isString(r.type) ? r.type : "",
            severity: Math.max(1, Math.min(5, numOrNull(r.severity) ?? 3)),
            notes: isString(r.notes) ? r.notes : null,
            active: isBoolean(r.active) ? r.active : true,
          })) as any,
      });
      injuryCount = r.count;
    }

    if (rawTemplates.length > 0) {
      const r = await tx.workoutTemplate.createMany({
        data: rawTemplates
          .filter(
            (r): r is Record<string, unknown> =>
              typeof r === "object" && r !== null,
          )
          .map((r) => ({
            name: isString(r.name) ? r.name : "Template",
            format: isString(r.format) ? r.format.toUpperCase() : "AMRAP",
            durationSec: numOrNull(r.durationSec),
            rounds: numOrNull(r.rounds),
            restSec: numOrNull(r.restSec),
            workSec: numOrNull(r.workSec),
            items: JSON.stringify(Array.isArray(r.items) ? r.items : []),
          })) as any,
      });
      templateCount = r.count;
    }

    if (rawSessions.length > 0) {
      const r = await tx.workoutSession.createMany({
        data: rawSessions
          .filter(
            (r): r is Record<string, unknown> =>
              typeof r === "object" && r !== null,
          )
          .map((r) => {
            const startedAt = toDate(r.startedAt) ?? new Date();
            return {
              templateId: isString(r.templateId) ? r.templateId : null,
              format: isString(r.format) ? r.format.toUpperCase() : "AMRAP",
              startedAt,
              finishedAt: toDate(r.finishedAt),
              durationSec: numOrNull(r.durationSec) ?? 0,
              totalRounds: numOrNull(r.totalRounds) ?? 0,
              totalReps: numOrNull(r.totalReps) ?? 0,
              totalVolume: numOrNull(r.totalVolume) ?? 0,
              substitutions: JSON.stringify(
                Array.isArray(r.substitutions) ? r.substitutions : [],
              ),
              avgHr: numOrNull(r.avgHr),
              maxHr: numOrNull(r.maxHr),
              notes: isString(r.notes) ? r.notes : null,
              feelingRating: numOrNull(r.feelingRating),
              items: JSON.stringify(Array.isArray(r.items) ? r.items : []),
            };
          }) as any,
      });
      sessionCount = r.count;
    }

    const profileData = profileToPrisma(
      payload.profile as Record<string, unknown> | null,
    );
    await tx.athleteProfile.upsert({
      where: { id: "default" },
      update: profileData,
      create: profileData,
    });

    return {
      injuries: injuryCount,
      templates: templateCount,
      sessions: sessionCount,
    };
  });

  return NextResponse.json({
    ok: true,
    version: EXPORT_VERSION,
    importedAt: new Date().toISOString(),
    counts,
  });
}
