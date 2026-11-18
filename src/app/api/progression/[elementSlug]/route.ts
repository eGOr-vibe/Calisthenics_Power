import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { ProgressionState, StaticElementSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapRow(row: any): ProgressionState {
  return {
    id: row.id,
    elementSlug: row.elementSlug as StaticElementSlug,
    currentStep: row.currentStep,
    bestHoldSec: row.bestHoldSec,
    bestHoldDate: row.bestHoldDate ? row.bestHoldDate.toISOString() : null,
    passedSteps: JSON.parse(row.passedSteps ?? "[]") as number[],
    notes: row.notes,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function defaultState(elementSlug: StaticElementSlug): ProgressionState {
  return {
    id: "default",
    elementSlug,
    currentStep: 1,
    bestHoldSec: 0,
    bestHoldDate: null,
    passedSteps: [],
    notes: null,
    updatedAt: new Date(0).toISOString(),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ elementSlug: string }> },
) {
  await ensureSeeded();
  const { elementSlug } = await params;
  const row = await db.progressionState.findUnique({
    where: { elementSlug },
  });
  if (!row) {
    return NextResponse.json(
      defaultState(elementSlug as StaticElementSlug),
    );
  }
  return NextResponse.json(mapRow(row));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ elementSlug: string }> },
) {
  await ensureSeeded();
  const { elementSlug } = await params;
  const body = await request.json().catch(() => ({}));

  // Текущая строка (если есть) — для слияния с partial-обновлением.
  const existing = await db.progressionState.findUnique({
    where: { elementSlug },
  });

  const currentStep =
    typeof body.currentStep === "number" && Number.isFinite(body.currentStep)
      ? Math.max(1, Math.floor(body.currentStep))
      : existing?.currentStep ?? 1;

  const bestHoldSec =
    typeof body.bestHoldSec === "number" && Number.isFinite(body.bestHoldSec)
      ? Math.max(0, Math.floor(body.bestHoldSec))
      : existing?.bestHoldSec ?? 0;

  const bestHoldDate =
    typeof body.bestHoldDate === "string" && body.bestHoldDate.trim() !== ""
      ? new Date(body.bestHoldDate)
      : body.bestHoldDate === null
        ? null
        : existing?.bestHoldDate ?? null;

  const passedSteps: number[] = Array.isArray(body.passedSteps)
    ? body.passedSteps
        .map((n: unknown) => (typeof n === "number" ? Math.floor(n) : NaN))
        .filter((n: number) => Number.isFinite(n))
    : existing
      ? (JSON.parse(existing.passedSteps ?? "[]") as number[])
      : [];

  const notes =
    typeof body.notes === "string"
      ? body.notes
      : body.notes === null
        ? null
        : existing?.notes ?? null;

  const row = await db.progressionState.upsert({
    where: { elementSlug },
    update: {
      currentStep,
      bestHoldSec,
      bestHoldDate,
      passedSteps: JSON.stringify(passedSteps),
      notes,
    },
    create: {
      elementSlug,
      currentStep,
      bestHoldSec,
      bestHoldDate,
      passedSteps: JSON.stringify(passedSteps),
      notes,
    },
  });

  return NextResponse.json(mapRow(row));
}
