import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  const rows = await db.painLog.findMany({
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

  const row = await db.painLog.create({
    data: {
      bodyPart: body.bodyPart ?? "",  // храним как есть (camelCase — используется как i18n key)
      intensity: Math.max(1, Math.min(10, Number(body.intensity) || 5)),
      type: body.type ?? null,
      notes: body.notes ?? null,
      relatedSessionId: body.relatedSessionId ?? null,
      date: body.date ? new Date(body.date) : new Date(),
    },
  });

  return NextResponse.json({
    ...row,
    date: row.date.toISOString(),
    createdAt: row.createdAt.toISOString(),
  });
}
