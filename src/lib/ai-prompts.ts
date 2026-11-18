// Системные промпты для AI-ассистента Calisthenics Power.
// Переиспользуются и серверным эндпоинтом (/api/ai/chat), и клиентскими
// провайдерами (Custom URL, WebLLM) — чтобы поведение было единым.

import type { AthleteProfile, Locale } from "./types";

export const SYSTEM_PROMPT_RU = `Ты — Calisthenics Power AI, ассистент по калистенике и воркауту.
Твоя задача — помогать атлету с тренировками, техникой, нагрузкой и восстановлением.

ПРИНЦИПЫ:
- Отвечай кратко и по делу, как опытный тренер-друг.
- Опирайся на научную базу: биомеханику, кинезиологию, физиологию.
- Учитывай профиль атлета (если он передан): возраст, вес, рост, травмы, цели.
- Давай конкретные рекомендации, а не общие фразы.
- Если вопрос вне темы калистеники — вежливо верни к теме.
- Не давай медицинских советов — при травмах рекомендуй обратиться к врачу.
- Используй русский язык, если пользователь пишет на русском.`;

export const SYSTEM_PROMPT_EN = `You are Calisthenics Power AI, an assistant for calisthenics and street workout.
Your job is to help the athlete with training, technique, load and recovery.

PRINCIPLES:
- Answer concisely and to the point, like an experienced coach-friend.
- Rely on science: biomechanics, kinesiology, physiology.
- Consider the athlete's profile (if provided): age, weight, height, injuries, goals.
- Give specific recommendations, not generic platitudes.
- If the question is off-topic, politely bring it back to calisthenics.
- Don't give medical advice — recommend seeing a doctor for injuries.
- Use English if the user writes in English.`;

// Минимальный интерфейс профиля, который умеет строить контекст.
// Не зависит от полной AthleteProfile, чтобы работать и на сервере, и на клиенте.
export interface ProfileContextInput {
  name?: string | null;
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  primaryVector?: string | null;
  injuries?: Array<{ bodyPart: string; type: string }> | null;
}

function vectorLabel(vector: string | null | undefined, locale: Locale): string | null {
  if (!vector) return null;
  const dict: Record<string, { ru: string; en: string }> = {
    reps: { ru: "Сила (повторения)", en: "Strength (reps)" },
    static: { ru: "Статика", en: "Statics" },
    cut: { ru: "Сушка", en: "Fat loss" },
  };
  return dict[vector]?.[locale] ?? vector;
}

// Строит локализованный блок «ПРОФИЛЬ АТЛЕТА» для системного промпта.
// Возвращает пустую строку, если профиль пустой.
export function buildProfileContext(
  profile: ProfileContextInput | null | undefined,
  locale: Locale
): string {
  if (!profile) return "";

  const parts: string[] = [];
  if (profile.name) {
    parts.push(
      locale === "ru" ? `Имя: ${profile.name}` : `Name: ${profile.name}`
    );
  }
  if (profile.age) {
    parts.push(
      locale === "ru" ? `Возраст: ${profile.age}` : `Age: ${profile.age}`
    );
  }
  if (profile.weightKg) {
    parts.push(
      locale === "ru"
        ? `Вес: ${profile.weightKg} кг`
        : `Weight: ${profile.weightKg} kg`
    );
  }
  if (profile.heightCm) {
    parts.push(
      locale === "ru"
        ? `Рост: ${profile.heightCm} см`
        : `Height: ${profile.heightCm} cm`
    );
  }
  const v = vectorLabel(profile.primaryVector, locale);
  if (v) {
    parts.push(
      locale === "ru" ? `Вектор развития: ${v}` : `Training vector: ${v}`
    );
  }
  if (profile.injuries && profile.injuries.length > 0) {
    const injuriesStr = profile.injuries
      .map((i) => `${i.bodyPart} (${i.type})`)
      .join(", ");
    parts.push(locale === "ru" ? `Травмы: ${injuriesStr}` : `Injuries: ${injuriesStr}`);
  }

  if (parts.length === 0) return "";
  const header = locale === "ru" ? "ПРОФИЛЬ АТЛЕТА" : "ATHLETE PROFILE";
  return `\n\n${header}:\n${parts.join("\n")}`;
}

// Готовый системный промпт для передачи в OpenAI-совместимые API.
export function buildSystemPrompt(
  locale: Locale,
  profile: ProfileContextInput | null | undefined
): string {
  const base = locale === "ru" ? SYSTEM_PROMPT_RU : SYSTEM_PROMPT_EN;
  return base + buildProfileContext(profile, locale);
}

// Преобразует AthleteProfile (с birthDate ISO) в контекст для промпта.
// Считает возраст из birthDate, если есть.
export function profileToContext(
  profile: Pick<
    AthleteProfile,
    | "name"
    | "birthDate"
    | "weightKg"
    | "heightCm"
    | "primaryVector"
  > & {
    injuries?: Array<{ bodyPart: string; type: string }> | null;
  },
  locale: Locale,
  injuries?: Array<{ bodyPart: string; type: string }> | null
): ProfileContextInput {
  let age: number | null = null;
  if (profile.birthDate) {
    const diff = Date.now() - new Date(profile.birthDate).getTime();
    age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }
  return {
    name: profile.name,
    age,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    primaryVector: profile.primaryVector,
    injuries: injuries ?? profile.injuries ?? null,
  };
}
