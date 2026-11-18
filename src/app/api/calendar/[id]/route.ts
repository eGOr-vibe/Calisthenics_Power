import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  const body = await request.json();

  const data: any = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.format !== undefined) data.format = body.format.toUpperCase();
  if (body.durationMin !== undefined) data.durationMin = Number(body.durationMin);
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.completed !== undefined) data.completed = body.completed;
  if (body.date !== undefined) data.date = new Date(body.date);

  const row = await db.plannedWorkout.update({ where: { id }, data });

  return NextResponse.json({
    ...row,
    date: row.date.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  await db.plannedWorkout.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
