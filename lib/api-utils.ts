import { NextResponse } from "next/server";
import { z } from "zod";

// --- Rate Limiter ---
const rateLimitMap = new Map<string, number[]>();

export function rateLimit(
    identifier: string,
    maxRequests: number = 20,
    windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
    const now = Date.now();
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
