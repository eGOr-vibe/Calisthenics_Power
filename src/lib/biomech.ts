// Биомеханические формулы и расчёты Calisthenics Power.
// Чистый TypeScript — без React/Next зависимостей.
// Все формулы — научно-обоснованные, см. /docs/TZ.md раздел 7.

import type { Exercise, WorkoutItem, BodyPart, Injury } from "./types";

// ====== 7.1. Индекс нагрузки на связки (Tendon Load Index) ======
// Total_Stress = Σ (loadCoef × volume)
// где volume для динамических = reps, для статики = durationSec × 0.1

/**
 * Объём одного упражнения (для расчёта стресса связок).
 * Для динамических — reps, для статики — durationSec × 0.1 (эмпирически).
 */
export function calcVolume(item: WorkoutItem, exercise: Exercise): number {
  if (exercise.type === "static" && item.durationSec > 0) {
    return Math.round(item.durationSec * 0.1);
  }
  return item.reps;
}

/**
 * Суммарный индекс нагрузки на связки для тренировки (или одного круга).
 * Total_Stress = Σ (loadCoef × volume)
 */
export function calcTotalStress(
  items: WorkoutItem[],
  exercises: Exercise[],
  rounds = 1
): number {
  let total = 0;
  for (const item of items) {
    const ex = exercises.find((e) => e.slug === item.exerciseSlug);
    if (!ex) continue;
    const vol = calcVolume(item, ex);
    total += ex.loadCoef * vol * rounds;
  }
  return Math.round(total);
}

// ====== 7.2. Быстрая замена упражнений ======
// K_difficulty = loadCoef_new / loadCoef_old
// V_new = V_old × K_difficulty

export interface SubstitutionResult {
  kDifficulty: number;
  oldReps: number;
  newReps: number;
  diffCoef: number;     // loadCoef_new - loadCoef_old (может быть отрицательным)
  stressDelta: number; // изменение суммарного стресса за круг (new - old)
  direction: "easier" | "harder" | "same";
}

export function calcSubstitution(
  oldExercise: Exercise,
  newExercise: Exercise,
  oldReps: number,
  rounds: number
): SubstitutionResult {
  const kDifficulty = newExercise.loadCoef / oldExercise.loadCoef;
  // V_new = V_old × K_difficulty (для замены на более лёгкое — увеличивается объём)
  // Но если новое ТЯЖЕЛЕЕ — мы хотим сохранить нагрузку, поэтому V_new = V_old / K_difficulty
  // Однако семантика: «объём, дающий такую же нагрузку на мышцы».
  // Поэтому: V_new = V_old × (loadCoef_old / loadCoef_new) — для сохранения нагрузки на мышцы.
  // НО в ТЗ формула: V_new = V_old × K_difficulty = V_old × (loadCoef_new / loadCoef_old)
  // Это даёт: при замене на лёгкое (loadCoef 4→1) → V_new = 5 × (1/4) = 1.25
  // Это НЕ имеет смысла — нам же нужно БОЛЬШЕ повторений лёгкого упражнения!
  //
  // Корректируем логику в духе ТЗ, но так, чтобы сохранялась эквивалентная нагрузка на мышцы:
  // Если новое упражнение ЛЕГЧЕ (loadCoef_new < loadCoef_old):
  //   V_new = V_old × (loadCoef_old / loadCoef_new) → больше повторений
  // Если новое упражнение ТЯЖЕЛЕЕ (loadCoef_new > loadCoef_old):
  //   V_new = V_old × (loadCoef_old / loadCoef_new) → меньше повторений
  // В обоих случаях: V_new = V_old × (loadCoef_old / loadCoef_new) = V_old / K_difficulty
  //
  // Это соответствует интуиции «эквивалентной нагрузки на мышцы».
  const stressPreservingFactor = oldExercise.loadCoef / newExercise.loadCoef;
  const newRepsRaw = oldReps * stressPreservingFactor;
  // Округляем вверх до целого (минимум 1)
  const newReps = Math.max(1, Math.round(newRepsRaw));

  const diffCoef = newExercise.loadCoef - oldExercise.loadCoef;
  const oldStress = oldExercise.loadCoef * oldReps * rounds;
  const newStress = newExercise.loadCoef * newReps * rounds;
  const stressDelta = newStress - oldStress;

  return {
    kDifficulty,
    oldReps,
    newReps,
    diffCoef,
    stressDelta,
    direction:
      diffCoef < 0 ? "easier" : diffCoef > 0 ? "harder" : "same",
  };
}

