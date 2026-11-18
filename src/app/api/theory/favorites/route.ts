import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

// GET /api/theory/favorites — list of favorited slugs
export async function GET() {
  await ensureSeeded();
  const rows = await db.theoryFavorite.findMany({
    orderBy: { createdAt: "desc" },
    select: { slug: true },
  });
  return NextResponse.json(rows.map((r) => r.slug));
}

// POST /api/theory/favorites — body: { slug: string } — add to favorites
export async function POST(request: Request) {
  await ensureSeeded();
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  // upsert — slug is unique
  const row = await db.theoryFavorite.upsert({
    where: { slug },
    update: {},
    create: { slug },
  });
  return NextResponse.json({ slug: row.slug, ok: true });
}

// DELETE /api/theory/favorites — remove all favorites (optional helper)
export async function DELETE() {
  await ensureSeeded();
  await db.theoryFavorite.deleteMany({});
  return NextResponse.json({ ok: true });
}
