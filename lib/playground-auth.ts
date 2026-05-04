import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireCurrentUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function assertPlaygroundOwnership(
  playgroundId: string
): Promise<string> {
  const userId = await requireCurrentUserId();
  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  return userId;
}
