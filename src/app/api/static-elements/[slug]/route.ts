import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { StaticElement, ProgressionStep } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): StaticElement {
  return {
    id: row.id,
    slug: row.slug,
    nameRu: row.nameRu,
    nameEn: row.nameEn,
    descriptionRu: row.descriptionRu,
    descriptionEn: row.descriptionEn,
    icon: row.icon,
    steps: JSON.parse(row.steps) as ProgressionStep[],
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const row = await db.staticElement.findUnique({ where: { slug } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mapRow(row));
}
