import { NextResponse } from "next/server";
import { z } from "zod";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Rate Limiter ---
const rateLimitMap = new Map<string, number[]>();
const redisLimiterCache = new Map<string, Ratelimit>();

let isRedisConfigured = false;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        isRedisConfigured = true;
    }
} catch (error) {
    console.warn("Failed to check Upstash Redis env config:", error);
}

function getRedisRatelimit(maxRequests: number, windowMs: number): Ratelimit | null {
    if (!isRedisConfigured) return null;
    
    const cacheKey = `${maxRequests}_${windowMs}`;
    if (!redisLimiterCache.has(cacheKey)) {
        redisLimiterCache.set(
            cacheKey,
            new Ratelimit({
                redis: Redis.fromEnv(),
                // @upstash/ratelimit allows durations like "10 s", "60000 ms"
                limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms` as Duration),
            })
        );
    }
    return redisLimiterCache.get(cacheKey)!;
}

export async function rateLimit(
    identifier: string,
    maxRequests: number = 20,
    windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number }> {
    const redisLimiter = getRedisRatelimit(maxRequests, windowMs);
    
    if (redisLimiter) {
        try {
            const { success, remaining } = await redisLimiter.limit(identifier);
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
