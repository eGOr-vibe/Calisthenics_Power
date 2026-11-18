import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { Goal, GoalStatus, GoalType } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type.toLowerCase() as GoalType,
    status: row.status.toLowerCase() as GoalStatus,
    targetValue: row.targetValue,
    targetUnit: row.targetUnit,
    currentValue: row.currentValue,
    startDate: row.startDate.toISOString(),
    targetDate: row.targetDate ? row.targetDate.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    staticElementSlug: row.staticElementSlug ?? null,
    skillNodeSlug: row.skillNodeSlug ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  const row = await db.goal.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mapRow(row));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.description !== undefined)
    data.description = body.description === null ? null : String(body.description);
  if (body.type !== undefined) {
    const t = String(body.type).toUpperCase();
    if (["ELEMENT", "REPS", "WEIGHT", "HABIT", "CUSTOM"].includes(t)) data.type = t;
  }
  if (body.status !== undefined) {
    const s = String(body.status).toUpperCase();
    if (["ACTIVE", "COMPLETED", "PAUSED", "ABANDONED"].includes(s)) {
      data.status = s;
      if (s === "COMPLETED" && body.completedAt === undefined) {
        data.completedAt = new Date();
      }
      if (s !== "COMPLETED") {
        data.completedAt = null;
      }
    }
  }
  if (body.targetValue !== undefined) {
    const n = body.targetValue === null ? null : Number(body.targetValue);
    data.targetValue = n !== null && Number.isFinite(n) ? n : null;
  }
  if (body.targetUnit !== undefined) {
    data.targetUnit =
      body.targetUnit === null ? null : String(body.targetUnit);
  }
  if (body.currentValue !== undefined) {
    const n = Number(body.currentValue);
    data.currentValue = Number.isFinite(n) ? n : 0;
  }
  if (body.targetDate !== undefined) {
    data.targetDate =
      body.targetDate === null ? null : new Date(body.targetDate);
  }
  if (body.completedAt !== undefined) {
    data.completedAt =
      body.completedAt === null ? null : new Date(body.completedAt);
  }
  if (body.staticElementSlug !== undefined) {
    data.staticElementSlug = body.staticElementSlug || null;
  }
  if (body.skillNodeSlug !== undefined) {
    data.skillNodeSlug = body.skillNodeSlug || null;
  }
  if (body.startDate !== undefined) {
    data.startDate = new Date(body.startDate);
  }

  try {
    const row = await db.goal.update({ where: { id }, data });
    return NextResponse.json(mapRow(row));
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  await db.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
