import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  const limit = Number(searchParams.get("limit") ?? 100);

  let where: any = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    where.date = { gte: start, lt: end };
  }

  const rows = await db.plannedWorkout.findMany({
    where,
    orderBy: { date: "asc" },
    take: limit,
  });

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      date: r.date.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  );
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json();

  const row = await db.plannedWorkout.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      title: body.title ?? "Тренировка",
      format: (body.format ?? "AMRAP").toUpperCase(),
      durationMin: Number(body.durationMin) || 30,
      notes: body.notes ?? null,
      completed: body.completed ?? false,
    },
  });

  return NextResponse.json({
    ...row,
    date: row.date.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
