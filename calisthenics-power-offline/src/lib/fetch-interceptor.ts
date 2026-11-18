// Fetch interceptor for offline mode.
// Перехватывает все fetch("/api/...") вызовы и направляет их в local-storage.ts.
// Это позволяет скопированным страницам работать БЕЗ изменений.

import {
  getProfile, saveProfile,
  getInjuries, addInjury, deleteInjury,
  getGoals, addGoal, updateGoal, deleteGoal,
  getSessions, addSession, deleteSession,
  getExercises, getExercise,
  getTechniques, getTechnique,
  getTheory, getTheoryArticle,
  getStaticElements, getStaticElement,
  getSupplements, getSupplement,
  getProblemAreas, getProblemArea,
  getCompoundRoutines, getCompoundExercises,
  getSkillNodes, getSkillStates, saveSkillState,
  getProgressionStates, saveProgressionState,
  getTheoryFavorites, toggleTheoryFavorite,
  getSpots, addSpot, deleteSpot,
  getPlannedWorkouts, addPlannedWorkout, updatePlannedWorkout, deletePlannedWorkout,
  getPainLogs, addPainLog, deletePainLog,
  getSleepLogs, addSleepLog, deleteSleepLog,
  exportAllData, importAllData,
} from "./local-storage";

let installed = false;

export function installFetchInterceptor() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(init.body as string) : {};

    // Route /api/ calls to localStorage
    if (url.startsWith("/api/")) {
      const result = handleApiCall(url, method, body);
      if (result !== undefined) {
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Fall through to original fetch for non-API calls
    return originalFetch(input as any, init);
  };
}