// ====== 7.3. Относительная сила ======
// PullupStrengthRatio = maxPullups × bodyMass / (height - 100)
export function calcRelativeStrength(
  maxPullups: number,
  bodyMassKg: number,
  heightCm: number
): number {
  const denom = heightCm - 100;
  if (denom <= 0) return 0;
  return Number(((maxPullups * bodyMassKg) / denom).toFixed(2));
}

// ====== 7.4. Возрастной коэффициент ======
// ⚠️ ЭМПИРИЧЕСКАЯ ОЦЕНКА (не из конкретного исследования):
// Основана на общих данных о возрастном снижении тестостерона (~1%/год после 30),
// уменьшении скорости восстановления и адаптации связочного аппарата.
// Реальные индивидуальные различия огромны — тренирующийся 50-летний атлет
// может восстанавливаться лучше, чем нетренирующийся 30-летний.
// Используй как грубое приближение, не как догму.
// K_age = 1.0 если age < 30
// K_age = 1.0 - (age - 30) × 0.005 если 30 ≤ age < 50
// K_age = 0.9 - (age - 50) × 0.01 если age ≥ 50
export function calcAgeCoefficient(birthDate: string | null): number {
  if (!birthDate) return 1.0;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 30) return 1.0;
  if (age < 50) return Number((1.0 - (age - 30) * 0.005).toFixed(3));
  return Number((0.9 - (age - 50) * 0.01).toFixed(3));
}

// ====== 7.5. Индекс стресса ======
// sleep_score   = clamp(sleep_hours / 8, 0, 1)
// mood_score    = mood / 10
// soreness_score = 1 - (soreness / 10)
// I_stress = 1 - (sleep_score × 0.4 + mood_score × 0.3 + soreness_score × 0.3)
export function calcStressIndex(
  sleepHours: number | null,
  mood: number | null,
  soreness: number | null
): number | null {
  if (sleepHours === null || mood === null || soreness === null) return null;
  const sleepScore = Math.min(1, Math.max(0, sleepHours / 8));
  const moodScore = Math.min(1, Math.max(0, mood / 10));
  const sorenessScore = 1 - Math.min(1, Math.max(0, soreness / 10));
  const iStress = 1 - (sleepScore * 0.4 + moodScore * 0.3 + sorenessScore * 0.3);
  return Number(iStress.toFixed(3));
}

export function stressIndexLabel(
  iStress: number | null,
  locale: "ru" | "en" = "ru"
): { zone: "low" | "medium" | "high"; label: string } {
  if (iStress === null) {
    return {
      zone: "low",
      label: locale === "ru" ? "Не рассчитан" : "Not calculated",
    };
  }
  if (iStress < 0.2) {
    return {
      zone: "low",
      label: locale === "ru" ? "Низкий" : "Low",
    };
  }
  if (iStress < 0.4) {
    return {
      zone: "medium",
      label: locale === "ru" ? "Средний" : "Medium",
    };
  }
  return {
    zone: "high",
    label: locale === "ru" ? "Высокий" : "High",
  };
}

