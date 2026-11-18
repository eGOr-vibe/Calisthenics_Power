// Базовые типы данных Calisthenics Power.
// Этот файл НЕ зависит от React/Next — для будущего порта в нативное приложение.

// ====== Exercise types ======
export type ExerciseType = "pull" | "push" | "core" | "legs" | "static" | "mobility";
export type Equipment = "bar" | "dips" | "floor" | "parallettes" | "none" | "wall" | "rings" | "bands" | "weighted";
export type LevelBase = "beginner" | "intermediate" | "advanced";
export type Vector = "reps" | "static" | "cut";

// Compound-эффективность упражнения (минимум движений — максимум мышц)
export type CompoundType =
  | "full-body"      // всё тело: burpee, bear crawl
  | "upper-body"     // верх: pull-ups, push-ups
  | "lower-body"     // низ: squats, lunges
  | "core"           // кор: plank, hollow body
  | "cardio"         // кардио-фокус: jump rope (если добавим)
  | "isolation";     // изоляция (редко в калистенике)

// ====== Workout formats ======
export type WorkoutFormat = "amrap" | "emom" | "tabata" | "interval";

// ====== AI providers ======
export type AIProviderId = "zai" | "webllm" | "custom";

// ====== Locales ======
// (уже в i18n.ts, но для нативного порта полезно иметь тут)
export type Locale = "ru" | "en";

// ====== Body parts for injury matrix ======
export type BodyPart =
  | "leftElbow"
  | "rightElbow"
  | "leftShoulder"
  | "rightShoulder"
  | "leftWrist"
  | "rightWrist"
  | "lowerBack"
  | "neck"
  | "knees";

export type Gender = "male" | "female" | "other";

// ====== Technique categories ======
export type TechniqueCategory = "cns" | "mental" | "relax" | "warmup" | "cooldown";

// ====== Static element progressions (Phase 2) ======
export type StaticElementSlug =
  | "planche"
  | "front-lever"
  | "l-sit"
  | "handstand";

export interface ProgressionStep {
  order: number;            // 1, 2, 3... (1 = самый базовый)
  slug: string;             // slug упражнения из каталога, либо кастомный
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  // Тест-гейт: что нужно сделать, чтобы пройти на следующий уровень
  gateSec: number;          // секунд удержания с чистой техникой (по умолчанию 20)
  gateReps?: number;        // если динамическое — повторения
  gateNotesRu: string;      // что считать «чистой техникой»
  gateNotesEn: string;
  // Рекомендации по тренировке этого уровня
  trainingRu: string;
  trainingEn: string;
  // Подводящие/вспомогательные упражнения (slug'и из каталога)
  assistanceExercises: string[];
  // Источники
  sources?: string[];
}

export interface StaticElement {
  id: string;
  slug: StaticElementSlug;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  // SVG-иконка или emoji (для краткости в UI)
  icon: string;
  // Список шагов прогрессии (от базового к продвинутому)
  steps: ProgressionStep[];
}

// ====== User progression state (saved to DB) ======
export interface ProgressionState {
  id: string;
  elementSlug: StaticElementSlug;
  currentStep: number;       // 1-based, какой шаг сейчас активен
  bestHoldSec: number;       // лучшее удержание на текущем шаге
  bestHoldDate: string | null; // ISO дата
  passedSteps: number[];     // какие шаги уже пройдены (order)
  notes: string | null;
  updatedAt: string;
}

// ====== Core domain entities ======

export interface Exercise {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  howToRu: string;
  howToEn: string;
  type: ExerciseType;
  equipment: Equipment[];
  levelBase: LevelBase;
  levelSub: 1 | 2 | 3; // под-градация
  vectors: Vector[];
  loadCoef: number; // 1-9 — индекс нагрузки на связки
  targetMusclesRu: string[];
  targetMusclesEn: string[];
  illustrationUrl?: string | null;
  scienceRu?: string | null;
  scienceEn?: string | null;
  sources?: string[] | null;
  alternatives: string[]; // slug'и
  // Compound-эффективность (минимум движений — максимум мышц)
  compoundScore?: number | null;     // 1-10: сколько мышечных групп задействовано
  muscleGroupsCount?: number | null; // количество задействованных групп
  compoundType?: CompoundType | null; // FULL_BODY / UPPER_BODY / и т.д.
  isCompound?: boolean | null;       // true — «большое» compound-упражнение (score >= 7)
}

