import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";

export async function DELETE() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await db.user.delete({
      where: {
        id: user.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}