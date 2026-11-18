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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeeded();
  const { id } = await params;
  const row = await db.workoutSession.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mapRow(row));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeeded();
  const { id } = await params;
  const body = await request.json();

  // Normalize tags: может прийти массив, строка с разделителями, либо null
  let tagsUpdate: string | null | undefined = undefined;
  if (body.tags !== undefined) {
    if (body.tags === null) {
      tagsUpdate = null;
    } else {
      const tagsArr = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
          ? body.tags
              .split(/[;,]/)
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
      tagsUpdate = tagsArr.length > 0 ? JSON.stringify(tagsArr) : null;
    }
  }

  const row = await db.workoutSession.update({
    where: { id },
    data: {
      ...(body.durationSec !== undefined && { durationSec: body.durationSec }),
      ...(body.totalRounds !== undefined && { totalRounds: body.totalRounds }),
      ...(body.totalReps !== undefined && { totalReps: body.totalReps }),
      ...(body.totalVolume !== undefined && { totalVolume: body.totalVolume }),
      ...(body.substitutions !== undefined && {
        substitutions: body.substitutions ? JSON.stringify(body.substitutions) : null,
      }),
      ...(body.avgHr !== undefined && { avgHr: body.avgHr }),
      ...(body.maxHr !== undefined && { maxHr: body.maxHr }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.feelingRating !== undefined && { feelingRating: body.feelingRating }),
      ...(body.items !== undefined && { items: JSON.stringify(body.items) }),
      ...(tagsUpdate !== undefined && { tags: tagsUpdate }),
      ...(body.source !== undefined && { source: body.source }),
    },
  });
  return NextResponse.json(mapRow(row));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeeded();
  const { id } = await params;
  await db.workoutSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

