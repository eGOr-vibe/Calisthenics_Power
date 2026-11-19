// localStorage слой — заменяет API + Prisma для автономной версии.
// Все пользовательские данные хранятся в браузере.

import { EXERCISES } from "./data/exercises";
import { TECHNIQUES } from "./data/techniques";
import { THEORY_ARTICLES } from "./data/theory";
import { STATIC_ELEMENTS } from "./data/static-elements";
import { SUPPLEMENTS } from "./data/supplements";
import { PROBLEM_AREAS } from "./data/problem-areas";
import { COMPOUND_META, COMPOUND_ROUTINES } from "./data/compound-meta";
import { SKILL_NODES } from "./data/skills-tree";
import type {
  Exercise,
  Technique,
  TheoryArticle,
  StaticElement,
  Supplement,
  ProblemArea,
  AthleteProfile,
  Injury,
  Goal,
  WorkoutSession,
  PlannedWorkout,
  PainLog,
  SleepLog,
  WorkoutSpot,
  SkillNode,
  UserSkillState,
  ProgressionState,
} from "./types";

// ====== Helpers ======

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage write error:", e);
  }
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

// ====== Storage keys ======

const KEYS = {
  profile: "cp_profile",
  injuries: "cp_injuries",
  goals: "cp_goals",
  sessions: "cp_sessions",
  skillStates: "cp_skill_states",
  progressionStates: "cp_progression_states",
  theoryFavorites: "cp_theory_favorites",
  spots: "cp_spots",
  plannedWorkouts: "cp_planned_workouts",
  painLogs: "cp_pain_logs",
  sleepLogs: "cp_sleep_logs",
} as const;

// ====== Default profile ======

function defaultProfile(): AthleteProfile {
  const now = nowIso();
  return {
    id: genId(),
    name: null,
    birthDate: null,
    gender: null,
    heightCm: null,
    weightKg: null,
    armLengthCm: null,
    torsoLengthCm: null,
    legLengthCm: null,
    maxPullups: null,
    maxPushups: null,
    maxDips: null,
    maxSquats: null,
    maxPlankSec: null,
    primaryVector: null,
    lastSleepHours: null,
    lastMood: null,
    lastSoreness: null,
    lastStressIndex: null,
    lastStressUpdated: null,
    language: "ru",
    theme: "dark",
    ttsEnabled: true,
    voiceControl: false,
    showPresets: true,
    aiProvider: "zai",
    aiCustomUrl: null,
    aiModel: null,
    menstrualPhase: null,
    menstrualCycleDay: null,
    lastMenstrualDate: null,
    createdAt: now,
    updatedAt: now,
  };
}

// ====== Reference data (read-only, from code) ======

export function getExercises(): Exercise[] {
  return EXERCISES as Exercise[];
}

export function getExercise(slug: string): Exercise | undefined {
  const ex = EXERCISES.find((e) => e.slug === slug);
  if (!ex) return undefined;
  const alternatives = ex.alternatives
    .map((s) => EXERCISES.find((e) => e.slug === s))
    .filter(Boolean) as Exercise[];
  return { ...ex, alternatives };
}

export function getTechniques(category?: string): Technique[] {
  if (category && category !== "all") {
    return TECHNIQUES.filter((t) => t.category === category) as Technique[];
  }
  return TECHNIQUES as Technique[];
}

export function getTechnique(slug: string): Technique | undefined {
  return TECHNIQUES.find((t) => t.slug === slug) as Technique | undefined;
}

export function getTheory(): TheoryArticle[] {
  return THEORY_ARTICLES as TheoryArticle[];
}

export function getTheoryArticle(slug: string): TheoryArticle | undefined {
  return THEORY_ARTICLES.find((a) => a.slug === slug) as TheoryArticle | undefined;
}

export function getStaticElements(): StaticElement[] {
  return STATIC_ELEMENTS as StaticElement[];
}

export function getStaticElement(slug: string): StaticElement | undefined {
  return STATIC_ELEMENTS.find((s) => s.slug === slug) as StaticElement | undefined;
}

export function getSupplements(): Supplement[] {
  return SUPPLEMENTS as Supplement[];
}

export function getSupplement(slug: string): Supplement | undefined {
  return SUPPLEMENTS.find((s) => s.slug === slug) as Supplement | undefined;
}

export function getProblemAreas(): ProblemArea[] {
  return PROBLEM_AREAS as ProblemArea[];
}

export function getProblemArea(slug: string): ProblemArea | undefined {
  return PROBLEM_AREAS.find((p) => p.slug === slug) as ProblemArea | undefined;
}

export function getCompoundRoutines() {
  return COMPOUND_ROUTINES;
}

export function getCompoundExercises() {
  return COMPOUND_META;
}

