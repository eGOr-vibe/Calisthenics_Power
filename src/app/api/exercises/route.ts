import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { Exercise, Injury } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseExercise(row: any): Exercise {
  return {
    id: row.id,
    slug: row.slug,
    nameRu: row.nameRu,
    nameEn: row.nameEn,
    descriptionRu: row.descriptionRu,
    descriptionEn: row.descriptionEn,
    howToRu: row.howToRu,
    howToEn: row.howToEn,
    type: row.type.toLowerCase() as any,
    equipment: JSON.parse(row.equipment),
    levelBase: row.levelBase.toLowerCase() as any,
    levelSub: row.levelSub as 1 | 2 | 3,
    vectors: JSON.parse(row.vectors),
    loadCoef: row.loadCoef,
    targetMusclesRu: JSON.parse(row.targetMusclesRu),
    targetMusclesEn: JSON.parse(row.targetMusclesEn),
    illustrationUrl: row.illustrationUrl ?? null,
    scienceRu: row.scienceRu ?? null,
    scienceEn: row.scienceEn ?? null,
    sources: row.sources ? JSON.parse(row.sources) : null,
    alternatives: JSON.parse(row.alternatives),
    compoundScore: row.compoundScore ?? null,
    muscleGroupsCount: row.muscleGroupsCount ?? null,
    compoundType: row.compoundType ? (row.compoundType.toLowerCase() as any) : null,
    isCompound: row.isCompound ?? null,
  };
}

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const equipment = searchParams.get("equipment");
  const level = searchParams.get("level");
  const vector = searchParams.get("vector");
  const q = searchParams.get("q");

  const where: any = {};
  if (type && type !== "all") where.type = type.toUpperCase();
  if (level && level !== "all") where.levelBase = level.toUpperCase();

  let rows = await db.exercise.findMany({ where, orderBy: { loadCoef: "asc" } });

  let parsed = rows.map(parseExercise);

  // фильтрация по equipment (JSON содержит)
  if (equipment && equipment !== "all") {
    parsed = parsed.filter((e) => e.equipment.includes(equipment as any));
  }
  if (vector && vector !== "all") {
    parsed = parsed.filter((e) => e.vectors.includes(vector as any));
  }
  if (q) {
    const ql = q.toLowerCase();
    parsed = parsed.filter(
      (e) =>
        e.nameRu.toLowerCase().includes(ql) ||
        e.nameEn.toLowerCase().includes(ql) ||
        e.slug.toLowerCase().includes(ql) ||
        e.targetMusclesRu.some((m) => m.toLowerCase().includes(ql)) ||
        e.targetMusclesEn.some((m) => m.toLowerCase().includes(ql))
    );
  }

  return NextResponse.json(parsed);
}
