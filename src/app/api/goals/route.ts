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

export async function GET() {
  await ensureSeeded();
  const rows = await db.goal.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(rows.map(mapRow));
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json();

  // Минимальная валидация
  if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const type = (body.type ?? "custom").toString().toUpperCase();
  const validTypes = ["ELEMENT", "REPS", "WEIGHT", "HABIT", "CUSTOM"];
  const finalType = validTypes.includes(type) ? type : "CUSTOM";

  const status = (body.status ?? "active").toString().toUpperCase();
  const validStatuses = ["ACTIVE", "COMPLETED", "PAUSED", "ABANDONED"];
  const finalStatus = validStatuses.includes(status) ? status : "ACTIVE";

  const targetValue =
    body.targetValue !== undefined && body.targetValue !== null
      ? Number(body.targetValue)
      : null;
  const targetUnit = body.targetUnit ?? null;
  const currentValue =
    body.currentValue !== undefined && body.currentValue !== null
      ? Number(body.currentValue)
      : 0;
  const targetDate = body.targetDate ? new Date(body.targetDate) : null;

  const row = await db.goal.create({
    data: {
      title: body.title.trim(),
      description: body.description ?? null,
      type: finalType,
      status: finalStatus,
      targetValue: Number.isFinite(targetValue) ? targetValue : null,
      targetUnit: typeof targetUnit === "string" ? targetUnit : null,
      currentValue: Number.isFinite(currentValue) ? currentValue : 0,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      targetDate: Number.isNaN(targetDate?.getTime() ?? NaN) ? null : targetDate,
      completedAt:
        finalStatus === "COMPLETED" ? body.completedAt ?? new Date() : null,
      staticElementSlug: body.staticElementSlug || null,
      skillNodeSlug: body.skillNodeSlug || null,
    },
  });
  return NextResponse.json(mapRow(row));
}
