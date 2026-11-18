import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { Exercise } from "@/lib/types";

export const dynamic = "force-dynamic";

// Тот же парсер, что в /api/exercises/route.ts — держим копию,
// чтобы не плодить межроутовую связность (так сделано в проекте).
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
    compoundType: row.compoundType
      ? (row.compoundType.toLowerCase() as any)
      : null,
    isCompound: row.isCompound ?? null,
  };
}

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const rawLimit = Number(searchParams.get("limit") ?? 20);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, 100)
      : 20;
  const compoundType = searchParams.get("compoundType");

  const where: any = { compoundScore: { not: null } };
  if (compoundType && compoundType !== "all") {
    where.compoundType = compoundType.toUpperCase();
  }

  const rows = await db.exercise.findMany({
    where,
    orderBy: { compoundScore: "desc" },
    take: limit,
  });

  return NextResponse.json(rows.map(parseExercise));
}
