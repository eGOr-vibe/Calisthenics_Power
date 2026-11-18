import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type {
  SubstitutionRecord,
  WorkoutFormat,
  WorkoutSession,
  WorkoutSessionItem,
} from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Безопасно парсит JSON-строку тегов в массив строк.
 * Принимает как уже распарсенный массив, так и JSON-строку из БД.
 */
function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((t): t is string => typeof t === "string");
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((t): t is string => typeof t === "string");
      }
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: any): WorkoutSession {
  return {
    id: row.id,
    templateId: row.templateId,
    format: row.format.toLowerCase() as WorkoutFormat,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
    durationSec: row.durationSec,
    totalRounds: row.totalRounds,
    totalReps: row.totalReps,
    totalVolume: row.totalVolume,
    substitutions: row.substitutions
      ? (JSON.parse(row.substitutions) as SubstitutionRecord[])
      : [],
    avgHr: row.avgHr,
    maxHr: row.maxHr,
    notes: row.notes,
    feelingRating: row.feelingRating,
    items: row.items ? (JSON.parse(row.items) as WorkoutSessionItem[]) : [],
    tags: parseTags(row.tags),
    source: (row.source as WorkoutSession["source"]) ?? "manual",
  };
}

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);
  const rows = await db.workoutSession.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
  return NextResponse.json(rows.map(mapRow));
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json();

  // Normalize tags: может прийти массив либо строка с разделителями
  let tagsJson: string | null = null;
  if (body.tags !== undefined && body.tags !== null) {
    const tagsArr = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string"
        ? body.tags
            .split(/[;,]/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];
    tagsJson = tagsArr.length > 0 ? JSON.stringify(tagsArr) : null;
  }

  const source = typeof body.source === "string" ? body.source : "manual";

  const row = await db.workoutSession.create({
    data: {
      templateId: body.templateId ?? null,
      format: (body.format as string).toUpperCase(),
      durationSec: body.durationSec ?? 0,
      totalRounds: body.totalRounds ?? 0,
      totalReps: body.totalReps ?? 0,
      totalVolume: body.totalVolume ?? 0,
      substitutions: body.substitutions ? JSON.stringify(body.substitutions) : null,
      avgHr: body.avgHr ?? null,
      maxHr: body.maxHr ?? null,
      notes: body.notes ?? null,
      feelingRating: body.feelingRating ?? null,
      items: JSON.stringify(body.items ?? []),
      tags: tagsJson,
      source,
    },
  });
  return NextResponse.json(mapRow(row));
}
