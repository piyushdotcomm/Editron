"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";


export const getAllPlaygroundForUser = async()=>{
    const user = await currentUser();
    try {
       const playground = await db.playground.findMany({

            where:{
                userId:user?.id
            },
            include:{
                user:true
            }
        });
        return playground
    } catch (error) {
        console.log(error)
    }
}

// function currentUser() {
//     throw new Error("Function not implemented.");
// }