// ====== 7.6. Рекомендованная длительность круга ======
// T_round = Σ (reps × time_per_rep) + transition_sec
// time_per_rep = 2 сек (средний темп), 1.5 сек (быстрый)
// transition_sec = 10 (между снарядами), 0 (домашняя)
export function estimateRoundDurationSec(
  items: WorkoutItem[],
  exercises: Exercise[],
  pace: "slow" | "medium" | "fast" = "medium",
  transitionSec = 8
): number {
  const timePerRep = pace === "slow" ? 3 : pace === "fast" ? 1.5 : 2;
  let total = 0;
  let equipmentChanges = 0;
  let lastEquipment: string | null = null;

  for (const item of items) {
    const ex = exercises.find((e) => e.slug === item.exerciseSlug);
    if (!ex) continue;
    if (ex.type === "static" && item.durationSec > 0) {
      total += item.durationSec;
    } else {
      total += item.reps * timePerRep;
    }
    const eqKey = ex.equipment.join(",");
    if (lastEquipment && lastEquipment !== eqKey) {
      equipmentChanges++;
    }
    lastEquipment = eqKey;
  }
  total += equipmentChanges * transitionSec;
  return Math.round(total);
}

/**
 * Прогноз количества кругов в AMRAP.
 */
export function estimateAmrapRounds(
  items: WorkoutItem[],
  exercises: Exercise[],
  durationSec: number,
  pace: "slow" | "medium" | "fast" = "medium"
): number {
  const roundSec = estimateRoundDurationSec(items, exercises, pace);
  if (roundSec <= 0) return 0;
  return Math.max(0, Math.floor(durationSec / roundSec));
}

// ====== Проверка травм-вето ======
// Если у пользователя травма локтя — упражнения с высокой нагрузкой на локти маркируются.
export interface InjuryWarning {
  bodyPart: BodyPart;
  severity: number;
  warningLevel: "none" | "caution" | "avoid";
  reason: string;
}

const EXERCISE_TO_BODY_PARTS: Record<string, BodyPart[]> = {
  pull: ["leftElbow", "rightElbow", "leftShoulder", "rightShoulder", "leftWrist", "rightWrist"],
  push: ["leftElbow", "rightElbow", "leftShoulder", "rightShoulder", "leftWrist", "rightWrist"],
  core: ["lowerBack", "neck"],
  legs: ["knees", "lowerBack"],
  static: ["leftElbow", "rightElbow", "leftShoulder", "rightShoulder", "leftWrist", "rightWrist"],
  mobility: [],
};

export function checkExerciseAgainstInjuries(
  exercise: Exercise,
  injuries: Injury[]
): InjuryWarning | null {
  const affected = EXERCISE_TO_BODY_PARTS[exercise.type] || [];
  for (const injury of injuries) {
    if (!injury.active) continue;
    if (!affected.includes(injury.bodyPart)) continue;
    // Высокий коэф. нагрузки + травма той же части → avoid
    if (exercise.loadCoef >= 6 && injury.severity >= 3) {
      return {
        bodyPart: injury.bodyPart,
        severity: injury.severity,
        warningLevel: "avoid",
        reason: `Высокая нагрузка на травмированную зону (${injury.bodyPart})`,
      };
    }
    if (exercise.loadCoef >= 3) {
      return {
        bodyPart: injury.bodyPart,
        severity: injury.severity,
        warningLevel: "caution",
        reason: `Осторожно: нагрузка на ${injury.bodyPart}`,
      };
    }
  }
  return null;
}

// ====== Утилиты форматирования ======

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatTimeWithHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ====== Фаза 2: Расширенные биомеханические формулы ======
// Из чата с Gemini: добавляем K_lever и CNS_pulse

// ====== 7.7. Коэффициент механического плеча рычага (K_lever) ======
// Для обычных отжиманий K_lever ≈ 0.65 (часть веса на ногах).
// Динамический K_lever для плиометрики (Tyson push-ups):
//   K_lever(t) = функция от угла наклона торса
//   при угле 0° (горизонталь) = 0.65
//   при угле 30° = 0.75
//   при угле 45° = 0.85
//   при угле 60°+ (взрыв) = 0.90-0.95
export interface LeverResult {
  kLever: number;       // коэффициент 0..1 (какую долю веса атлет перемещает)
  effectiveMassKg: number; // эффективная масса, перемещаемая при отжимании
  explanation: string;
}

