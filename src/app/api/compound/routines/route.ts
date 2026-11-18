import { NextResponse } from "next/server";
import { COMPOUND_ROUTINES } from "@/lib/data/compound-meta";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(COMPOUND_ROUTINES);
}
