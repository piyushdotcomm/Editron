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
const TRUSTED_PROXIES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

export function getClientIp(request: Request | any): string {
    // Next.js NextRequest has an 'ip' property which is securely populated by the platform
    if (request.ip) {
        const ip = request.ip.trim();
        if (ip.length > 0) return ip;
    }

    // Identify the direct connection IP (only available in Node.js environments, not Edge)
    const remoteAddr = (request.socket?.remoteAddress || request.connection?.remoteAddress || "").trim();

    // Determine if we should trust proxy headers
    // If remoteAddr is unavailable (e.g. Edge runtime), we assume the platform handles trust.
    const isTrustedProxy = !remoteAddr || TRUSTED_PROXIES.has(remoteAddr);

    if (isTrustedProxy) {
        // Prioritize x-real-ip as it is typically set by the reverse proxy/load balancer
        const realIpHeader = request.headers.get("x-real-ip");
        if (realIpHeader) {
            const realIp = realIpHeader.trim();
            if (realIp.length > 0) return realIp;
        }

        // Fallback to x-forwarded-for
        const forwardedHeader = request.headers.get("x-forwarded-for");
        if (forwardedHeader) {
            const forwarded = forwardedHeader.split(",")[0].trim();
            if (forwarded.length > 0) return forwarded;
        }
    }

    if (remoteAddr.length > 0) {
        return remoteAddr;
    }

    return "unknown";
}
