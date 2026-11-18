import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { TheoryArticle } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): TheoryArticle {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    titleRu: row.titleRu,
    titleEn: row.titleEn,
    contentRu: row.contentRu,
    contentEn: row.contentEn,
    sources: row.sources ? JSON.parse(row.sources) : null,
    order: row.order,
  };
}

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  const rows = await db.theoryArticle.findMany({
    orderBy: { order: "asc" },
  });
  let parsed = rows.map(mapRow);
  if (q) {
    parsed = parsed.filter(
      (a) =>
        a.titleRu.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.contentRu.toLowerCase().includes(q) ||
        a.contentEn.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }
  return NextResponse.json(parsed);
}
