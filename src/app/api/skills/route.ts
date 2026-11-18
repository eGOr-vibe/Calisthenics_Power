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

// GET /api/skills?branch=pull — список узлов дерева (опционально отфильтровать по ветви)
export async function GET(req: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch")?.toLowerCase() ?? null;

  const rows = await db.skillNode.findMany({
    orderBy: [{ branch: "asc" }, { order: "asc" }],
  });

  const nodes = rows.map(mapRow);
  const filtered = branch
    ? nodes.filter((n) => n.branch === branch)
    : nodes;
  return NextResponse.json(filtered);
}
