"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
import type { TemplateKey } from "@/lib/template";
import { templatePaths } from "@/lib/template";
import { Templates, Prisma } from "@prisma/client";

export const toggleStarMarked = async (
  playgroundId: string,
  isChecked: boolean
) => {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    throw new Error("User Id is Required");
  }

  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
      await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: playgroundId,

          },
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating problem:", error);
    return { success: false, error: "Failed to update problem" };
  }
};

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  const userId = user?.id;

  try {
    const playground = await db.playground.findMany({
      where: {
        userId,
      },
      include: {
        user: true,
        Starmark: {
          where: {
            userId,
          },
          select: {
            isMarked: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
  }
};

export const createPlayground = async (data: {
  title: string;
  template: TemplateKey;
  description?: string;
}) => {
  const user = await currentUser();
  const userId = user?.id;

  const { template, title, description } = data;

  if (!userId) {
    return { success: false as const, error: "User Id is Required" };
  }

  // Validate that the requested template key maps to a known starter path.
  // Template files are loaded on-demand via the /api/template/[id] route when
  // the playground is first opened, so we only store the enum value here.
  if (template !== "BLANK" && !templatePaths[template]) {
    return { success: false as const, error: `Unknown template: ${template}` };
  }

  try {
    const playground = await db.playground.create({
      data: {
        title: title,
        description: description,
        template:
          template === "BLANK"
            ? undefined
            : (template as Templates),
        userId,
      },
    });

    return { success: true as const, playground };
  } catch (error) {
    console.error("Error creating playground:", error);
    return { success: false as const, error: "Failed to create playground" };
  }
};

export const deleteProjectById = async (id: string) => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await db.playground.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      throw new Error("Playground not found or unauthorized");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error(error);
  }
};

export const editProjectById = async (
  id: string,
  data: { title: string; description: string }
) => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await db.playground.updateMany({
      where: {
        id,
        userId,
      },
      data: data,
    });

    if (result.count === 0) {
      throw new Error("Playground not found or unauthorized");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const duplicateProjectById = async (id: string) => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error("User Id is Required");
  }

  try {
    const originalPlayground = await db.playground.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        templateFiles: true,
      },
    });

    if (!originalPlayground) {
      throw new Error("Original playground not found");
    }

    // TemplateFile has a unique constraint on playgroundId, so each playground
    // can have at most one TemplateFile record.  If the original playground was
    // never edited by the user, templateFiles will be empty and the duplicate
    // will load its starter files on-demand from disk via /api/template/[id].
    const firstFile = originalPlayground.templateFiles[0];

    const duplicatedPlayground = await db.playground.create({
      data: {
        title: `${originalPlayground.title} (Copy)`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        userId,
        templateFiles: firstFile
          ? {
              create: {
                content: firstFile.content as Prisma.InputJsonValue,
              },
            }
          : undefined,
      },
    });

    revalidatePath("/dashboard");

    return duplicatedPlayground;
  } catch (error) {
    console.error("Error duplicating project:", error);
    throw error;
  }
};