export interface Technique {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  category: TechniqueCategory;
  descriptionRu: string;
  descriptionEn: string;
  whenToApplyRu: string;
  whenToApplyEn: string;
  stepsRu: string[];
  stepsEn: string[];
  scienceRu?: string | null;
  scienceEn?: string | null;
  level: LevelBase;
  durationMin?: number | null;
}

export interface TheoryArticle {
  id: string;
  slug: string;
  category: string;
  titleRu: string;
  titleEn: string;
  contentRu: string;
  contentEn: string;
  sources?: string[] | null;
  order: number;
}

export interface AthleteProfile {
  id: string;
  name: string | null;
  birthDate: string | null; // ISO
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  armLengthCm: number | null;
  torsoLengthCm: number | null;
  legLengthCm: number | null;
  maxPullups: number | null;
  maxPushups: number | null;
  maxDips: number | null;
  maxSquats: number | null;
  maxPlankSec: number | null;
  primaryVector: Vector | null;
  lastSleepHours: number | null;
  lastMood: number | null;
  lastSoreness: number | null;
  lastStressIndex: number | null;
  lastStressUpdated: string | null;
  language: Locale;
  theme: "light" | "dark" | "system";
  ttsEnabled: boolean;
  voiceControl: boolean;
  showPresets: boolean;
  aiProvider: AIProviderId;
  aiCustomUrl: string | null;
  aiModel: string | null;
  // Phase 3: Menstrual cycle tracking (for female athletes)
  menstrualPhase?: "menstrual" | "follicular" | "ovulation" | "luteal" | null;
  menstrualCycleDay?: number | null;
  lastMenstrualDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Injury {
  id: string;
  bodyPart: BodyPart;
  type: string;
  severity: number; // 1-5
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ====== Workout item & templates ======

export interface WorkoutItem {
  exerciseSlug: string;
  reps: number;       // для динамических
  durationSec: number; // для статики (если 0 → используем reps)
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  format: WorkoutFormat;
  durationSec: number | null;    // для AMRAP
  rounds: number | null;          // для EMOM, интервалов
  restSec: number | null;          // отдых между раундами
  workSec: number | null;          // для Tabata/интервалов
  items: WorkoutItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SubstitutionRecord {
  fromSlug: string;
  toSlug: string;
  reason: string | null;
  diffCoef: number;   // K_difficulty
  oldReps: number;
  newReps: number;
  roundIndex: number;
}

export interface WorkoutSessionItem {
  exerciseSlug: string;
  reps: number;
  rounds: number;
  volume: number; // reps × rounds × loadCoef
}

export interface WorkoutSession {
  id: string;
  templateId: string | null;
  format: WorkoutFormat;
  startedAt: string;
  finishedAt: string | null;
  durationSec: number;
  totalRounds: number;
  totalReps: number;
  totalVolume: number;
  substitutions: SubstitutionRecord[];
  avgHr: number | null;
  maxHr: number | null;
  notes: string | null;
  feelingRating: number | null;
  items: WorkoutSessionItem[];
  // Phase 3: Diary — произвольные теги + источник записи (manual | csv | import)
  tags?: string[] | null;
  source?: "manual" | "csv" | "import" | null;
}

// ====== Chat ======
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

// ====== Skills tree (Phase 3) ======
export type SkillBranch =
  | "pull"      // Тяги (подтягивания, выходы)
  | "push"      // Жимы (отжимания, брусья, стойка)
  | "core"      // Кор (планки, L-сит, dragon flag)
  | "legs"      // Ноги (приседания, писталет)
  | "static"    // Статика (горизонт, передний вис, стойка на руках)
  | "explosive" // Взрыв (плиометрика, clapping, tyson)
  | "mobility"; // Мобильность (растяжка, локомоция)

export type SkillNodeType =
  | "foundational" // базовый (стартовый)
  | "main"         // основной навык
  | "passive"      // пассивка (открывается автоматически)
  | "elite"        // элитный (финальный)
  | "milestone";   // промежуточный milestone

export interface SkillNode {
  id: string;
  slug: string;              // уникальный slug
  exerciseSlug?: string;     // связь с существующим упражнением (опционально)
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  branch: SkillBranch;
  type: SkillNodeType;
  order: number;             // порядок в ветви (1 = стартовый)
  // Гейт для открытия
  gateSec?: number;          // для статики
  gateReps?: number;         // для динамики
  gateNotesRu?: string;
  gateNotesEn?: string;
  // Связи с другими узлами
  prerequisites: string[];    // slug'и узлов, которые нужно открыть ДО этого
  unlocksPassive?: string[]; // пассивки, открывающиеся автоматически с этим узлом
  // Визуальные координаты для графа (для рендеринга)
  x: number;                  // 0-100 (горизонтальная позиция в ветви)
  y: number;                  // 0-100 (вертикальная позиция)
  // Метаданные
  loadCoef: number;           // сложность 1-9
  isElite?: boolean;          // true для финальных узлов ветви
}

export interface UserSkillState {
  id: string;
  skillSlug: string;
  isUnlocked: boolean;
  unlockedAt: string | null; // ISO дата
  bestResult: string | null; // текстовое описание лучшего результата
  updatedAt: string;
}

// ====== Goals (Фаза 3) ======
export type GoalType = "element" | "reps" | "weight" | "habit" | "custom";
export type GoalStatus = "active" | "completed" | "paused" | "abandoned";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  type: GoalType;
  status: GoalStatus;
  // Target
  targetValue: number | null;      // e.g., 20 (reps) or 30 (sec hold)
  targetUnit: string | null;       // "reps", "sec", "kg", "times per week"
  currentValue: number;            // current progress
  // Timeline
  startDate: string;               // ISO
  targetDate: string | null;       // ISO deadline
  completedAt: string | null;      // ISO when completed
  // Links
  staticElementSlug?: string | null;  // if goal is a static element
  skillNodeSlug?: string | null;      // if goal is a skill node
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ====== Problem areas (Фаза 3) ======
export type ProblemCategory =
  | "fat-loss"
  | "strength"
  | "technique"
  | "pain"
  | "recovery";

export interface ProblemArea {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  category: ProblemCategory | string;  // "fat-loss" | "strength" | "technique" | "pain" | "recovery"
  causesRu: string[];
  causesEn: string[];
  solutionsRu: string[];
  solutionsEn: string[];
  recommendedExerciseSlugs: string[];  // exercises from catalog
  recommendedTechniqueSlugs: string[]; // techniques from library
  nutritionTipsRu: string | null;
  nutritionTipsEn: string | null;
  whenToSeeDoctorRu: string;
  whenToSeeDoctorEn: string;
  relatedInjuryBodyParts: string[];  // body parts that trigger this problem
}

// ====== Supplements (Фаза 3) ======
export type SupplementCategory =
  | "strength"     // Для силы/мощи
  | "recovery"     // Для восстановления
  | "joints"       // Для суставов
  | "energy"       // Для энергии/ЦНС
  | "sleep"        // Для сна
  | "vitamins";    // Витамины

export type SupplementEfficacy = "validated" | "mixed" | "ineffective";

export interface Supplement {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  category: SupplementCategory;
  descriptionRu: string;
  descriptionEn: string;
  // Дозировка
  dosageRu: string;
  dosageEn: string;
  timingRu: string;       // когда принимать
  timingEn: string;
  // Эффективность
  efficacy: SupplementEfficacy;
  efficacyNotesRu: string;
  efficacyNotesEn: string;
  // Безопасность
  sideEffectsRu: string;
  sideEffectsEn: string;
  contraindicationsRu: string;
  contraindicationsEn: string;
  // Источники
  sources: string[];
  // Поле для фильтрации по цели (какие цели тренировок подходят)
  recommendedForGoals: string[]; // ["bulk", "cut", "recomp", "endurance"]
}
