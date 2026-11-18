// API для истории чата с ИИ.
// GET  /api/ai/messages?limit=100 — последние сообщения (старые → новые).
// POST /api/ai/messages           — сохранить одно сообщение.
// DELETE /api/ai/messages         — удалить ВСЕ сообщения.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

interface SavedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

function mapRow(row: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}): SavedMessage {
  const normalized = row.role.toLowerCase();
  return {
    id: row.id,
    role: normalized === "assistant" ? "assistant" : "user",
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "100", 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 100;

  // Берём последние N (desc), затем переворачиваем в хронологическом порядке.
  const rows = await db.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  const chronological = rows.reverse().map(mapRow);
  return NextResponse.json(chronological);
}

interface PostBody {
  role?: "user" | "assistant";
  content?: string;
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as PostBody;

  const role = body.role;
  const content = (body.content ?? "").trim();

  if (role !== "user" && role !== "assistant") {
    return NextResponse.json(
      { error: "INVALID_ROLE" },
      { status: 400 },
    );
  }
  if (!content) {
    return NextResponse.json(
      { error: "EMPTY_CONTENT" },
      { status: 400 },
    );
  }

  const row = await db.chatMessage.create({
    data: {
      role: role === "assistant" ? "ASSISTANT" : "USER",
      content,
    },
  });
  return NextResponse.json(mapRow(row));
}

export async function DELETE() {
  await ensureSeeded();
  await db.chatMessage.deleteMany({});
  return NextResponse.json({ ok: true });
}
