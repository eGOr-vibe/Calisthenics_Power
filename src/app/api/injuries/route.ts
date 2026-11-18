import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { BodyPart, Injury } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): Injury {
  return {
    id: row.id,
    bodyPart: row.bodyPart.toLowerCase() as BodyPart,
    type: row.type,
    severity: row.severity,
    notes: row.notes,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  await ensureSeeded();
  const rows = await db.injury.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map(mapRow));
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json();
  const row = await db.injury.create({
    data: {
      bodyPart: body.bodyPart.toUpperCase(),
      type: body.type,
      severity: body.severity ?? 3,
      notes: body.notes ?? null,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(mapRow(row));
}
