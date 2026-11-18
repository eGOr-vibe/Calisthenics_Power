import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { ProblemArea } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): ProblemArea {
  return {
    id: row.id,
    slug: row.slug,
    nameRu: row.nameRu,
    nameEn: row.nameEn,
    descriptionRu: row.descriptionRu,
    descriptionEn: row.descriptionEn,
    category: row.category,
    causesRu: JSON.parse(row.causesRu) as string[],
    causesEn: JSON.parse(row.causesEn) as string[],
    solutionsRu: JSON.parse(row.solutionsRu) as string[],
    solutionsEn: JSON.parse(row.solutionsEn) as string[],
    recommendedExerciseSlugs: JSON.parse(row.recommendedExerciseSlugs) as string[],
    recommendedTechniqueSlugs: JSON.parse(row.recommendedTechniqueSlugs) as string[],
    nutritionTipsRu: row.nutritionTipsRu,
    nutritionTipsEn: row.nutritionTipsEn,
    whenToSeeDoctorRu: row.whenToSeeDoctorRu,
    whenToSeeDoctorEn: row.whenToSeeDoctorEn,
    relatedInjuryBodyParts: JSON.parse(row.relatedInjuryBodyParts) as string[],
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const row = await db.problemArea.findUnique({ where: { slug } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mapRow(row));
}
