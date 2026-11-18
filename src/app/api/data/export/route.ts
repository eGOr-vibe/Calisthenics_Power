import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

// Версия схемы экспорта. При ломающих изменениях схемы бампить.
const EXPORT_VERSION = "0.2.0";

// GET /api/data/export
// Возвращает полный JSON-дамп пользовательских данных:
// profile, injuries, templates, sessions + счётчики справочников.
// Справочники (exercises/techniques/theory) экспортируются только счётчиками —
// они восстанавливаются из сида при импорте.
export async function GET() {
  await ensureSeeded();

  const [profile, injuries, templates, sessions, exercises, techniques, theory] =
    await Promise.all([
      db.athleteProfile.findUnique({ where: { id: "default" } }),
      db.injury.findMany({ orderBy: { createdAt: "asc" } }),
      db.workoutTemplate.findMany({ orderBy: { updatedAt: "asc" } }),
      db.workoutSession.findMany({ orderBy: { startedAt: "asc" } }),
      db.exercise.count(),
      db.technique.count(),
      db.theoryArticle.count(),
    ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    version: EXPORT_VERSION,
    profile,
    injuries,
    templates,
    sessions,
    counts: { exercises, techniques, theory },
  });
}
