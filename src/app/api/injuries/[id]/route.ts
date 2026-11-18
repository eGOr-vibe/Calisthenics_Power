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
  const row = await db.injury.update({
    where: { id },
    data: {
      ...(body.bodyPart && { bodyPart: body.bodyPart.toUpperCase() }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.severity !== undefined && { severity: body.severity }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.active !== undefined && { active: body.active }),
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
  await db.injury.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