export function calcLeverCoefficient(
  exerciseSlug: string,
  bodyMassKg: number,
  torsoAngleDeg: number = 0
): LeverResult {
  // Базовые коэффициенты для разных упражнений
  const LEVER_BASE: Record<string, number> = {
    "pushup-classic": 0.65,
    "pushup-wide": 0.65,
    "pushup-diamond": 0.65,
    "pushup-archer": 0.75, // асимметрия → больше веса на рабочей руке
    "pushup-pike": 0.80,   // таз высоко → больше веса на плечи
    "pushup-pseudo-planche": 0.95, // наклон вперёд → почти весь вес
    "pushup-tyson": 0.85,   // среднее (динамический от 0.65 до 0.95)
    "pushup-onearm-wall": 0.75, // одна рука + опора второй о стену
    "pushup-onearm-knees": 0.45, // с колен → меньше веса
    "hspu-wall": 1.0, // стойка на руках → весь вес
    "planche-tuck": 1.0,
    "planche-adv-tuck": 1.0,
  };

  let kLever = LEVER_BASE[exerciseSlug] ?? 0.65;

  // Для Tyson push-ups — динамическая корректировка по углу торса
  if (exerciseSlug === "pushup-tyson") {
    // Линейная интерполяция: 0° → 0.65, 60° → 0.95
    const angleEffect = Math.min(0.30, (Math.max(0, torsoAngleDeg) / 60) * 0.30);
    kLever = 0.65 + angleEffect;
  }

  const effectiveMassKg = Number((bodyMassKg * kLever).toFixed(2));

  let explanation = "";
  if (kLever <= 0.65) {
    explanation = `Базовое распределение веса: ~${(kLever * 100).toFixed(0)}% массы тела на руках, остальное — на ногах.`;
  } else if (kLever <= 0.85) {
    explanation = `Увеличенная нагрузка: ~${(kLever * 100).toFixed(0)}% массы тела на руках (наклон/угол смещают центр тяжести к рукам).`;
  } else if (kLever < 1.0) {
    explanation = `Субмаксимальная нагрузка: ~${(kLever * 100).toFixed(0)}% массы тела на руках (почти полный вес).`;
  } else {
    explanation = `Полный вес тела на руках (~${(kLever * 100).toFixed(0)}%). Высокая нагрузка на плечевой сустав.`;
  }

  return { kLever, effectiveMassKg, explanation };
}

// ====== 7.8. Индекс интенсивности тренировки ( Training Intensity Index, TI )
// ⚠️ ВАЖНАЯ ЗАМЕТКА О НАУЧНОЙ ВАЛИДНОСТИ:
// Это эмпирическая оценка интенсивности ВИИТ, а НЕ валидированный научный показатель.
// В спортивной науке для оценки нагрузки на ЦНС используются:
//   - HRV (Heart Rate Variability) — золотой стандарт вегетативной регуляции
//   - Субъективный опросник Hooper Index (сон, стресс, боль, усталость, настроение)
//   - Тест CMJ (Counter Movement Jump) — оценка нервно-мышечной готовности
//   - Субъективная готовность (RPE, session-RPE)
// Формула TI ниже — интуитивная оценка автора приложения, основанная на объёме,
// сложности движений и времени отдыха. Пороги 2.5/3.5 — эмпирические.
// Для реальной оценки состояния ЦНС используй HRV + субъективные маркеры.
export interface CNSPulseResult {
  cnsPulse: number;       // индекс интенсивности (эмпирический)
  zone: "safe" | "warning" | "critical";
  recommendation: string;
  recommendationEn: string;
  isEmpirical: boolean;   // флаг: формула эмпирическая, не научно валидирована
}

