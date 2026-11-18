// Блок питания Calisthenics Power — TDEE калькулятор и макросы.
// Чистый TypeScript — без React/Next зависимостей.
// Все формулы — научно-обоснованные (Mifflin-St Jeor, ADA 2024).
// См. /docs/TZ.md (раздел про питание) и /knowledge/theory/nutrition.

// ====== Types ======

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryActive";

export type NutritionGoal =
  | "bulk"
  | "cut"
  | "recomp"
  | "endurance"
  | "maintain";

export interface TDEEResult {
  bmr: number; // базовый метаболизм (ккал/день в покое)
  tdee: number; // общий расход с учётом активности
  activityFactor: number; // множитель активности (1.2 .. 1.9)
  age: number | null; // возраст (годы), null если не удалось вычислить
}

export interface MacroResult {
  calories: number; // целевые ккал/день
  protein: number; // г белка
  fat: number; // г жиров
  carbs: number; // г углеводов
  proteinPerKg: number; // г/кг
  fatPerKg: number;
  carbsPerKg: number;
}

export interface MealPlan {
  meals: Array<{
    name: string;
    nameEn: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }>;
}

// ====== TDEE расчёт ======
// Mifflin-St Jeor формула (наиболее точная по ADA 2024):
// Мужчины:   BMR = 10 × weightKg + 6.25 × heightCm - 5 × age + 5
// Женщины:   BMR = 10 × weightKg + 6.25 × heightCm - 5 × age - 161
// TDEE = BMR × activityFactor

export function calcBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other",
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "female") {
    return Math.round(base - 161);
  }
  return Math.round(base + 5); // male и other
}

export function calcTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other",
  activity: ActivityLevel,
): TDEEResult {
  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2, // мало или нет физической активности
    light: 1.375, // 1-3 тренировки в неделю
    moderate: 1.55, // 3-5 тренировок
    active: 1.725, // 6-7 тренировок
    veryActive: 1.9, // 2x в день, тяжёлая работа
  };
  const bmr = calcBMR(weightKg, heightCm, age, gender);
  const activityFactor = activityFactors[activity];
  return {
    bmr,
    tdee: Math.round(bmr * activityFactor),
    activityFactor,
    age,
  };
}

// ====== Макросы ======
// Энергетическая плотность: белок 4 ккал/г, жир 9 ккал/г, углеводы 4 ккал/г.
// Углеводы = остаток от целевых ккал после вычета белков и жиров.

export function calcMacros(
  tdee: number,
  weightKg: number,
  goal: NutritionGoal,
): MacroResult {
  let calorieAdjustment = 0;
  let proteinPerKg = 2.0;
  let fatPerKg = 0.8;

  switch (goal) {
    case "bulk":
      calorieAdjustment = 350; // +350 ккал
      proteinPerKg = 1.8;
      fatPerKg = 1.0;
      break;
    case "cut":
      calorieAdjustment = -400; // -400 ккал
      proteinPerKg = 2.3; // больше белка для сохранения мышц
      fatPerKg = 0.8;
      break;
    case "recomp":
      calorieAdjustment = 0; // поддержание
      proteinPerKg = 2.2;
      fatPerKg = 0.9;
      break;
    case "endurance":
      calorieAdjustment = 200; // немного больше для выносливости
      proteinPerKg = 1.4;
      fatPerKg = 1.0;
      break;
    case "maintain":
    default:
      calorieAdjustment = 0;
      proteinPerKg = 1.6;
      fatPerKg = 0.8;
      break;
  }

  const calories = Math.round(tdee + calorieAdjustment);
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round(weightKg * fatPerKg);
  // Углеводы = остаток калорий (4 ккал/г белок, 9 ккал/г жир, 4 ккал/г углеводы)
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.max(
    0,
    Math.round((calories - proteinCalories - fatCalories) / 4),
  );
  const carbsPerKg = Number((carbs / weightKg).toFixed(1));

  return {
    calories,
    protein,
    fat,
    carbs,
    proteinPerKg,
    fatPerKg,
    carbsPerKg,
  };
}

// ====== Распределение по приёмам пищи (для 4 приёмов) ======
// Завтрак 25%, обед 35%, перекус 15%, ужин 25%.

