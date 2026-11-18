import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { UserSkillState } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): UserSkillState {
  return {
    id: row.id,
    skillSlug: row.skillSlug,
    isUnlocked: row.isUnlocked,
    unlockedAt: row.unlockedAt ? row.unlockedAt.toISOString() : null,
    bestResult: row.bestResult,
    updatedAt: row.updatedAt.toISOString(),
  };
}

// GET /api/skills/state — все UserSkillState пользователя
export async function GET() {
  await ensureSeeded();
  const rows = await db.userSkillState.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(rows.map(mapRow));
}
