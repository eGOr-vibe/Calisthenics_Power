import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 30);

  const rows = await db.sleepLog.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      date: r.date.toISOString(),
      createdAt: r.createdAt.toISOString(),
    })),
  );
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json();

  const row = await db.sleepLog.create({
    data: {
      sleepHours: Math.max(0, Math.min(12, Number(body.sleepHours) || 7)),
      sleepQuality: Math.max(1, Math.min(10, Number(body.sleepQuality) || 5)),
      hrv: body.hrv ? Number(body.hrv) : null,
      rhr: body.rhr ? Number(body.rhr) : null,
      bedTime: body.bedTime ?? null,
      wakeTime: body.wakeTime ?? null,
      notes: body.notes ?? null,
      date: body.date ? new Date(body.date) : new Date(),
    },
  });

  return NextResponse.json({
    ...row,
    date: row.date.toISOString(),
    createdAt: row.createdAt.toISOString(),
  });
}
