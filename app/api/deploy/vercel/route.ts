import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { VERCEL_API } from "@/lib/constants/config";
import { rateLimit } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Mirror the same rate limit as the Netlify deploy route (5 deploys / minute)
        const { allowed, remaining } = await rateLimit(
            `deploy-vercel:${session.user.id}`,
            5,
            60_000
        );

        if (!allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please wait before deploying again." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "60",
                        "X-RateLimit-Limit": "5",
                        "X-RateLimit-Remaining": String(remaining),
                    },
                }
            );
        }

        const { files, name, userApiKey } = await req.json();

        if (!files || !Array.isArray(files)) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        // Require the caller to supply their own token.
        // VERCEL_MASTER_TOKEN is intentionally NOT used as a fallback here —
        // doing so would let any authenticated user deploy on the server's
        // Vercel account without explicit per-deployment consent (issue #449).
        const token = (userApiKey as string | undefined)?.trim();
        if (!token) {
            return NextResponse.json(
                {
                    error:
                        "A Vercel API key is required. Please provide your own token in the deploy dialog.",
                },
                { status: 400 }
            );
        }

        const flatFiles = files.map((f: { path: string; content: string }) => ({
            file: f.path,
            data: f.content,
        }));

        const projectName = name
            ? (name as string).toLowerCase().replace(/[^a-z0-9-]/g, "-")
            : "editron-deploy";

        const response = await fetch(VERCEL_API.DEPLOYMENTS, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: projectName,
                files: flatFiles,
                target: "production",
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error?.message || "Failed to deploy to Vercel" },
                { status: response.status }
            );
        }

        return NextResponse.json({
            url: data.url,
            deploymentId: data.id,
            readyState: data.readyState,
        });
    } catch (error) {
        console.error("Vercel deployment error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}