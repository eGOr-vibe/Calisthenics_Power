import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { WorkoutFormat, WorkoutItem, WorkoutTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    format: row.format.toLowerCase() as WorkoutFormat,
    durationSec: row.durationSec,
    rounds: row.rounds,
    restSec: row.restSec,
    workSec: row.workSec,
    items: JSON.parse(row.items) as WorkoutItem[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  await ensureSeeded();
  const rows = await db.workoutTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(rows.map(mapRow));
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json();
  const row = await db.workoutTemplate.create({
    data: {
      name: body.name,
      format: (body.format as string).toUpperCase(),
      durationSec: body.durationSec ?? null,
      rounds: body.rounds ?? null,
      restSec: body.restSec ?? null,
      workSec: body.workSec ?? null,
      items: JSON.stringify(body.items ?? []),
    },
  });
  return NextResponse.json(mapRow(row));
}
