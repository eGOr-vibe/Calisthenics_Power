// AI чат-эндпоинт. Использует z-ai-web-dev-sdk (Z.AI cloud) — стандартный провайдер.
// Для WebLLM и кастомного URL — фронтенд обрабатывает напрямую (без этого эндпоинта).
//
// Сохранение истории чата выполняется фронтендом через /api/ai/messages.
// Этот эндпоинт только возвращает ответ от Z.AI.

import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import {
  SYSTEM_PROMPT_RU,
  SYSTEM_PROMPT_EN,
  buildProfileContext,
} from "@/lib/ai-prompts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  locale?: "ru" | "en";
  profile?: {
    name?: string | null;
    age?: number | null;
    weightKg?: number | null;
    heightCm?: number | null;
    primaryVector?: string | null;
    injuries?: Array<{ bodyPart: string; type: string }>;
  };
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body: ChatRequestBody = await request.json();

  // Загружаем профиль для контекста (если не передан в body)
  let profile = body.profile;
  if (!profile) {
    const profileRow = await db.athleteProfile.findUnique({
      where: { id: "default" },
    });
    if (profileRow) {
      const injuries = await db.injury.findMany({ where: { active: true } });
      let age: number | null = null;
      if (profileRow.birthDate) {
        const diff = Date.now() - profileRow.birthDate.getTime();
        age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      }
      profile = {
        name: profileRow.name,
        age,
        weightKg: profileRow.weightKg,
        heightCm: profileRow.heightCm,
        primaryVector: profileRow.primaryVector,
        injuries: injuries.map((i) => ({
          bodyPart: i.bodyPart.toLowerCase(),
          type: i.type,
        })),
      };
    }
  }

  const locale = body.locale ?? "ru";
  const systemPrompt = locale === "ru" ? SYSTEM_PROMPT_RU : SYSTEM_PROMPT_EN;

  // Дополняем системный промпт профилем (локализованные подписи)
  const profileContext = buildProfileContext(profile, locale);

  try {
    const zai = await ZAI.create();

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt + profileContext,
      },
      ...body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const result = await zai.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content =
      result.choices?.[0]?.message?.content ??
      result.choices?.[0]?.delta?.content ??
      "";

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      {
        error: "AI_ERROR",
        message: error?.message ?? "Unknown error",
        content:
          locale === "ru"
            ? "Извини, не удалось получить ответ. Проверь настройки AI-провайдера."
            : "Sorry, couldn't get a response. Check AI provider settings.",
      },
      { status: 500 }
    );
  }
}
