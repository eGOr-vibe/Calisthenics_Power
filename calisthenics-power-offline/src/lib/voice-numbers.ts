/**
 * Voice numbers parser.
 *
 * Преобразует распознанную речь в число (1-50 / 1-100).
 * Поддерживает:
 *   - прямую запись цифрами: "5", "10"
 *   - числительные словами: "пять" / "five"
 *   - связки: "5 раз" / "five reps"
 *
 * Используется хуком use-voice-input.ts для распознавания количества повторений.
 */

import type { Locale } from "@/lib/i18n";

const NUMBER_WORDS_RU: Record<string, number> = {
  ноль: 0,
  один: 1,
  два: 2,
  три: 3,
  четыре: 4,
  пять: 5,
  шесть: 6,
  семь: 7,
  восемь: 8,
  девять: 9,
  десять: 10,
  одиннадцать: 11,
  двенадцать: 12,
  тринадцать: 13,
  четырнадцать: 14,
  пятнадцать: 15,
  шестнадцать: 16,
  семнадцать: 17,
  восемнадцать: 18,
  девятнадцать: 19,
  двадцать: 20,
  тридцать: 30,
  сорок: 40,
  пятьдесят: 50,
};

const NUMBER_WORDS_EN: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
};

const TEEN_COMPOSITES_RU: Record<string, number> = {
  // "двадцать пять" → собирается как 25; здесь обрабатываем сложения
};

const COMPOSITE_TENS_RU: Record<string, number> = {
  двадцать: 20,
  тридцать: 30,
  сорок: 40,
  пятьдесят: 50,
};

const COMPOSITE_TENS_EN: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
};

const UNITS_RU: Record<string, number> = {
  один: 1,
  два: 2,
  три: 3,
  четыре: 4,
  пять: 5,
  шесть: 6,
  семь: 7,
  восемь: 8,
  девять: 9,
};

const UNITS_EN: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

// Нормализуем строку: lower + trim + убираем двойные пробелы.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Парсит число из распознанной речи.
 *
 * @param text   — что сказал пользователь
 * @param locale — текущая локаль (определяет словарь числительных)
 * @returns      — число 0..100, либо null если распознать не удалось
 */
export function parseNumberFromSpeech(
  text: string,
  locale: Locale
): number | null {
  if (!text) return null;
  const lower = normalize(text);
  if (!lower) return null;

  // 1. Direct digit (например "5", "5 раз", "5 reps")
  //    Берём первую последовательность цифр.
  const digitMatch = lower.match(/\d+/);
  if (digitMatch) {
    const n = parseInt(digitMatch[0], 10);
    if (!isNaN(n) && n >= 0 && n <= 100) return n;
  }

  const dict = locale === "ru" ? NUMBER_WORDS_RU : NUMBER_WORDS_EN;
  const tensDict =
    locale === "ru" ? COMPOSITE_TENS_RU : COMPOSITE_TENS_EN;
  const unitsDict = locale === "ru" ? UNITS_RU : UNITS_EN;

  const words = lower.split(" ").filter(Boolean);

  // 2. Прямое совпадение одного слова ("пять", "twenty")
  if (words.length === 1) {
    const w = words[0]!;
    if (w in dict) return dict[w];
  }

  // 3. Композит: "двадцать пять" / "twenty five"
  if (words.length >= 2) {
    const first = words[0]!;
    const second = words[1]!;
    if (first in tensDict && second in unitsDict) {
      return tensDict[first]! + unitsDict[second]!;
    }
  }

  // 4. Fallback: ищем любое знакомое слово в фразе
  for (const w of words) {
    if (w in dict) return dict[w];
  }

  // 5. Никаких чисел не нашли
  void TEEN_COMPOSITES_RU; // зарезервировано для будущих форм
  return null;
}
