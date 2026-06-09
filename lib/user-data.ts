import { db } from "@/lib/db";

const SENSITIVE_KEYS = ["email", "phone", "ssn", "password", "token", "secret", "key", "auth", "credential"];

const redactParams = (params: Record<string, unknown>): Record<string, unknown> => {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
            redacted[key] = "[REDACTED]";
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
};

const logError = (functionName: string, params: Record<string, unknown>, error: unknown) => {
    console.error(
        JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "error",
            context: functionName,
            params: redactParams(params),
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        })
    );
};

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({
            where: { id },
            include: {
                accounts: true
            }
        });
        return user;
    } catch (err) {
        logError("getUserById", { id }, err);
        throw err;
    }
};

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: { email }
        });
        return user;
    } catch (err) {
        logError("getUserByEmail", { email }, err);
        throw err;
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
    } catch (err) {
        logError("getAccountByUserId", { userId }, err);
        throw err;
    }
};