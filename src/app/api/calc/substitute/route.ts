import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { calcSubstitution, type SubstitutionResult } from "@/lib/biomech";
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
  };
}

interface SubstituteRequestBody {
  oldSlug: string;
  newSlug: string;
  reps: number;
  rounds?: number;
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body: SubstituteRequestBody = await request.json();

  const oldRow = await db.exercise.findUnique({
    where: { slug: body.oldSlug },
  });
  const newRow = await db.exercise.findUnique({
    where: { slug: body.newSlug },
  });

  if (!oldRow || !newRow) {
    return NextResponse.json(
      { error: "Exercise not found" },
      { status: 404 }
    );
  }

  const oldEx = parseExercise(oldRow);
  const newEx = parseExercise(newRow);
  const rounds = body.rounds ?? 1;

  const result: SubstitutionResult = calcSubstitution(
    oldEx,
    newEx,
    body.reps,
    rounds
  );

  return NextResponse.json({
    oldExercise: oldEx,
    newExercise: newEx,
    ...result,
  });
}
