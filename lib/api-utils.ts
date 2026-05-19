import { NextResponse } from "next/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Rate Limiter ---
const rateLimitMap = new Map<string, number[]>();

let redisRatelimit: Ratelimit | null = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redisRatelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(20, "1 m"),
        });
    }
} catch (error) {
    console.warn("Failed to initialize Upstash Redis rate limiter, falling back to memory:", error);
}

export async function rateLimit(
    identifier: string,
    maxRequests: number = 20,
    windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number }> {
    if (redisRatelimit) {
        try {
            const { success, remaining } = await redisRatelimit.limit(identifier);
            return { allowed: success, remaining };
        } catch (error) {
            console.warn("Redis rate limiter failed, falling back to in-memory limit for this request", error);
        }
    }

    // In-memory fallback
    const now = Date.now();

    // Prevent memory leak in long-running processes by capping map size
    if (rateLimitMap.size > 10000) {
        // 1) prune expired timestamps per key
        for (const [key, ts] of rateLimitMap) {
            const recentTs = ts.filter((t) => now - t < windowMs);
            if (recentTs.length === 0) rateLimitMap.delete(key);
            else rateLimitMap.set(key, recentTs);
        }
        // 2) if still above cap, evict oldest keys first
        while (rateLimitMap.size > 10000) {
            let oldestKey: string | undefined;
            let oldest = Infinity;
            for (const [key, ts] of rateLimitMap) {
                const last = ts[ts.length - 1] ?? Infinity;
                if (last < oldest) {
                    oldest = last;
                    oldestKey = key;
                }
            }
            if (!oldestKey) break;
            rateLimitMap.delete(oldestKey);
        }
    }

    const timestamps = rateLimitMap.get(identifier) || [];
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
        rateLimitMap.set(identifier, recent);
        return { allowed: false, remaining: 0 };
    }

    recent.push(now);
    rateLimitMap.set(identifier, recent);
    return { allowed: true, remaining: maxRequests - recent.length };
}

// --- Centralized Error Handler ---
export function handleApiError(error: unknown, context: string): NextResponse {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { success: false, error: "Validation failed", details: error.issues },
            { status: 400 }
        );
    }

    const message =
        error instanceof Error ? error.message : "Internal server error";

    // Structured log (JSON) for production observability
    console.error(
        JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "error",
            context,
            error: message,
            stack: error instanceof Error ? error.stack : undefined,
        })
    );

    return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
    );
}

// --- IP Extraction ---
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return "unknown";
}