export function getSkillNodes(): SkillNode[] {
  return SKILL_NODES as SkillNode[];
}

// ====== Profile (single record) ======

export function getProfile(): AthleteProfile {
  const stored = read<AthleteProfile | null>(KEYS.profile, null);
  if (!stored) {
    const def = defaultProfile();
    write(KEYS.profile, def);
    return def;
  }
  return stored;
}

export function saveProfile(patch: Partial<AthleteProfile>): AthleteProfile {
  const current = getProfile();
  const updated: AthleteProfile = {
    ...current,
    ...patch,
    id: current.id,
    updatedAt: nowIso(),
  };
  write(KEYS.profile, updated);
  return updated;
}

// ====== Injuries ======

export function getInjuries(): Injury[] {
  return read<Injury[]>(KEYS.injuries, []);
}

export function addInjury(data: Omit<Injury, "id" | "createdAt" | "updatedAt">): Injury {
  const list = getInjuries();
  const now = nowIso();
  const item: Injury = { ...data, id: genId(), createdAt: now, updatedAt: now };
  list.push(item);
  write(KEYS.injuries, list);
  return item;
}

export function deleteInjury(id: string): void {
  const list = getInjuries().filter((x) => x.id !== id);
  write(KEYS.injuries, list);
}

// ====== Goals ======

export function getGoals(): Goal[] {
  return read<Goal[]>(KEYS.goals, []);
}

