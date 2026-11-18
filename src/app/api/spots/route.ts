import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 100);

  const rows = await db.workoutSpot.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  );
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json();

  const row = await db.workoutSpot.create({
    data: {
      name: body.name ?? "Новая площадка",
      description: body.description ?? null,
      lat: Number(body.lat) || 0,
      lng: Number(body.lng) || 0,
      address: body.address ?? null,
      hasBar: body.hasBar ?? false,
      hasDips: body.hasDips ?? false,
      hasParallettes: body.hasParallettes ?? false,
      hasRings: body.hasRings ?? false,
      hasWall: body.hasWall ?? false,
      rating: Math.max(1, Math.min(5, Number(body.rating) || 3)),
      createdBy: body.createdBy ?? null,
    },
  });

  return NextResponse.json({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
