import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { Exercise } from "@/lib/types";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await ensureSeeded();
  const { slug } = await params;
  const row = await db.exercise.findUnique({ where: { slug } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const exercise = parseExercise(row);

  const altSlugs = exercise.alternatives;
  const altRows = await db.exercise.findMany({
    where: { slug: { in: altSlugs } },
  });
  const alternatives = altRows.map(parseExercise);

  return NextResponse.json({ ...exercise, alternatives });
}
