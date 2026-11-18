// Compound-метаданные упражнений.
// «Минимум упражнений — Максимум мышц»: оценка того, сколько мышечных групп
// задействует каждое упражнение. Используется для подбора эффективных
// минимальных программ тренировок.
//
// Compound score (1-10):
//   1-3   — изоляция или малая группа (планка, скручивания)
//   4-6   — multi-joint, несколько групп (подтягивания, отжимания)
//   7-8   — compound (L-сит, dragon flag)
//   9-10  — full-body (burpee, muscle-up, bear crawl)
//
// Compound type:
//   FULL_BODY  — задействует верх+низ+кор+кардио
//   UPPER_BODY — преимущественно верх
//   LOWER_BODY — преимущественно низ
//   CORE       — кор-доминантное
//   CARDIO     — кардио-доминантное
//   ISOLATION  — изоляция (редко в калистенике)

import type { CompoundType } from "@/lib/types";

export interface CompoundMeta {
  slug: string;
  compoundScore: number;        // 1-10
  muscleGroupsCount: number;    // количество задействованных мышечных групп
  compoundType: CompoundType;
  isCompound: boolean;          // score >= 7
}

export const COMPOUND_META: CompoundMeta[] = [
  // ====== FULL-BODY (score 8-10) — топ compound ======
  { slug: "burpee", compoundScore: 10, muscleGroupsCount: 8, compoundType: "full-body", isCompound: true },
  { slug: "bear-crawl", compoundScore: 8, muscleGroupsCount: 7, compoundType: "full-body", isCompound: true },
  { slug: "crab-walk", compoundScore: 7, muscleGroupsCount: 6, compoundType: "full-body", isCompound: true },

  // ====== UPPER-BODY compound (score 7-9) ======
  { slug: "muscle-up", compoundScore: 9, muscleGroupsCount: 7, compoundType: "upper-body", isCompound: true },
  { slug: "pullup-lsit", compoundScore: 8, muscleGroupsCount: 6, compoundType: "upper-body", isCompound: true },
  { slug: "pullup-gironda", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "pullup-gironda-hold", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "hspu-wall", compoundScore: 7, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: true },
  { slug: "pushup-tyson", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "pushup-pseudo-planche", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "typewriter-pullup", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "skin-the-cat", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "elbow-lever", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },

  // ====== CORE compound (score 7-9) ======
  { slug: "dragon-flag", compoundScore: 9, muscleGroupsCount: 6, compoundType: "core", isCompound: true },
  { slug: "hanging-leg-raise", compoundScore: 7, muscleGroupsCount: 4, compoundType: "core", isCompound: true },
  { slug: "lsit-floor", compoundScore: 7, muscleGroupsCount: 5, compoundType: "core", isCompound: true },
  { slug: "lsit-parallettes", compoundScore: 7, muscleGroupsCount: 5, compoundType: "core", isCompound: true },

  // ====== UPPER multi-joint (score 4-6) ======
  { slug: "pullup-classic", compoundScore: 6, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pullup-wide", compoundScore: 5, muscleGroupsCount: 3, compoundType: "upper-body", isCompound: false },
  { slug: "pullup-chin", compoundScore: 5, muscleGroupsCount: 3, compoundType: "upper-body", isCompound: false },
  { slug: "pullup-archer", compoundScore: 6, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pullup-australian", compoundScore: 5, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pullup-onearm-neg", compoundScore: 6, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-classic", compoundScore: 5, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-wide", compoundScore: 4, muscleGroupsCount: 3, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-diamond", compoundScore: 4, muscleGroupsCount: 3, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-archer", compoundScore: 5, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-pike", compoundScore: 5, muscleGroupsCount: 3, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-hindu", compoundScore: 6, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-onearm-wall", compoundScore: 6, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-onearm-knees", compoundScore: 5, muscleGroupsCount: 3, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-sphinx", compoundScore: 6, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-tiger-bend", compoundScore: 6, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "pushup-clapping", compoundScore: 6, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "dips-classic", compoundScore: 5, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },
  { slug: "dips-chest", compoundScore: 5, muscleGroupsCount: 3, compoundType: "upper-body", isCompound: false },
  { slug: "dips-triceps", compoundScore: 4, muscleGroupsCount: 2, compoundType: "upper-body", isCompound: false },
  { slug: "handstand-wall", compoundScore: 5, muscleGroupsCount: 4, compoundType: "upper-body", isCompound: false },

  // ====== LOWER multi-joint (score 4-6) ======
  { slug: "squat", compoundScore: 4, muscleGroupsCount: 3, compoundType: "lower-body", isCompound: false },
  { slug: "squat-sumo", compoundScore: 4, muscleGroupsCount: 4, compoundType: "lower-body", isCompound: false },
  { slug: "lunge", compoundScore: 5, muscleGroupsCount: 3, compoundType: "lower-body", isCompound: false },
  { slug: "split-squat", compoundScore: 5, muscleGroupsCount: 3, compoundType: "lower-body", isCompound: false },
  { slug: "jump-squat", compoundScore: 6, muscleGroupsCount: 4, compoundType: "lower-body", isCompound: false },
  { slug: "sissy-squat", compoundScore: 4, muscleGroupsCount: 2, compoundType: "lower-body", isCompound: false },
  { slug: "pistol-assisted", compoundScore: 6, muscleGroupsCount: 4, compoundType: "lower-body", isCompound: false },

  // ====== CORE (score 1-6) ======
  { slug: "situp", compoundScore: 2, muscleGroupsCount: 1, compoundType: "core", isCompound: false },
  { slug: "crunch", compoundScore: 1, muscleGroupsCount: 1, compoundType: "core", isCompound: false },
  { slug: "leg-raise", compoundScore: 3, muscleGroupsCount: 2, compoundType: "core", isCompound: false },
  { slug: "bicycle-crunch", compoundScore: 3, muscleGroupsCount: 2, compoundType: "core", isCompound: false },
  { slug: "plank", compoundScore: 2, muscleGroupsCount: 2, compoundType: "core", isCompound: false },
  { slug: "plank-side", compoundScore: 3, muscleGroupsCount: 2, compoundType: "core", isCompound: false },
  { slug: "hollow-hold", compoundScore: 5, muscleGroupsCount: 4, compoundType: "core", isCompound: false },

  // ====== STATIC elements (score 5-8) ======
  { slug: "planche-tuck", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "planche-adv-tuck", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "front-lever-tuck", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "front-lever-adv-tuck", compoundScore: 7, muscleGroupsCount: 5, compoundType: "upper-body", isCompound: true },
  { slug: "front-lever-full", compoundScore: 8, muscleGroupsCount: 6, compoundType: "upper-body", isCompound: true },

  // ====== MOBILITY (score 1-2) ======
  { slug: "cat-cow", compoundScore: 2, muscleGroupsCount: 2, compoundType: "isolation", isCompound: false },
  { slug: "downward-dog", compoundScore: 3, muscleGroupsCount: 3, compoundType: "isolation", isCompound: false },
  { slug: "chest-opener", compoundScore: 1, muscleGroupsCount: 2, compoundType: "isolation", isCompound: false },
  { slug: "shoulder-circles", compoundScore: 1, muscleGroupsCount: 1, compoundType: "isolation", isCompound: false },
  { slug: "wrist-stretch", compoundScore: 1, muscleGroupsCount: 1, compoundType: "isolation", isCompound: false },
];

// ====== Минимальные эффективные программы ======
// Кураторские подборки «минимум движений — максимум результата».
// Каждая программа покрывает всё тело за 3-5 упражнений.

export interface CompoundRoutine {
  slug: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  // Цель программы
  goal: "strength" | "hypertrophy" | "fat-loss" | "mobility" | "athletic";
  // Уровень
  level: "beginner" | "intermediate" | "advanced";
  // Длительность (мин)
  durationMin: number;
  // Количество упражнений
  exercisesCount: number;
  // Slug'и упражнений (в порядке выполнения)
  exerciseSlugs: string[];
  // Покрытие мышечных групп (количество задействованных групп)
  totalMuscleGroups: number;
  // Преимущества
  benefitsRu: string[];
  benefitsEn: string[];
}

export const COMPOUND_ROUTINES: CompoundRoutine[] = [
  {
    slug: "minimal-full-body-strength",
    nameRu: "Минимальная программа на всё тело",
    nameEn: "Minimal full-body strength",
    descriptionRu:
      "5 упражнений, прорабатывающих всё тело за ~30 минут. Идеальна для занятых людей: 3 раза в неделю даёт заметный прогресс.",
    descriptionEn:
      "5 exercises covering the whole body in ~30 minutes. Ideal for busy people: 3 times per week yields noticeable progress.",
    goal: "strength",
    level: "intermediate",
    durationMin: 30,
    exercisesCount: 5,
    exerciseSlugs: [
      "pullup-classic",      // тяга верха
      "pushup-classic",      // жим верха
      "squat",               // ноги
      "hanging-leg-raise",   // кор
      "burpee",              // кардио + взрыв + всё тело
    ],
    totalMuscleGroups: 18,
    benefitsRu: [
      "Покрывает все основные мышечные группы",
      "Можно делать где угодно — без оборудования",
      "30 минут × 3 раза в неделю = базовая сила",
    ],
    benefitsEn: [
      "Covers all major muscle groups",
      "Can be done anywhere — no equipment",
      "30 min × 3 times per week = baseline strength",
    ],
  },
  {
    slug: "legendary-athletes",
    nameRu: "Легендарные упражнения великих атлетов",
    nameEn: "Legendary athletes' exercises",
    descriptionRu:
      "4 упражнения, которые делали легендарные атлеты: Жиронда, Тайсон, Брюс Ли, гимнасты. Каждое прорабатывает много мышц сразу.",
    descriptionEn:
      "4 exercises done by legendary athletes: Gironda, Tyson, Bruce Lee, gymnasts. Each engages many muscles at once.",
    goal: "athletic",
    level: "advanced",
    durationMin: 40,
    exercisesCount: 4,
    exerciseSlugs: [
      "pullup-gironda",       // Винс Жиронда — широчайшие, ромбовидные, брахиалис
      "pushup-tyson",         // Майк Тайсон — взрыв, плечи, кор
      "dragon-flag",          // Брюс Ли — кор, стабилизаторы
      "muscle-up",            // гимнасты — переход тяга-жим
    ],
    totalMuscleGroups: 22,
    benefitsRu: [
      "Каждое упражнение — историческое и эффективное",
      "Развивает силу, мощность, кор и координацию",
      "Тренирует «читерские» мышечные группы (брахиалис, зубчатая)",
    ],
    benefitsEn: [
      "Each exercise is historically significant and effective",
      "Develops strength, power, core and coordination",
      "Trains 'cheat' muscle groups (brachialis, serratus)",
    ],
  },
  {
    slug: "minimal-fat-loss",
    nameRu: "Минимальная ВИИТ для жиросжигания",
    nameEn: "Minimal HIIT for fat loss",
    descriptionRu:
      "4 упражнения × 20 сек работа / 10 сек отдых × 4 круга. Заменяет кардио на 20 минут. Burpee — главное оружие.",
    descriptionEn:
      "4 exercises × 20 sec work / 10 sec rest × 4 rounds. Replaces cardio in 20 minutes. Burpee is the main weapon.",
    goal: "fat-loss",
    level: "intermediate",
    durationMin: 20,
    exercisesCount: 4,
    exerciseSlugs: [
      "burpee",              // full-body кардио
      "jump-squat",          // взрыв ног
      "pushup-clapping",     // взрыв верха
      "plank",               // кор статика
    ],
    totalMuscleGroups: 15,
    benefitsRu: [
      "20 минут заменяет часовое кардио (EPOC-эффект)",
      "Поддерживает мышечную массу при жиросжигании",
      "Не требует оборудования — делай где угодно",
    ],
    benefitsEn: [
      "20 minutes replaces an hour of cardio (EPOC effect)",
      "Preserves muscle mass during fat loss",
      "No equipment needed — do anywhere",
    ],
  },
  {
    slug: "static-elements-foundation",
    nameRu: "Фундамент для статических элементов",
    nameEn: "Static elements foundation",
    descriptionRu:
      "5 подводящих упражнений к горизонту, переднему вису, L-ситу и стойке. База для будущих гимнастических элементов.",
    descriptionEn:
      "5 progression exercises toward planche, front lever, L-sit and handstand. Foundation for future gymnastic elements.",
    goal: "strength",
    level: "intermediate",
    durationMin: 35,
    exercisesCount: 5,
    exerciseSlugs: [
      "pullup-gironda-hold",     // передний вис — пиковое сокращение
      "pushup-pseudo-planche",   // горизонт — плечи + кор
      "lsit-floor",              // L-сит — кор + трицепс
      "handstand-wall",          // стойка — плечи + баланс
      "hollow-hold",             // кор для всех элементов
    ],
    totalMuscleGroups: 20,
    benefitsRu: [
      "Готовит к изучению 4 элементов параллельно",
      "Каждое упражнение compound (задаёт много мышц сразу)",
      "Сильный кор = фундамент для всех статик",
    ],
    benefitsEn: [
      "Prepares for learning 4 elements in parallel",
      "Each exercise is compound (engages many muscles)",
      "Strong core = foundation for all statics",
    ],
  },
  {
    slug: "office-break",
    nameRu: "Офисная разминка (3 минуты)",
    nameEn: "Office break (3 minutes)",
    descriptionRu:
      "3 упражнения, которые можно сделать в офисе за 3 минуты. Разгоняет кровь, снимает stiffness от сидения.",
    descriptionEn:
      "3 exercises you can do in the office in 3 minutes. Boosts circulation, relieves sitting stiffness.",
    goal: "mobility",
    level: "beginner",
    durationMin: 3,
    exercisesCount: 3,
    exerciseSlugs: [
      "cat-cow",            // спина
      "chest-opener",       // грудь (от компьютера)
      "shoulder-circles",   // плечи
    ],
    totalMuscleGroups: 6,
    benefitsRu: [
      "Снимает напряжение от сидения",
      "Не требует места и одежды",
      "3 минуты — но реально помогает",
    ],
    benefitsEn: [
      "Relieves sitting tension",
      "Needs no space or special clothing",
      "3 minutes — but really helps",
    ],
  },
];
