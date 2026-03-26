"use server";
import { auth } from "@/auth";
import { getUserById as dbGetUserById, getAccountByUserId as dbGetAccountByUserId, getUserByEmail as dbGetUserByEmail } from "@/lib/user-data";

export const getUserById = async (id: string) => await dbGetUserById(id);
export const getAccountByUserId = async (userId: string) => await dbGetAccountByUserId(userId);
export const getUserByEmail = async (email: string) => await dbGetUserByEmail(email);

export const currentUser = async () => {
    const user = await auth();
    return user?.user;
};
