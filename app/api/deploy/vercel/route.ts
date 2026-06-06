import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/api-utils";
import { VERCEL_API } from "@/lib/constants/config";

// Mirrors the limits enforced by the upload-zip route.
// Prevents authenticated users from exhausting server memory by sending
// thousands of large file entries in a single deploy request.
const MAX_FILE_COUNT = 500;
const MAX_ENTRY_SIZE = 500_000;          // 500 KB per file
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10 MB aggregate

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { allowed, remaining } = await rateLimit(`deploy-vercel:${session.user.id}`, 5, 60_000); // Max 5 deploys per minute

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

        // Validate file count
        if (files.length > MAX_FILE_COUNT) {
            return NextResponse.json(
                { error: `Too many files. Maximum is ${MAX_FILE_COUNT}.` },
                { status: 413 }
            );
        }

        // Validate per-file and aggregate content size
        let totalSize = 0;
        for (const f of files) {
            if (typeof f.content !== "string") {
                return NextResponse.json(
                    { error: "Each file entry must have a string content field." },
                    { status: 400 }
                );
            }
            const entrySize = Buffer.byteLength(f.content, "utf8");
            if (entrySize > MAX_ENTRY_SIZE) {
                return NextResponse.json(
                    { error: `File "${f.path}" exceeds the 500 KB per-file limit.` },
                    { status: 413 }
                );
            }
            totalSize += entrySize;
            if (totalSize > MAX_TOTAL_SIZE) {
                return NextResponse.json(
                    { error: "Total payload exceeds the 10 MB limit." },
                    { status: 413 }
                );
            }
        }

        // Try user key first, fallback to Editron Master Key
        const token = userApiKey || process.env.VERCEL_MASTER_TOKEN;

        if (!token) {
            return NextResponse.json(
                { error: "No Vercel API token provided and no master token available." },
                { status: 400 }
            );
        }

        // Vercel API requires an array of standard file objects:
        // [{ file: "index.html", data: "..." }]

        // Convert our internal `TemplateData` format to flat Vercel format
        const flatFiles = files.map((f: { path: string; content: string }) => ({
            file: f.path,
            data: f.content
        }));

        const projectName = name ? name.toLowerCase().replace(/[^a-z0-9-]/g, '-') : "editron-deploy";

        const response = await fetch(VERCEL_API.DEPLOYMENTS, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: projectName,
                files: flatFiles,
                target: "production"
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
            readyState: data.readyState
        });

    } catch (error) {
        console.error("Vercel deployment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
