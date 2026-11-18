import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { SkillNode } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): SkillNode {
  return {
    id: row.id,
    slug: row.slug,
    exerciseSlug: row.exerciseSlug ?? undefined,
    nameRu: row.nameRu,
    nameEn: row.nameEn,
    descriptionRu: row.descriptionRu,
    descriptionEn: row.descriptionEn,
    branch: row.branch.toLowerCase(),
    type: row.type.toLowerCase(),
    order: row.order,
    gateSec: row.gateSec ?? undefined,
    gateReps: row.gateReps ?? undefined,
    gateNotesRu: row.gateNotesRu ?? undefined,
    gateNotesEn: row.gateNotesEn ?? undefined,
    prerequisites: JSON.parse(row.prerequisites ?? "[]") as string[],
    unlocksPassive: row.unlocksPassive
      ? (JSON.parse(row.unlocksPassive) as string[])
      : undefined,
    x: row.x,
    y: row.y,
    loadCoef: row.loadCoef,
    isElite: row.isElite ?? false,
  };
}

// GET /api/skills/[slug] — один узел дерева по slug
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const row = await db.skillNode.findUnique({ where: { slug } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mapRow(row));
}