function handleApiCall(url: string, method: string, body: any): any {
  const [path, queryString] = url.split("?");
  const params = new URLSearchParams(queryString || "");

  // Profile
  if (path === "/api/profile") {
    if (method === "GET") return getProfile();
    if (method === "PUT") return saveProfile(body);
  }

  // Injuries
  if (path === "/api/injuries") {
    if (method === "GET") return getInjuries();
    if (method === "POST") return addInjury(body);
  }
  if (path.startsWith("/api/injuries/")) {
    const id = path.split("/")[3];
    if (method === "DELETE") { deleteInjury(id); return { ok: true }; }
  }

  // Exercises
  if (path === "/api/exercises") {
    const type = params.get("type");
    const equipment = params.get("equipment");
    const level = params.get("level");
    const vector = params.get("vector");
    const q = params.get("q");
    let result = getExercises();
    if (type && type !== "all") result = result.filter(e => e.type === type);
    if (equipment && equipment !== "all") result = result.filter(e => e.equipment.includes(equipment as any));
    if (level && level !== "all") result = result.filter(e => e.levelBase === level);
    if (vector && vector !== "all") result = result.filter(e => e.vectors.includes(vector as any));
    if (q) {
      const ql = q.toLowerCase();
      result = result.filter(e =>
        e.nameRu.toLowerCase().includes(ql) ||
        e.nameEn.toLowerCase().includes(ql) ||
        e.targetMusclesRu.some(m => m.toLowerCase().includes(ql)) ||
        e.targetMusclesEn.some(m => m.toLowerCase().includes(ql))
      );
    }
    return result;
  }
  if (path.startsWith("/api/exercises/")) {
    const slug = path.split("/")[3];
    const ex = getExercise(slug);
    if (!ex) return { error: "Not found" };
    return ex;
  }

  // Techniques
  if (path === "/api/techniques") {
    const category = params.get("category");
    return getTechniques(category || undefined);
  }
  if (path.startsWith("/api/techniques/")) {
    const slug = path.split("/")[3];
    const tech = getTechnique(slug);
    if (!tech) return { error: "Not found" };
    return tech;
  }

  // Theory
  if (path === "/api/theory") {
    const q = params.get("q");
    let result = getTheory();
    if (q) {
      result = result.filter(a =>
        a.titleRu.toLowerCase().includes(q.toLowerCase()) ||
        a.titleEn.toLowerCase().includes(q.toLowerCase()) ||
        a.contentRu.toLowerCase().includes(q.toLowerCase()) ||
        a.contentEn.toLowerCase().includes(q.toLowerCase())
      );
    }
    return result;
  }
  if (path.startsWith("/api/theory/")) {
    if (path.includes("/favorites")) {
      if (path.includes("/favorites/")) {
        const slug = path.split("/")[5];
        if (method === "DELETE") { toggleTheoryFavorite(slug); return { ok: true }; }
      }
      if (method === "GET") return getTheoryFavorites();
      if (method === "POST") { toggleTheoryFavorite(body.slug); return { ok: true }; }
    }
    const slug = path.split("/")[3];
    const article = getTheoryArticle(slug);
    if (!article) return { error: "Not found" };
    return article;
  }

  // Static elements
  if (path === "/api/static-elements") {
    return getStaticElements();
  }
  if (path.startsWith("/api/static-elements/")) {
    const slug = path.split("/")[3];
    const el = getStaticElement(slug);
    if (!el) return { error: "Not found" };
    return el;
  }

  // Progression
  if (path.startsWith("/api/progression/")) {
    const slug = path.split("/")[3];
    if (method === "GET") {
      const states = getProgressionStates();
      return states.find(s => s.elementSlug === slug) || {
        id: "default", elementSlug: slug, currentStep: 1, bestHoldSec: 0,
        bestHoldDate: null, passedSteps: [], notes: null, updatedAt: new Date(0).toISOString(),
      };
    }
    if (method === "PUT") return saveProgressionState({ elementSlug: slug, ...body });
  }

  // Supplements
  if (path === "/api/supplements") {
    const category = params.get("category");
    return getSupplements(category || undefined);
  }
  if (path.startsWith("/api/supplements/")) {
    const slug = path.split("/")[3];
    const sup = getSupplement(slug);
    if (!sup) return { error: "Not found" };
    return sup;
  }

  // Problems
  if (path === "/api/problems") {
    return getProblemAreas();
  }
  if (path.startsWith("/api/problems/")) {
    const slug = path.split("/")[3];
    const problem = getProblemArea(slug);
    if (!problem) return { error: "Not found" };
    return problem;
  }

  // Compound
  if (path === "/api/compound/routines") return getCompoundRoutines();
  if (path === "/api/compound/exercises") return getCompoundExercises(Number(params.get("limit")) || 20);

  // Skills
  if (path === "/api/skills") {
    const branch = params.get("branch");
    return getSkillNodes(branch || undefined);
  }
  if (path.startsWith("/api/skills/state")) {
    if (path === "/api/skills/state") return getSkillStates();
    if (path.startsWith("/api/skills/state/")) {
      const slug = path.split("/")[4];
      if (method === "PUT") return saveSkillState({ skillSlug: slug, ...body });
      if (method === "POST") return saveSkillState({ skillSlug: slug, ...body });
    }
  }

  // Goals
  if (path === "/api/goals") {
    if (method === "GET") return getGoals();
    if (method === "POST") return addGoal(body);
  }
  if (path.startsWith("/api/goals/")) {
    const id = path.split("/")[3];
    if (method === "PUT") { updateGoal(id, body); return { ...body, id }; }
    if (method === "DELETE") { deleteGoal(id); return { ok: true }; }
    return getGoals().find(g => g.id === id);
  }

  // Sessions
  if (path === "/api/workouts/sessions") {
    if (method === "GET") return getSessions();
    if (method === "POST") return addSession(body);
  }
  if (path.startsWith("/api/workouts/sessions/")) {
    const id = path.split("/")[4];
    if (method === "DELETE") { deleteSession(id); return { ok: true }; }
    if (method === "PATCH") return getSessions().find(s => s.id === id);
    return getSessions().find(s => s.id === id);
  }

  // Templates - return empty (not implemented in offline)
  if (path === "/api/workouts/templates") return [];
  if (path.startsWith("/api/workouts/templates/")) return { ok: true };

  // Import
  if (path === "/api/workouts/import") return { ok: true, imported: 0, totalRows: 0, errors: [] };

  // Calc
  if (path === "/api/calc/substitute") {
    const { oldSlug, newSlug, reps } = body;
    const oldEx = getExercise(oldSlug);
    const newEx = getExercise(newSlug);
    if (!oldEx || !newEx) return { error: "Not found" };
    const kDifficulty = newEx.loadCoef / oldEx.loadCoef;
    const newReps = Math.max(1, Math.round(reps * (oldEx.loadCoef / newEx.loadCoef)));
    return { oldExercise: oldEx, newExercise: newEx, kDifficulty, oldReps: reps, newReps, diffCoef: newEx.loadCoef - oldEx.loadCoef, stressDelta: 0, direction: newEx.loadCoef < oldEx.loadCoef ? "easier" : "harder" };
  }

  // Biomech summary
  if (path === "/api/biomech/summary") {
    const profile = getProfile();
    const sessions = getSessions();
    const exercises = getExercises();
    const injuries = getInjuries();
    // Return a basic summary
    return {
      weeklyVolume: sessions.reduce((s, sess) => s + (sess.totalVolume || 0), 0),
      weeklyByCategory: { pull: 0, push: 0, core: 0, legs: 0, static: 0, mobility: 0 },
      balance: { pullPushRatio: 1, upperLowerRatio: 1, verdict: "balanced" },
      jointFatigue: { elbows: 0, shoulders: 0, wrists: 0, lowerBack: 0, knees: 0 },
      jointWarnings: [],
      fourWeekTrend: [],
      relativeStrength: null,
      weightLossImpact: null,
      cnsPulse: null,
      menstrualAdjustment: null,
    };
  }

  // Profile summary
  if (path === "/api/calc/profile-summary") {
    const profile = getProfile();
    // Basic calculations
    const age = profile.birthDate ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    return {
      kAge: 1.0,
      age,
      relativeStrength: null,
      stressIndex: null,
      weightLossImpact: null,
      tdee: null,
      bmr: null,
      bmi: profile.heightCm && profile.weightKg ? Number((profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)) : null,
      hasWeight: !!profile.weightKg,
      hasHeight: !!profile.heightCm,
      hasAge: !!age,
      hasGender: !!profile.gender,
      hasPullups: !!profile.maxPullups,
      hasStressInputs: !!(profile.lastSleepHours && profile.lastMood && profile.lastSoreness),
    };
  }

  // Pain
  if (path === "/api/pain") {
    if (method === "GET") return getPainLogs();
    if (method === "POST") return addPainLog(body);
  }
  if (path.startsWith("/api/pain/")) {
    const id = path.split("/")[3];
    if (method === "DELETE") { deletePainLog(id); return { ok: true }; }
  }

  // Sleep
  if (path === "/api/sleep") {
    if (method === "GET") return getSleepLogs();
    if (method === "POST") return addSleepLog(body);
  }
  if (path.startsWith("/api/sleep/")) {
    const id = path.split("/")[3];
    if (method === "DELETE") { deleteSleepLog(id); return { ok: true }; }
  }

  // Spots
  if (path === "/api/spots") {
    if (method === "GET") return getSpots();
    if (method === "POST") return addSpot(body);
  }
  if (path.startsWith("/api/spots/")) {
    const id = path.split("/")[3];
    if (method === "DELETE") { deleteSpot(id); return { ok: true }; }
  }

  // Calendar
  if (path === "/api/calendar") {
    if (method === "GET") {
      const month = params.get("month");
      let result = getPlannedWorkouts();
      if (month) {
        const [year, mon] = month.split("-").map(Number);
        result = result.filter(w => {
          const d = new Date(w.date);
          return d.getFullYear() === year && d.getMonth() === mon - 1;
        });
      }
      return result;
    }
    if (method === "POST") return addPlannedWorkout(body);
  }
  if (path.startsWith("/api/calendar/")) {
    const id = path.split("/")[3];
    if (method === "PUT") { updatePlannedWorkout(id, body); return { ...body, id }; }
    if (method === "DELETE") { deletePlannedWorkout(id); return { ok: true }; }
  }

  // AI chat - return a simple offline message
  if (path === "/api/ai/chat") {
    return {
      content: "Извини, AI-ассистент недоступен в автономном режиме. Полный функционал доступен в онлайн-версии приложения.",
    };
  }

  // AI messages
  if (path === "/api/ai/messages") {
    if (method === "GET") return [];
    if (method === "POST") return { id: "offline", role: body.role, content: body.content, createdAt: new Date().toISOString() };
    if (method === "DELETE") return { ok: true };
  }

  // Data export/import
  if (path === "/api/data/export") {
    return JSON.parse(exportAllData());
  }
  if (path === "/api/data/import") {
    importAllData(JSON.stringify(body));
    return { ok: true };
  }

  // Default
  console.warn("[offline] Unknown API route:", path, method);
  return [];
}
