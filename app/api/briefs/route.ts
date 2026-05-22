import { NextResponse } from "next/server";
import { getBriefGroups } from "@/src/lib/obsidian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const groups = await getBriefGroups();
    return NextResponse.json(groups);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load briefs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
