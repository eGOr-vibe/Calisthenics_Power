import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { UserSkillState } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): UserSkillState {
  return {
    id: row.id,
    skillSlug: row.skillSlug,
    isUnlocked: row.isUnlocked,
    unlockedAt: row.unlockedAt ? row.unlockedAt.toISOString() : null,
    bestResult: row.bestResult,
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Узнать, какие пассивки открываются автоматически при разблокировке узла.
// Возвращает массив slug'ов пассивок, которые должны быть автоматически открыты.
async function collectAutoUnlockPassives(
  skillSlug: string,
): Promise<string[]> {
  const node = await db.skillNode.findUnique({ where: { slug: skillSlug } });
  if (!node) return [];
  const passivesRaw = node.unlocksPassive;
  if (!passivesRaw) return [];
  try {
    return JSON.parse(passivesRaw) as string[];
  } catch {
    return [];
  }
}

// PUT /api/skills/state/[slug]
// Body: { isUnlocked?: boolean, bestResult?: string }
// Принудительно обновляет состояние навыка. Если isUnlocked=true —
// автоматически разблокирует все связанные пассивки.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));

  const existing = await db.userSkillState.findUnique({
    where: { skillSlug: slug },
  });

  const isUnlocked =
    typeof body.isUnlocked === "boolean" ? body.isUnlocked : existing?.isUnlocked ?? false;

  const bestResult =
    typeof body.bestResult === "string"
      ? body.bestResult
      : body.bestResult === null
        ? null
        : existing?.bestResult ?? null;

  // Если узел переходит из заблокированного в открытый — устанавливаем unlockedAt.
  const wasUnlocked = existing?.isUnlocked ?? false;
  const unlockedAt =
    isUnlocked && !wasUnlocked
      ? new Date()
      : !isUnlocked
        ? null
        : existing?.unlockedAt ?? null;

  const row = await db.userSkillState.upsert({
    where: { skillSlug: slug },
    update: {
      isUnlocked,
      unlockedAt,
      bestResult,
    },
    create: {
      skillSlug: slug,
      isUnlocked,
      unlockedAt,
      bestResult,
    },
  });

  // Если только что разблокирован — автоматически открываем все пассивки.
  if (isUnlocked && !wasUnlocked) {
    const passiveSlugs = await collectAutoUnlockPassives(slug);
    for (const pslug of passiveSlugs) {
      const pexisting = await db.userSkillState.findUnique({
        where: { skillSlug: pslug },
      });
      if (!pexisting?.isUnlocked) {
        await db.userSkillState.upsert({
          where: { skillSlug: pslug },
          update: {
            isUnlocked: true,
            unlockedAt: new Date(),
          },
          create: {
            skillSlug: pslug,
            isUnlocked: true,
            unlockedAt: new Date(),
          },
        });
      }
    }
  }

  return NextResponse.json(mapRow(row));
}

// POST /api/skills/state/[slug]
// Body: { result: string, value?: number }
// Записывает попытку. Если result-текстовое описание — сохраняется как bestResult
// (если лучше предыдущего). Опциональное value (число секунд или повторений)
// сравнивается с гейтом узла (gateSec/gateReps) и автоматически разблокирует
// узел при превышении. Возвращает обновлённое состояние + флаг newlyUnlocked.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));

  const node = await db.skillNode.findUnique({ where: { slug } });
  if (!node) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const resultText =
    typeof body.result === "string" ? body.result.trim() : "";

  // value — опциональное числовое значение для проверки против гейта.
  let value: number | undefined;
  if (typeof body.value === "number" && Number.isFinite(body.value)) {
    value = Math.max(0, body.value);
  } else if (typeof body.value === "string") {
    const parsed = parseFloat(body.value);
    if (Number.isFinite(parsed)) value = Math.max(0, parsed);
  }

  // Проверка прохождения гейта.
  let gatePassed = false;
  if (typeof value === "number") {
    if (node.gateSec && node.gateSec > 0 && value >= node.gateSec) {
      gatePassed = true;
    }
    if (node.gateReps && node.gateReps > 0 && value >= node.gateReps) {
      gatePassed = true;
    }
  }

  const existing = await db.userSkillState.findUnique({
    where: { skillSlug: slug },
  });

  const wasUnlocked = existing?.isUnlocked ?? false;
  const newlyUnlocked = gatePassed && !wasUnlocked;
  const isUnlocked = wasUnlocked || gatePassed;
  const unlockedAt =
    isUnlocked && !wasUnlocked
      ? new Date()
      : !isUnlocked
        ? null
        : existing?.unlockedAt ?? null;

  // bestResult — сохраняем, если новое значение передано (текст).
  const bestResult =
    resultText !== ""
      ? resultText
      : existing?.bestResult ?? null;

  const row = await db.userSkillState.upsert({
    where: { skillSlug: slug },
    update: {
      isUnlocked,
      unlockedAt,
      bestResult,
    },
    create: {
      skillSlug: slug,
      isUnlocked,
      unlockedAt,
      bestResult,
    },
  });

  // Если только что разблокирован — автоматически открываем пассивки.
  if (newlyUnlocked) {
    const passivesRaw = node.unlocksPassive;
    if (passivesRaw) {
      try {
        const passiveSlugs = JSON.parse(passivesRaw) as string[];
        for (const pslug of passiveSlugs) {
          const pexisting = await db.userSkillState.findUnique({
            where: { skillSlug: pslug },
          });
          if (!pexisting?.isUnlocked) {
            await db.userSkillState.upsert({
              where: { skillSlug: pslug },
              update: {
                isUnlocked: true,
                unlockedAt: new Date(),
              },
              create: {
                skillSlug: pslug,
                isUnlocked: true,
                unlockedAt: new Date(),
              },
            });
          }
        }
      } catch {
        // ignore JSON parse errors for unlocksPassive
      }
    }
  }

  return NextResponse.json({
    ...mapRow(row),
    newlyUnlocked,
    gatePassed,
  });
}