export function addGoal(data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal {
  const list = getGoals();
  const now = nowIso();
  const item: Goal = { ...data, id: genId(), createdAt: now, updatedAt: now };
  list.push(item);
  write(KEYS.goals, list);
  return item;
}

export function updateGoal(id: string, patch: Partial<Goal>): void {
  const list = getGoals();
  const idx = list.findIndex((g) => g.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch, id, updatedAt: nowIso() };
  write(KEYS.goals, list);
}

export function deleteGoal(id: string): void {
  write(KEYS.goals, getGoals().filter((g) => g.id !== id));
}

// ====== Workout sessions ======

export function getSessions(): WorkoutSession[] {
  const list = read<WorkoutSession[]>(KEYS.sessions, []);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addSession(data: Omit<WorkoutSession, "id">): WorkoutSession {
  const list = read<WorkoutSession[]>(KEYS.sessions, []);
  const item: WorkoutSession = { ...data, id: genId() };
  list.push(item);
  write(KEYS.sessions, list);
  return item;
}

export function deleteSession(id: string): void {
  write(KEYS.sessions, getSessions().filter((s) => s.id !== id));
}

// ====== Skill states (user data) ======

export function getSkillStates(): UserSkillState[] {
  return read<UserSkillState[]>(KEYS.skillStates, []);
}

export function saveSkillState(
  skillSlug: string,
  patch: Partial<UserSkillState>,
): UserSkillState {
  const list = getSkillStates();
  const idx = list.findIndex((s) => s.skillSlug === skillSlug);
  const now = nowIso();
  if (idx === -1) {
    const item: UserSkillState = {
      id: genId(),
      skillSlug,
      isUnlocked: patch.isUnlocked ?? false,
      unlockedAt: patch.isUnlocked ? now : null,
      bestResult: patch.bestResult ?? null,
      updatedAt: now,
    };
    list.push(item);
    write(KEYS.skillStates, list);
    return item;
  }
  const current = list[idx];
  const updated: UserSkillState = {
    ...current,
    ...patch,
    id: current.id,
    skillSlug,
    updatedAt: now,
  };
  list[idx] = updated;
  write(KEYS.skillStates, list);
  return updated;
}

// ====== Progression states (user data) ======

export function getProgressionStates(): ProgressionState[] {
  return read<ProgressionState[]>(KEYS.progressionStates, []);
}

export function saveProgressionState(
  elementSlug: string,
  patch: Partial<ProgressionState>,
): ProgressionState {
  const list = getProgressionStates();
  const idx = list.findIndex((s) => s.elementSlug === elementSlug);
  const now = nowIso();
  if (idx === -1) {
    const item: ProgressionState = {
      id: genId(),
      elementSlug,
      currentStep: patch.currentStep ?? 1,
      bestHoldSec: patch.bestHoldSec ?? 0,
      bestHoldDate: patch.bestHoldDate ?? null,
      passedSteps: patch.passedSteps ?? [],
      notes: patch.notes ?? null,
      updatedAt: now,
    };
    list.push(item);
    write(KEYS.progressionStates, list);
    return item;
  }
  const current = list[idx];
  const updated: ProgressionState = {
    ...current,
    ...patch,
    id: current.id,
    elementSlug,
    updatedAt: now,
  };
  list[idx] = updated;
  write(KEYS.progressionStates, list);
  return updated;
}

// ====== Theory favorites ======

export function getTheoryFavorites(): string[] {
  return read<string[]>(KEYS.theoryFavorites, []);
}

export function toggleTheoryFavorite(slug: string): string[] {
  const list = getTheoryFavorites();
  const idx = list.indexOf(slug);
  if (idx === -1) {
    list.push(slug);
  } else {
    list.splice(idx, 1);
  }
  write(KEYS.theoryFavorites, list);
  return list;
}

// ====== Workout spots ======

export function getSpots(): WorkoutSpot[] {
  return read<WorkoutSpot[]>(KEYS.spots, []);
}

export function addSpot(data: Omit<WorkoutSpot, "id" | "createdAt" | "updatedAt">): WorkoutSpot {
  const list = getSpots();
  const now = nowIso();
  const item: WorkoutSpot = { ...data, id: genId(), createdAt: now, updatedAt: now };
  list.push(item);
  write(KEYS.spots, list);
  return item;
}

export function deleteSpot(id: string): void {
  write(KEYS.spots, getSpots().filter((s) => s.id !== id));
}

// ====== Planned workouts (calendar) ======

export function getPlannedWorkouts(): PlannedWorkout[] {
  const list = read<PlannedWorkout[]>(KEYS.plannedWorkouts, []);
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export function addPlannedWorkout(
  data: Omit<PlannedWorkout, "id" | "createdAt" | "updatedAt">,
): PlannedWorkout {
  const list = read<PlannedWorkout[]>(KEYS.plannedWorkouts, []);
  const now = nowIso();
  const item: PlannedWorkout = { ...data, id: genId(), createdAt: now, updatedAt: now };
  list.push(item);
  write(KEYS.plannedWorkouts, list);
  return item;
}

export function updatePlannedWorkout(id: string, patch: Partial<PlannedWorkout>): void {
  const list = read<PlannedWorkout[]>(KEYS.plannedWorkouts, []);
  const idx = list.findIndex((w) => w.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch, id, updatedAt: nowIso() };
  write(KEYS.plannedWorkouts, list);
}

export function deletePlannedWorkout(id: string): void {
  write(KEYS.plannedWorkouts, getPlannedWorkouts().filter((w) => w.id !== id));
}

// ====== Pain logs ======

export function getPainLogs(): PainLog[] {
  const list = read<PainLog[]>(KEYS.painLogs, []);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addPainLog(data: Omit<PainLog, "id" | "createdAt">): PainLog {
  const list = read<PainLog[]>(KEYS.painLogs, []);
  const now = nowIso();
  const item: PainLog = { ...data, id: genId(), createdAt: now };
  list.push(item);
  write(KEYS.painLogs, list);
  return item;
}

export function deletePainLog(id: string): void {
  write(KEYS.painLogs, getPainLogs().filter((p) => p.id !== id));
}

// ====== Sleep logs ======

export function getSleepLogs(): SleepLog[] {
  const list = read<SleepLog[]>(KEYS.sleepLogs, []);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addSleepLog(data: Omit<SleepLog, "id" | "createdAt">): SleepLog {
  const list = read<SleepLog[]>(KEYS.sleepLogs, []);
  const now = nowIso();
  const item: SleepLog = { ...data, id: genId(), createdAt: now };
  list.push(item);
  write(KEYS.sleepLogs, list);
  return item;
}

export function deleteSleepLog(id: string): void {
  write(KEYS.sleepLogs, getSleepLogs().filter((s) => s.id !== id));
}

// ====== Export / Import (backup) ======

export function exportAllData(): { [key: string]: unknown } {
  return {
    profile: getProfile(),
    injuries: getInjuries(),
    goals: getGoals(),
    sessions: getSessions(),
    spots: getSpots(),
    plannedWorkouts: getPlannedWorkouts(),
    painLogs: getPainLogs(),
    sleepLogs: getSleepLogs(),
    skillStates: getSkillStates(),
    progressionStates: getProgressionStates(),
    theoryFavorites: getTheoryFavorites(),
  };
}

export function importAllData(data: { [key: string]: unknown }): void {
  const mapping: Array<[string, string]> = [
    ["profile", KEYS.profile],
    ["injuries", KEYS.injuries],
    ["goals", KEYS.goals],
    ["sessions", KEYS.sessions],
    ["spots", KEYS.spots],
    ["plannedWorkouts", KEYS.plannedWorkouts],
    ["painLogs", KEYS.painLogs],
    ["sleepLogs", KEYS.sleepLogs],
    ["skillStates", KEYS.skillStates],
    ["progressionStates", KEYS.progressionStates],
    ["theoryFavorites", KEYS.theoryFavorites],
  ];
  for (const [dataKey, storageKey] of mapping) {
    if (data[dataKey] !== undefined && data[dataKey] !== null) {
      write(storageKey, data[dataKey]);
    }
  }
}
