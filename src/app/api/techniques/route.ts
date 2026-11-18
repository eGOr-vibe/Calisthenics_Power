import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { Technique } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): Technique {
  return {
    id: row.id,
    slug: row.slug,
    nameRu: row.nameRu,
    nameEn: row.nameEn,
    category: row.category.toLowerCase() as any,
    descriptionRu: row.descriptionRu,
    descriptionEn: row.descriptionEn,
    whenToApplyRu: row.whenToApplyRu,
    whenToApplyEn: row.whenToApplyEn,
    stepsRu: JSON.parse(row.stepsRu),
    stepsEn: JSON.parse(row.stepsEn),
    scienceRu: row.scienceRu,
    scienceEn: row.scienceEn,
    level: row.level.toLowerCase() as any,
    durationMin: row.durationMin,
  };
}

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim().toLowerCase();

  const where: any = {};
  if (category && category !== "all") {
    where.category = category.toUpperCase();
  }
  const rows = await db.technique.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  let parsed = rows.map(mapRow);
  if (q) {
    parsed = parsed.filter(
      (t) =>
        t.nameRu.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.descriptionRu.toLowerCase().includes(q) ||
        t.descriptionEn.toLowerCase().includes(q) ||
        (t.scienceRu?.toLowerCase().includes(q) ?? false) ||
        (t.scienceEn?.toLowerCase().includes(q) ?? false) ||
        (t.whenToApplyRu?.toLowerCase().includes(q) ?? false) ||
        (t.whenToApplyEn?.toLowerCase().includes(q) ?? false) ||
        t.stepsRu.some((s) => s.toLowerCase().includes(q)) ||
        t.stepsEn.some((s) => s.toLowerCase().includes(q)),
    );
  }
  return NextResponse.json(parsed);
}
