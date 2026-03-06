import { NextResponse } from "next/server";
import { auth } from "@/auth";
import JSZip from "jszip";

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

        const token = userApiKey || process.env.NETLIFY_MASTER_TOKEN;

        if (!token) {
            return NextResponse.json(
                { error: "No Netlify API token provided and no master token available." },
                { status: 400 }
            );
        }

        // For Netlify, the easiest way to deploy raw files is to zip them and POST to the API.
        const zip = new JSZip();

        files.forEach((f: any) => {
            // Netlify requires files to be in a flat structure inside the zip or root
            zip.file(f.path, f.content);
        });

        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

        // Step 1: Create a site (or deploy to an existing one if we track site IDs)
        // For simplicity, we create a new site for this playground if no site ID is tracked.
        // In a real production app, you might want to create the site once and store the Site ID in MongoDB.

        const siteResponse = await fetch("https://api.netlify.com/api/v1/sites", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: `editron-${name ? name.toLowerCase().replace(/[^a-z0-9-]/g, '-') : "deploy"}-${Date.now().toString().slice(-4)}`
            }),
        });

        const siteData = await siteResponse.json();
        if (!siteResponse.ok) {
            return NextResponse.json({ error: siteData.message || "Failed to create Netlify site" }, { status: siteResponse.status });
        }

        const siteId = siteData.id;

        // Step 2: Deploy the Zip file (requires passing the buffer)
        const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/zip",
            },
            body: zipBuffer as unknown as BodyInit,
        });

        const deployData = await deployResponse.json();

        if (!deployResponse.ok) {
            return NextResponse.json(
                { error: deployData.message || "Failed to deploy to Netlify" },
                { status: deployResponse.status }
            );
        }

        return NextResponse.json({
            url: deployData.url || siteData.url,
            deploymentId: deployData.id,
            readyState: deployData.state
        });

    } catch (error) {
        console.error("Netlify deployment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
