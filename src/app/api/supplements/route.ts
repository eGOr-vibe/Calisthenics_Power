import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { Supplement } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): Supplement {
  return {
    id: row.id,
    slug: row.slug,
    nameRu: row.nameRu,
    nameEn: row.nameEn,
    category: row.category.toLowerCase(),
    descriptionRu: row.descriptionRu,
    descriptionEn: row.descriptionEn,
    dosageRu: row.dosageRu,
    dosageEn: row.dosageEn,
    timingRu: row.timingRu,
    timingEn: row.timingEn,
    efficacy: row.efficacy.toLowerCase(),
    efficacyNotesRu: row.efficacyNotesRu,
    efficacyNotesEn: row.efficacyNotesEn,
    sideEffectsRu: row.sideEffectsRu,
    sideEffectsEn: row.sideEffectsEn,
    contraindicationsRu: row.contraindicationsRu,
    contraindicationsEn: row.contraindicationsEn,
    sources: JSON.parse(row.sources) as string[],
    recommendedForGoals: JSON.parse(row.recommendedForGoals) as string[],
  };
}

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const goal = searchParams.get("goal");

  const where: any = {};
  if (category && category !== "all") {
    where.category = category.toUpperCase();
  }

  const rows = await db.supplement.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  let parsed = rows.map(mapRow);

  // Optional goal filter (e.g., ?goal=bulk)
  if (goal && goal !== "all") {
    parsed = parsed.filter((s) => s.recommendedForGoals.includes(goal));
  }
  return NextResponse.json(parsed);
}