export function distributeMacros(macros: MacroResult): MealPlan {
  const ratios = [0.25, 0.35, 0.15, 0.25];
  const names = [
    { ru: "Завтрак", en: "Breakfast" },
    { ru: "Обед", en: "Lunch" },
    { ru: "Перекус", en: "Snack" },
    { ru: "Ужин", en: "Dinner" },
  ];

  return {
    meals: ratios.map((ratio, i) => ({
      name: names[i].ru,
      nameEn: names[i].en,
      calories: Math.round(macros.calories * ratio),
      protein: Math.round(macros.protein * ratio),
      fat: Math.round(macros.fat * ratio),
      carbs: Math.round(macros.carbs * ratio),
    })),
  };
}

// ====== Возраст из birthDate ======
// Возвращает возраст в годах или null если birthDate невалидна.
export function calcAgeFromBirthDate(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 0 || age > 120) return null;
  return age;
}

// ====== Каталог целей питания — описания ======

export const NUTRITION_GOALS: Array<{
  id: NutritionGoal;
  nameRu: string;
  nameEn: string;
  descRu: string;
  descEn: string;
  calorieAdjustment: string;
  proteinRange: string;
}> = [
  {
    id: "bulk",
    nameRu: "Набор массы",
    nameEn: "Bulk",
    descRu:
      "Профицит калорий для роста мышечной массы. Требует силовых тренировок и достаточного белка.",
    descEn:
      "Caloric surplus for muscle growth. Requires strength training and adequate protein.",
    calorieAdjustment: "+200-500 ккал от TDEE",
    proteinRange: "1.6-2.2 г/кг",
  },
  {
    id: "cut",
    nameRu: "Сушка",
    nameEn: "Cut",
    descRu:
      "Дефицит калорий для жиросжигания с сохранением мышц. Высокий белок критичен.",
    descEn:
      "Caloric deficit for fat loss while preserving muscle. High protein is critical.",
    calorieAdjustment: "-300-500 ккал от TDEE",
    proteinRange: "2.0-2.5 г/кг",
  },
  {
    id: "recomp",
    nameRu: "Рекомпозиция",
    nameEn: "Recomp",
    descRu:
      "Поддержание калорий с одновременным жиро-сжиганием и ростом мышц. Лучше для новичков.",
    descEn:
      "Maintenance calories with simultaneous fat loss and muscle gain. Best for beginners.",
    calorieAdjustment: "±0 ккал (TDEE)",
    proteinRange: "2.0+ г/кг",
  },
  {
    id: "endurance",
    nameRu: "Выносливость",
    nameEn: "Endurance",
    descRu:
      "Больше углеводов для длительных тренировок. Белок снижен, жиры умеренные.",
    descEn:
      "More carbs for long training sessions. Protein lower, fats moderate.",
    calorieAdjustment: "+200 ккал от TDEE",
    proteinRange: "1.2-1.6 г/кг",
  },
  {
    id: "maintain",
    nameRu: "Поддержание",
    nameEn: "Maintain",
    descRu: "Базовое поддержание веса без изменений. Сбалансированные макросы.",
    descEn: "Basic weight maintenance. Balanced macros.",
    calorieAdjustment: "±0 ккал (TDEE)",
    proteinRange: "1.6 г/кг",
  },
];

// ====== Уровни активности — описания (для UI) ======

export const ACTIVITY_LEVELS: Array<{
  id: ActivityLevel;
  factor: number;
  descRu: string;
  descEn: string;
}> = [
  {
    id: "sedentary",
    factor: 1.2,
    descRu: "Мало или нет физической активности",
    descEn: "Little or no exercise",
  },
  {
    id: "light",
    factor: 1.375,
    descRu: "1-3 тренировки в неделю",
    descEn: "1-3 workouts per week",
  },
  {
    id: "moderate",
    factor: 1.55,
    descRu: "3-5 тренировок в неделю",
    descEn: "3-5 workouts per week",
  },
  {
    id: "active",
    factor: 1.725,
    descRu: "6-7 тренировок в неделю",
    descEn: "6-7 workouts per week",
  },
  {
    id: "veryActive",
    factor: 1.9,
    descRu: "2x в день, тяжёлая работа",
    descEn: "2x per day, heavy work",
  },
];
