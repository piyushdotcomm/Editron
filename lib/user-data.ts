import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({
            where: { id },
            include: {
                accounts: true
            }
        });
        return user;
    } catch (error) {
        logger.error("Error fetching user by ID:", error);
        return null;
    }
};

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: { email }
        });
        return user;
    } catch (error) {
        logger.error("Error fetching user by email:", error);
        return null;
    }
};

export const getAccountByUserId = async (userId: string) => {
    try {
        const account = await db.account.findFirst({
            where: {
                userId
            }
        });
        return account;
    } catch (error) {
        logger.error("Error fetching account by user ID:", error);
        return null;
    }
};
