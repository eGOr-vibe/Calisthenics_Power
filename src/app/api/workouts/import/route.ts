import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import {
  parseTags,
  validateCSVRow,
  type CSVRow,
} from "@/lib/csv-import";

export const dynamic = "force-dynamic";

interface ImportSessionPayload {
  date?: string;
  format?: string;
  duration_min?: number;
  rounds?: number;
  reps?: number;
  volume?: number;
  notes?: string;
  tags?: string;
  feeling?: number;
}

interface ImportPayload {
  sessions?: ImportSessionPayload[];
  source?: string;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function numOrUndefined(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (isString(v) && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function toDate(v: unknown): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (!isString(v)) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * POST /api/workouts/import
 * Body: { sessions: Array<CSVRow>, source?: "csv" | "import" | "manual" }
 * Создаёт несколько сессий за один запрос.
 * Возвращает: { imported: number, errors: Array<{ row, error }> }
 */
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

  const rawSessions = Array.isArray(payload.sessions) ? payload.sessions : [];
  const source =
    typeof payload.source === "string" ? payload.source : "csv";

  const errors: Array<{ row: number; error: string }> = [];
  const valid: Array<{
    format: string;
    startedAt: Date;
    durationSec: number;
    totalRounds: number;
    totalReps: number;
    totalVolume: number;
    notes: string | null;
    tags: string | null;
    feelingRating: number | null;
    items: string;
    source: string;
  }> = [];

  rawSessions.forEach((raw, idx) => {
    const rowNum = idx + 2; // +2: 1-based и пропускаем строку заголовков
    if (!raw || typeof raw !== "object") {
      errors.push({ row: rowNum, error: "invalid row" });
      return;
    }

    const row: CSVRow = {
      date: isString(raw.date) ? raw.date : "",
      format: isString(raw.format) ? raw.format : "",
      duration_min: numOrUndefined(raw.duration_min),
      rounds: numOrUndefined(raw.rounds),
      reps: numOrUndefined(raw.reps),
      volume: numOrUndefined(raw.volume),
      notes: isString(raw.notes) ? raw.notes : undefined,
      tags: isString(raw.tags) ? raw.tags : undefined,
      feeling: numOrUndefined(raw.feeling),
    };

    const err = validateCSVRow(row, rowNum);
    if (err) {
      errors.push({ row: rowNum, error: err });
      return;
    }

    const startedAt = toDate(row.date) ?? new Date();
    const tagsArr = parseTags(row.tags);
    const durationSec =
      row.duration_min !== undefined
        ? Math.max(0, Math.round(row.duration_min * 60))
        : 0;
    const totalRounds = row.rounds ?? 0;
    const totalReps = row.reps ?? 0;
    const totalVolume = row.volume ?? 0;
    const feelingRating =
      row.feeling !== undefined
        ? Math.max(1, Math.min(10, Math.round(row.feeling)))
        : null;
    const notes = row.notes && row.notes.trim() ? row.notes.trim() : null;

    valid.push({
      format: row.format.toUpperCase(),
      startedAt,
      durationSec,
      totalRounds,
      totalReps,
      totalVolume,
      notes,
      tags: tagsArr.length > 0 ? JSON.stringify(tagsArr) : null,
      feelingRating,
      items: JSON.stringify([]),
      source,
    });
  });

  let imported = 0;
  if (valid.length > 0) {
    try {
      const r = await db.workoutSession.createMany({
        data: valid as any,
      });
      imported = r.count;
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          error: "db_error",
          message: e instanceof Error ? e.message : String(e),
          imported: 0,
          errors,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    imported,
    totalRows: rawSessions.length,
    errors,
  });
}
