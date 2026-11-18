// Менструальный цикл: расчёт фазы и влияния на тренировки.
// Чистый TypeScript — без React/Next зависимостей.
//
// ⚠️ ВАЖНО: эти данные — обобщённые научные наблюдения о гормональных
// колебаниях в течение цикла. Индивидуальные различия огромны.
// Это НЕ медицинский совет. При болезненных циклах или нарушениях
// (дисменорея, ПМДР, аменорея и т.д.) обратись к врачу.

export type MenstrualPhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal";

export interface MenstrualCycleInfo {
  phase: MenstrualPhase;
  /** День цикла: 1-28+ (рассчитывается от lastMenstrualDate) */
  cycleDay: number;
  /** Дней до предполагаемой следующей менструации */
  daysUntilNext: number;
  /** Коэффициент интенсивности 0.85-1.1 (для умножения на плановый объём) */
  trainingAdjustment: number;
  descriptionRu: string;
  descriptionEn: string;
  recommendationRu: string;
  recommendationEn: string;
  /** Флаг эмпиричности — формула основана на обобщённых данных, не строгая наука */
  isEmpirical: true;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Описания по фазам (RU/EN).
const PHASE_DESCRIPTIONS: Record<
  MenstrualPhase,
  {
    ru: string;
    en: string;
    recRu: string;
    recEn: string;
  }
> = {
  menstrual: {
    ru: "Менструальная фаза. Низкий эстроген и прогестерон. Возможны слабость и спазмы.",
    en: "Menstrual phase. Low estrogen and progesterone. Possible weakness and cramps.",
    recRu:
      "Снизь интенсивность на ~15%. Фокус на технике и мобильности. Силовые рекорды отложи.",
    recEn:
      "Reduce intensity by ~15%. Focus on technique and mobility. Postpone PR attempts.",
  },
  follicular: {
    ru: "Фолликулярная фаза. Растущий эстроген. Хорошее восстановление, рост силы.",
    en: "Follicular phase. Rising estrogen. Good recovery, strength gains.",
    recRu:
      "Отличное время для прогрессий. Можно увеличить объём на 10-15%.",
    recEn:
      "Great time for progressions. Can increase volume by 10-15%.",
  },
  ovulation: {
    ru: "Овуляция. Пик эстрогена. Максимальная сила и мощь.",
    en: "Ovulation. Estrogen peak. Maximum strength and power.",
    recRu:
      "Идеальное время для личных рекордов и сложных элементов.",
    recEn:
      "Ideal time for personal records and complex elements.",
  },
  luteal: {
    ru: "Лютеиновая фаза. Высокий прогестерон. Повышенная температура, выше утомляемость.",
    en: "Luteal phase. High progesterone. Elevated temperature, increased fatigue.",
    recRu:
      "Снизь интенсивность на ~10%. Больше отдых между подходами. Слушай тело.",
    recEn:
      "Reduce intensity by ~10%. More rest between sets. Listen to your body.",
  },
};

// Training adjustment по фазе (эмпирически).
// menstrual: -15%, follicular: норма, ovulation: +10%, luteal: -10%.
const PHASE_ADJUSTMENT: Record<MenstrualPhase, number> = {
  menstrual: 0.85,
  follicular: 1.0,
  ovulation: 1.1,
  luteal: 0.9,
};

/**
 * Рассчитывает текущую фазу менструального цикла на основе даты
 * начала последней менструации.
 *
 * @param lastMenstrualDate ISO-дата начала последней менструации
 * @param today Текущая дата (для тестов)
 * @returns MenstrualCycleInfo или null, если:
 *          - дата не указана
 *          - дата в будущем
 *          - прошло больше 35 дней (нужно обновить дату)
 */
export function calcMenstrualCycle(
  lastMenstrualDate: string | null,
  today: Date = new Date(),
): MenstrualCycleInfo | null {
  if (!lastMenstrualDate) return null;

  const last = new Date(lastMenstrualDate);
  if (Number.isNaN(last.getTime())) return null;

  const diffMs = today.getTime() - last.getTime();
  // cycleDay начинается с 1 в день начала менструации
  const cycleDay = Math.floor(diffMs / DAY_MS) + 1;

  if (cycleDay < 1) return null; // дата в будущем — игнор
  if (cycleDay > 35) return null; // слишком давно — нужен refresh

  let phase: MenstrualPhase;
  if (cycleDay <= 5) phase = "menstrual";
  else if (cycleDay <= 13) phase = "follicular";
  else if (cycleDay <= 16) phase = "ovulation";
  else phase = "luteal";

  const daysUntilNext = Math.max(0, 28 - cycleDay);
  const trainingAdjustment = PHASE_ADJUSTMENT[phase];
  const desc = PHASE_DESCRIPTIONS[phase];

  return {
    phase,
    cycleDay,
    daysUntilNext,
    trainingAdjustment,
    descriptionRu: desc.ru,
    descriptionEn: desc.en,
    recommendationRu: desc.recRu,
    recommendationEn: desc.recEn,
    isEmpirical: true,
  };
}
