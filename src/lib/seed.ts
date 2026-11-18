// Серверная утилита: синхронизировать БД с сидом.
// Для предзаполненных справочников (exercises, techniques, theory) — upsert.
// Для пользовательских данных (profile, sessions, templates) — не трогаем.

import { db } from "@/lib/db";
import { EXERCISES } from "@/lib/data/exercises";
import { TECHNIQUES } from "@/lib/data/techniques";
import { THEORY_ARTICLES } from "@/lib/data/theory";
import { STATIC_ELEMENTS } from "@/lib/data/static-elements";
import { COMPOUND_META } from "@/lib/data/compound-meta";
import { SKILL_NODES } from "@/lib/data/skills-tree";
import { PROBLEM_AREAS } from "@/lib/data/problem-areas";
import { SUPPLEMENTS } from "@/lib/data/supplements";

let syncPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (syncPromise) return syncPromise;
  syncPromise = doSeed();
  return syncPromise;
}

async function doSeed(): Promise<void> {
  // === Exercises: upsert by slug, с compound-метаданными ===
  for (const e of EXERCISES) {
    const compound = COMPOUND_META.find((m) => m.slug === e.slug);
    await db.exercise.upsert({
      where: { slug: e.slug },
      update: {
        nameRu: e.nameRu,
        nameEn: e.nameEn,
        descriptionRu: e.descriptionRu,
        descriptionEn: e.descriptionEn,
        howToRu: e.howToRu,
        howToEn: e.howToEn,
        type: e.type.toUpperCase(),
        equipment: JSON.stringify(e.equipment),
        levelBase: e.levelBase.toUpperCase(),
        levelSub: e.levelSub,
        vectors: JSON.stringify(e.vectors),
        loadCoef: e.loadCoef,
        targetMusclesRu: JSON.stringify(e.targetMusclesRu),
        targetMusclesEn: JSON.stringify(e.targetMusclesEn),
        illustrationUrl: e.illustrationUrl ?? null,
        scienceRu: e.scienceRu ?? null,
        scienceEn: e.scienceEn ?? null,
        sources: e.sources ? JSON.stringify(e.sources) : null,
        alternatives: JSON.stringify(e.alternatives),
        compoundScore: compound?.compoundScore ?? null,
        muscleGroupsCount: compound?.muscleGroupsCount ?? null,
        compoundType: compound?.compoundType.toUpperCase() ?? null,
        isCompound: compound?.isCompound ?? null,
      },
      create: {
        slug: e.slug,
        nameRu: e.nameRu,
        nameEn: e.nameEn,
        descriptionRu: e.descriptionRu,
        descriptionEn: e.descriptionEn,
        howToRu: e.howToRu,
        howToEn: e.howToEn,
        type: e.type.toUpperCase(),
        equipment: JSON.stringify(e.equipment),
        levelBase: e.levelBase.toUpperCase(),
        levelSub: e.levelSub,
        vectors: JSON.stringify(e.vectors),
        loadCoef: e.loadCoef,
        targetMusclesRu: JSON.stringify(e.targetMusclesRu),
        targetMusclesEn: JSON.stringify(e.targetMusclesEn),
        illustrationUrl: e.illustrationUrl ?? null,
        scienceRu: e.scienceRu ?? null,
        scienceEn: e.scienceEn ?? null,
        sources: e.sources ? JSON.stringify(e.sources) : null,
        alternatives: JSON.stringify(e.alternatives),
        compoundScore: compound?.compoundScore ?? null,
        muscleGroupsCount: compound?.muscleGroupsCount ?? null,
        compoundType: compound?.compoundType.toUpperCase() ?? null,
        isCompound: compound?.isCompound ?? null,
      },
    });
  }

  // === Techniques: upsert by slug ===
  for (const t of TECHNIQUES) {
    await db.technique.upsert({
      where: { slug: t.slug },
      update: {
        nameRu: t.nameRu,
        nameEn: t.nameEn,
        category: t.category.toUpperCase(),
        descriptionRu: t.descriptionRu,
        descriptionEn: t.descriptionEn,
        whenToApplyRu: t.whenToApplyRu,
        whenToApplyEn: t.whenToApplyEn,
        stepsRu: JSON.stringify(t.stepsRu),
        stepsEn: JSON.stringify(t.stepsEn),
        scienceRu: t.scienceRu ?? null,
        scienceEn: t.scienceEn ?? null,
        level: t.level.toUpperCase(),
        durationMin: t.durationMin ?? null,
      },
      create: {
        slug: t.slug,
        nameRu: t.nameRu,
        nameEn: t.nameEn,
        category: t.category.toUpperCase(),
        descriptionRu: t.descriptionRu,
        descriptionEn: t.descriptionEn,
        whenToApplyRu: t.whenToApplyRu,
        whenToApplyEn: t.whenToApplyEn,
        stepsRu: JSON.stringify(t.stepsRu),
        stepsEn: JSON.stringify(t.stepsEn),
        scienceRu: t.scienceRu ?? null,
        scienceEn: t.scienceEn ?? null,
        level: t.level.toUpperCase(),
        durationMin: t.durationMin ?? null,
      },
    });
  }

  // === Theory: upsert by slug ===
  for (const a of THEORY_ARTICLES) {
    await db.theoryArticle.upsert({
      where: { slug: a.slug },
      update: {
        category: a.category,
        titleRu: a.titleRu,
        titleEn: a.titleEn,
        contentRu: a.contentRu,
        contentEn: a.contentEn,
        sources: a.sources ? JSON.stringify(a.sources) : null,
        order: a.order,
      },
      create: {
        slug: a.slug,
        category: a.category,
        titleRu: a.titleRu,
        titleEn: a.titleEn,
        contentRu: a.contentRu,
        contentEn: a.contentEn,
        sources: a.sources ? JSON.stringify(a.sources) : null,
        order: a.order,
      },
    });
  }

  // === Profile: создать дефолтный, если нет ===
  const profileCount = await db.athleteProfile.count();
  if (profileCount === 0) {
    await db.athleteProfile.create({
      data: { id: "default" },
    });
  }

  // === Static elements: upsert by slug ===
  for (const el of STATIC_ELEMENTS) {
    await db.staticElement.upsert({
      where: { slug: el.slug },
      update: {
        nameRu: el.nameRu,
        nameEn: el.nameEn,
        descriptionRu: el.descriptionRu,
        descriptionEn: el.descriptionEn,
        icon: el.icon,
        steps: JSON.stringify(el.steps),
      },
      create: {
        slug: el.slug,
        nameRu: el.nameRu,
        nameEn: el.nameEn,
        descriptionRu: el.descriptionRu,
        descriptionEn: el.descriptionEn,
        icon: el.icon,
        steps: JSON.stringify(el.steps),
      },
    });
  }

  // === Skills tree nodes: upsert by slug (Phase 3) ===
  for (const n of SKILL_NODES) {
    await db.skillNode.upsert({
      where: { slug: n.slug },
      update: {
        exerciseSlug: n.exerciseSlug ?? null,
        nameRu: n.nameRu,
        nameEn: n.nameEn,
        descriptionRu: n.descriptionRu,
        descriptionEn: n.descriptionEn,
        branch: n.branch.toUpperCase(),
        type: n.type.toUpperCase(),
        order: n.order,
        gateSec: n.gateSec ?? null,
        gateReps: n.gateReps ?? null,
        gateNotesRu: n.gateNotesRu ?? null,
        gateNotesEn: n.gateNotesEn ?? null,
        prerequisites: JSON.stringify(n.prerequisites),
        unlocksPassive: n.unlocksPassive ? JSON.stringify(n.unlocksPassive) : null,
        x: n.x,
        y: n.y,
        loadCoef: n.loadCoef,
        isElite: n.isElite ?? false,
      },
      create: {
        slug: n.slug,
        exerciseSlug: n.exerciseSlug ?? null,
        nameRu: n.nameRu,
        nameEn: n.nameEn,
        descriptionRu: n.descriptionRu,
        descriptionEn: n.descriptionEn,
        branch: n.branch.toUpperCase(),
        type: n.type.toUpperCase(),
        order: n.order,
        gateSec: n.gateSec ?? null,
        gateReps: n.gateReps ?? null,
        gateNotesRu: n.gateNotesRu ?? null,
        gateNotesEn: n.gateNotesEn ?? null,
        prerequisites: JSON.stringify(n.prerequisites),
        unlocksPassive: n.unlocksPassive ? JSON.stringify(n.unlocksPassive) : null,
        x: n.x,
        y: n.y,
        loadCoef: n.loadCoef,
        isElite: n.isElite ?? false,
      },
    });
  }

  // === Problem areas: upsert by slug (Phase 3) ===
  for (const p of PROBLEM_AREAS) {
    await db.problemArea.upsert({
      where: { slug: p.slug },
      update: {
        nameRu: p.nameRu,
        nameEn: p.nameEn,
        descriptionRu: p.descriptionRu,
        descriptionEn: p.descriptionEn,
        category: p.category,
        causesRu: JSON.stringify(p.causesRu),
        causesEn: JSON.stringify(p.causesEn),
        solutionsRu: JSON.stringify(p.solutionsRu),
        solutionsEn: JSON.stringify(p.solutionsEn),
        recommendedExerciseSlugs: JSON.stringify(p.recommendedExerciseSlugs),
        recommendedTechniqueSlugs: JSON.stringify(p.recommendedTechniqueSlugs),
        nutritionTipsRu: p.nutritionTipsRu ?? null,
        nutritionTipsEn: p.nutritionTipsEn ?? null,
        whenToSeeDoctorRu: p.whenToSeeDoctorRu,
        whenToSeeDoctorEn: p.whenToSeeDoctorEn,
        relatedInjuryBodyParts: JSON.stringify(p.relatedInjuryBodyParts),
      },
      create: {
        slug: p.slug,
        nameRu: p.nameRu,
        nameEn: p.nameEn,
        descriptionRu: p.descriptionRu,
        descriptionEn: p.descriptionEn,
        category: p.category,
        causesRu: JSON.stringify(p.causesRu),
        causesEn: JSON.stringify(p.causesEn),
        solutionsRu: JSON.stringify(p.solutionsRu),
        solutionsEn: JSON.stringify(p.solutionsEn),
        recommendedExerciseSlugs: JSON.stringify(p.recommendedExerciseSlugs),
        recommendedTechniqueSlugs: JSON.stringify(p.recommendedTechniqueSlugs),
        nutritionTipsRu: p.nutritionTipsRu ?? null,
        nutritionTipsEn: p.nutritionTipsEn ?? null,
        whenToSeeDoctorRu: p.whenToSeeDoctorRu,
        whenToSeeDoctorEn: p.whenToSeeDoctorEn,
        relatedInjuryBodyParts: JSON.stringify(p.relatedInjuryBodyParts),
      },
    });
  }

  // === Supplements: upsert by slug (Phase 3) ===
  for (const s of SUPPLEMENTS) {
    await db.supplement.upsert({
      where: { slug: s.slug },
      update: {
        nameRu: s.nameRu,
        nameEn: s.nameEn,
        category: s.category.toUpperCase(),
        descriptionRu: s.descriptionRu,
        descriptionEn: s.descriptionEn,
        dosageRu: s.dosageRu,
        dosageEn: s.dosageEn,
        timingRu: s.timingRu,
        timingEn: s.timingEn,
        efficacy: s.efficacy.toUpperCase(),
        efficacyNotesRu: s.efficacyNotesRu,
        efficacyNotesEn: s.efficacyNotesEn,
        sideEffectsRu: s.sideEffectsRu,
        sideEffectsEn: s.sideEffectsEn,
        contraindicationsRu: s.contraindicationsRu,
        contraindicationsEn: s.contraindicationsEn,
        sources: JSON.stringify(s.sources),
        recommendedForGoals: JSON.stringify(s.recommendedForGoals),
      },
      create: {
        slug: s.slug,
        nameRu: s.nameRu,
        nameEn: s.nameEn,
        category: s.category.toUpperCase(),
        descriptionRu: s.descriptionRu,
        descriptionEn: s.descriptionEn,
        dosageRu: s.dosageRu,
        dosageEn: s.dosageEn,
        timingRu: s.timingRu,
        timingEn: s.timingEn,
        efficacy: s.efficacy.toUpperCase(),
        efficacyNotesRu: s.efficacyNotesRu,
        efficacyNotesEn: s.efficacyNotesEn,
        sideEffectsRu: s.sideEffectsRu,
        sideEffectsEn: s.sideEffectsEn,
        contraindicationsRu: s.contraindicationsRu,
        contraindicationsEn: s.contraindicationsEn,
        sources: JSON.stringify(s.sources),
        recommendedForGoals: JSON.stringify(s.recommendedForGoals),
      },
    });
  }
}
