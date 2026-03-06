import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { files, name, userApiKey } = await req.json();

        if (!files || !Array.isArray(files)) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
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
        const flatFiles = files.map(f => ({
            file: f.path,
            data: f.content
        }));

        const projectName = name ? name.toLowerCase().replace(/[^a-z0-9-]/g, '-') : "editron-deploy";

        const response = await fetch("https://api.vercel.com/v13/deployments", {
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
