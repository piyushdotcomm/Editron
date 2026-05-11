"use server"

import { db } from "@/lib/db"
import { assertPlaygroundOwnership, requireCurrentUserId } from "@/lib/playground-auth";
import { TemplateFolder } from "../lib/path-to-json";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/modules/auth/actions";


// Toggle marked status for a problem
export const toggleStarMarked = async (playgroundId: string, isChecked: boolean) => {
    const user = await currentUser();
    const userId = user?.id;
  if (!userId) {
    throw new Error("User ID is required");
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

export const createPlayground = async (data:{
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
  })=>{
    const {template , title , description} = data;

    const userId = await requireCurrentUserId();
    try {
        const playground = await db.playground.create({
            data:{
                title:title,
                description:description,
                template:template,
                userId
            }
        })

        return playground;
    } catch (error) {
        console.log(error)
    }
}


export const getAllPlaygroundForUser = async ()=>{
    const user = await currentUser();
    const userId = user?.id;

    try {
        const playground = await db.playground.findMany({
            where:{
                userId,
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId,
                    },
                    select:{
                        isMarked:true
                    }
                }
            }
        })
      
        return playground;
    } catch (error) {
        console.log(error)
    }
}

export const getPlaygroundById = async (id:string)=>{
    try {
        const userId = await requireCurrentUserId();
        const playground = await db.playground.findFirst({
            where:{id, userId},
            select:{
                id: true,
                title:true,
              templateFiles:{
                select:{
                  content:true
                }
              }
            }
        })
        return playground;
    } catch (error) {
        console.log(error)
    }
}

export const SaveUpdatedCode = async (playgroundId: string, data: TemplateFolder) => {
  await assertPlaygroundOwnership(playgroundId);

  try {
    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId, // now allowed since playgroundId is unique
      },
      update: {
        content: JSON.stringify(data),
      },
      create: {
        playgroundId,
        content: JSON.stringify(data),
      },
    });

    return updatedPlayground;
  } catch (error) {
    console.log("SaveUpdatedCode error:", error);
    throw error;
  }
};

export const deleteProjectById = async (id:string)=>{
    try {
        await assertPlaygroundOwnership(id);
        await db.playground.delete({
            where:{id}
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error)
    }
}


export const editProjectById = async (id:string,data:{title:string , description:string})=>{
    try {
        await assertPlaygroundOwnership(id);
        await db.playground.update({
            where:{id},
            data:data
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error)
    }
}

export const duplicateProjectById = async (id: string) => {
    try {
        const userId = await requireCurrentUserId();
        // Fetch the original playground data
        const originalPlayground = await db.playground.findFirst({
            where: { id, userId },
            include: {
                templateFiles: true, // Include related template files
            },
        });

        if (!originalPlayground) {
            throw new Error("Original playground not found");
        }

        // Create a new playground with the same data but a new ID
        const duplicatedPlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (Copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId,
                templateFiles: {
                  // @ts-ignore
                    create: originalPlayground.templateFiles.map((file) => ({
                        content: file.content,
                    })),
                },
            },
        });

        // Revalidate the dashboard path to reflect the changes
        revalidatePath("/dashboard");

        return duplicatedPlayground;
    } catch (error) {
        console.error("Error duplicating project:", error);
    }
};
