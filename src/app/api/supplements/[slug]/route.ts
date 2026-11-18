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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const row = await db.supplement.findUnique({ where: { slug } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mapRow(row));
}
