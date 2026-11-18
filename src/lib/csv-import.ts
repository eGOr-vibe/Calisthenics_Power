// CSV импорт тренировок из внешних источников (бумажный журнал, Excel, Google Sheets).
// Phase 3: Diary — перенос истории тренировок из CSV-файла.

export type CSVFormat = "AMRAP" | "EMOM" | "TABATA" | "INTERVAL";

export const CSV_VALID_FORMATS: CSVFormat[] = [
  "AMRAP",
  "EMOM",
  "TABATA",
  "INTERVAL",
];

export interface CSVRow {
  date: string; // YYYY-MM-DD
  format: string; // AMRAP | EMOM | TABATA | INTERVAL
  duration_min?: number; // длительность в минутах
  rounds?: number;
  reps?: number;
  volume?: number;
  notes?: string;
  tags?: string; // разделённые ; или ,
  feeling?: number; // 1-10
}

export interface CSVImportError {
  row: number;
  error: string;
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  errors: CSVImportError[];
  preview: CSVRow[];
}

const NUMBER_FIELDS = ["duration_min", "rounds", "reps", "volume", "feeling"];

/**
 * Минимальный CSV-парсер с поддержкой кавычек и запятыми внутри значений.
 * Разделитель полей — запятая. Кавычки — двойные.
 */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        // Двойная кавычка внутри строки
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

/**
 * Парсит CSV текст в массив строк.
 * Первая строка — заголовки (приводятся к нижнему регистру).
 * Пустые строки пропускаются.
 */
export function parseCSV(text: string): CSVRow[] {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];
  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return []; // нет данных, только заголовок

  const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase());
  const knownHeaders = new Set([
    "date",
    "format",
    "duration_min",
    "rounds",
    "reps",
    "volume",
    "notes",
    "tags",
    "feeling",
  ]);

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row: Record<string, string | number | undefined> = {};
    headers.forEach((header, idx) => {
      if (!knownHeaders.has(header)) return;
      const value = values[idx] ?? "";
      if (NUMBER_FIELDS.includes(header)) {
        row[header] = value ? Number(value) : undefined;
      } else {
        row[header] = value;
      }
    });
    rows.push(row as unknown as CSVRow);
  }
  return rows;
}

/**
 * Валидация одной CSV-строки.
 * Возвращает текст ошибки или null если строка валидна.
 */
export function validateCSVRow(row: CSVRow, rowNum: number): string | null {
  if (!row.date) {
    return `Row ${rowNum}: missing date`;
  }
  if (!row.format) {
    return `Row ${rowNum}: missing format`;
  }
  if (!CSV_VALID_FORMATS.includes(row.format.toUpperCase() as CSVFormat)) {
    return `Row ${rowNum}: unknown format "${row.format}"`;
  }
  // Проверка даты (YYYY-MM-DD или ISO)
  const date = new Date(row.date);
  if (Number.isNaN(date.getTime())) {
    return `Row ${rowNum}: invalid date "${row.date}" (expected YYYY-MM-DD)`;
  }
  // Числовые поля — если заданы, должны быть числами
  if (row.duration_min !== undefined && Number.isNaN(row.duration_min)) {
    return `Row ${rowNum}: duration_min must be a number`;
  }
  if (row.rounds !== undefined && Number.isNaN(row.rounds)) {
    return `Row ${rowNum}: rounds must be a number`;
  }
  if (row.reps !== undefined && Number.isNaN(row.reps)) {
    return `Row ${rowNum}: reps must be a number`;
  }
  if (row.volume !== undefined && Number.isNaN(row.volume)) {
    return `Row ${rowNum}: volume must be a number`;
  }
  if (row.feeling !== undefined && Number.isNaN(row.feeling)) {
    return `Row ${rowNum}: feeling must be a number`;
  }
  if (
    row.feeling !== undefined &&
    (row.feeling < 1 || row.feeling > 10)
  ) {
    return `Row ${rowNum}: feeling must be 1-10`;
  }
  return null;
}

/**
 * Разбивает строку тегов на массив. Разделители — точка с запятой или запятая.
 */
export function parseTags(tags: string | undefined | null): string[] {
  if (!tags) return [];
  return tags
    .split(/[;,]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Генерирует CSV-шаблон (строка) с примерами для скачивания пользователем.
 */
export function generateCSVTemplate(): string {
  return `date,format,duration_min,rounds,reps,volume,notes,tags,feeling
2024-01-15,AMRAP,30,20,150,500,Хорошая тренировка на свежем воздухе,heavy;outdoor,8
2024-01-17,EMOM,20,15,100,300,Лёгкая восстановительная,light;recovery,7
2024-01-20,Tabata,4,8,80,200,Классическая табата,classic,6`;
}
