"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
import type { TemplateKey } from "@/lib/template";
import { Templates } from "@prisma/client";

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
    console.log(error);
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
    throw new Error("User Id is Required");
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

    return playground;
  } catch (error) {
    console.log(error);
  }
};

export const deleteProjectById = async (id: string) => {
  try {
    await db.playground.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

export const editProjectById = async (
  id: string,
  data: { title: string; description: string }
) => {
  try {
    await db.playground.update({
      where: {
        id,
      },
      data: data,
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
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

    const duplicatedPlayground = await db.playground.create({
      data: {
        title: `${originalPlayground.title} (Copy)`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        userId,
        templateFiles: originalPlayground.templateFiles.length
          ? {
              create: originalPlayground.templateFiles.map((file) => ({
                content: file.content,
              })),
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

