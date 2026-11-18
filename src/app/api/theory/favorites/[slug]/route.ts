import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

// DELETE /api/theory/favorites/[slug] — remove one favorite by slug
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  try {
    await db.theoryFavorite.delete({ where: { slug } });
  } catch {
    // ignore not-found (idempotent delete)
  }
  return NextResponse.json({ slug, ok: true });
}
