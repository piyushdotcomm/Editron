import { NextResponse } from "next/server";

import { createCollabToken } from "@/lib/collab-token";
import { db } from "@/lib/db";
import { requireCurrentUserId } from "@/lib/playground-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await requireCurrentUserId();
    const playground = await db.playground.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!playground) {
      return NextResponse.json({ error: "Playground not found" }, { status: 404 });
    }

    return NextResponse.json({
      token: createCollabToken(id, userId),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to issue collaboration token:", error);
    return NextResponse.json(
      { error: "Failed to issue collaboration token" },
      { status: 500 }
    );
  }
}
