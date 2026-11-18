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

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const relatedInjury = searchParams.get("relatedInjury");

  const where: any = {};
  if (category && category !== "all") {
    where.category = category;
  }

  const rows = await db.problemArea.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  let parsed = rows.map(mapRow);

  if (relatedInjury) {
    parsed = parsed.filter((p) =>
      p.relatedInjuryBodyParts.includes(relatedInjury),
    );
  }
  return NextResponse.json(parsed);
}
