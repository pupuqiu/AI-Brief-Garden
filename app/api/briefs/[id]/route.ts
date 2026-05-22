import { NextResponse } from "next/server";
import { getBriefById } from "@/src/lib/obsidian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const brief = await getBriefById(params.id);

    if (!brief) {
      return NextResponse.json({ error: "Brief not found." }, { status: 404 });
    }

    return NextResponse.json(brief);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load brief.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
