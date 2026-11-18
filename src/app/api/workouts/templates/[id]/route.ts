import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeeded();
  const { id } = await params;
  const body = await request.json();
  const row = await db.workoutTemplate.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.format && { format: body.format.toUpperCase() }),
      ...(body.durationSec !== undefined && { durationSec: body.durationSec }),
      ...(body.rounds !== undefined && { rounds: body.rounds }),
      ...(body.restSec !== undefined && { restSec: body.restSec }),
      ...(body.workSec !== undefined && { workSec: body.workSec }),
      ...(body.items !== undefined && { items: JSON.stringify(body.items) }),
    },
  });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeeded();
  const { id } = await params;
  await db.workoutTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