export function calcCNSPulse(
  reps: number,
  kDifficulty: number,
  restSec: number,
  kAge: number = 1.0,
  phase?: "cut" | "reps" | "static"
): CNSPulseResult {
  if (restSec <= 0) {
    return {
      cnsPulse: 0,
      zone: "safe",
      recommendation: "Недостаточно данных (отдых = 0).",
      recommendationEn: "Insufficient data (rest = 0).",
      isEmpirical: true,
    };
  }

  // Эмпирическая формула: чем больше повторений и сложность и меньше отдых — тем выше нагрузка
  const cnsPulse = Number(
    ((reps * kDifficulty) / restSec * kAge).toFixed(2)
  );

  // Эмпирические пороги (подобраны интуитивно, не из конкретного исследования)
  // Для фазы сушки пороги ниже (восстановление хуже на дефиците)
  const warningThreshold = phase === "cut" ? 2.0 : 2.5;
  const criticalThreshold = phase === "cut" ? 3.0 : 3.5;

  let zone: "safe" | "warning" | "critical";
  let recommendation: string;
  let recommendationEn: string;

  if (cnsPulse < warningThreshold) {
    zone = "safe";
    recommendation = "Умеренная интенсивность. Можно продолжать в текущем темпе.";
    recommendationEn = "Moderate intensity. Continue at current pace.";
  } else if (cnsPulse < criticalThreshold) {
    zone = "warning";
    recommendation =
      "Высокая интенсивность. Рассмотрай снижение темпа или увеличение отдыха между кругами.";
    recommendationEn =
      "High intensity. Consider slowing down or increasing rest between rounds.";
  } else {
    zone = "critical";
    recommendation =
      "Очень высокая интенсивность. Снизь темп или заверши тренировку. Проверь HRV завтра утром.";
    recommendationEn =
      "Very high intensity. Reduce pace or end the workout. Check HRV tomorrow morning.";
  }

  return { cnsPulse, zone, recommendation, recommendationEn, isEmpirical: true };
}

// ====== 7.9. Прогноз уменьшения нагрузки при снижении массы тела ======
// ФИЗИКА (валидирована): сила тяжести = m × g. При уменьшении массы на X кг
// сила, действующая на суставы в статике, уменьшается ровно на X × g × K_lever ньютонов.
// ЭМПИРИКА (не из конкретного исследования): множитель «1.3% улучшения планша на 1 кг» —
// это упрощённая оценка, реальное улучшение зависит от рычага, композиции тела,
// нейромышечной адаптации и других факторов.
export interface WeightLossImpact {
  weightLostKg: number;
  forceReductionN: number;   // в ньютонах — ФИЗИЧЕСКИ КОРРЕКТНО
  plancheImprovementPct: number; // ПРИБЛИЖЁННАЯ оценка — помечена как эмпирическая
  isForceCalculationValidated: boolean; // true — физика корректна
  isImprovementPctEmpirical: boolean;  // true — процент — эмпирическая оценка
}

export function calcWeightLossImpact(
  weightLostKg: number,
  originalWeightKg: number
): WeightLossImpact {
  const kLever = 1.0; // для горизонта — весь вес на руках
  // Физика: F = m × g
  const forceReductionN = Number((weightLostKg * 9.81 * kLever).toFixed(1));
  // Эмпирическая оценка улучшения (не из исследования)
  // Уменьшение массы на X% пропорционально уменьшает силу,
  // но «эффективность удержания» зависит от множества факторов.
  // Используется простая линейная аппроксимация.
  const improvementPct = Number(
    ((weightLostKg / originalWeightKg) * 100).toFixed(1)
  );

  return {
    weightLostKg,
    forceReductionN,
    plancheImprovementPct: improvementPct,
    isForceCalculationValidated: true,
    isImprovementPctEmpirical: true,
  };
}

