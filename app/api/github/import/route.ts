import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { db } from "@/lib/db";
import { scanTemplateDirectory } from "@/modules/playground/lib/path-to-json";
import { auth } from "@/auth"; // Verified path

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { repoUrl } = await req.json();

        if (!repoUrl || typeof repoUrl !== "string") {
            return Response.json({ error: "Invalid repository URL" }, { status: 400 });
        }

        // Basic validation for GitHub URL
        if (!repoUrl.includes("github.com")) {
            return Response.json({ error: "Only GitHub repositories are supported" }, { status: 400 });
        }

        // Create a temporary directory
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "editron-repo-"));
        const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "Imported Repo";

        try {
            // 1. Clone the repository
            console.log(`Cloning ${repoUrl} to ${tempDir}`);
            await execAsync(`git clone --depth 1 ${repoUrl} ${tempDir}`);

            // 2. Scan the directory to get the template structure
            // We need to pass ignore options to skip .git and other unnecessary files
            // These are already handled by default in scanTemplateDirectory but we can add more if needed
            const templateData = await scanTemplateDirectory(tempDir);

            // Override the folder name with the repo name to look better in UI
            templateData.folderName = repoName;

            // 3. Create a new Playground in the database
            const playground = await db.playground.create({
                data: {
                    title: repoName,
                    description: `Imported from ${repoUrl}`,
                    userId: session.user.id,
                    // We might need a generic "CUSTOM" or "IMPORTED" enum later, using REACT as default for now if generic isn't available
                    // schema says: enum Templates { REACT NEXTJS ANGULAR VUE HONO EXPRESS }
                    // We'll stick to REACT or try to detect later.
                    template: "REACT",
                },
            });

            // 4. Save the template files to the database
            // The schema has `TemplateFile` model which links to playground
            // content is Json type

            // Ensure the content is valid JSON (serializable)
            const validJson = JSON.parse(JSON.stringify(templateData));

            await db.templateFile.create({
                data: {
                    playgroundId: playground.id,
                    content: validJson,
                },
            });

            return Response.json({ success: true, playgroundId: playground.id });

        } catch (error) {
            console.error("Error processing repository:", error);
            return Response.json({ error: "Failed to process repository: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
        } finally {
            // 5. Cleanup: Remove the temporary directory
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
                console.log(`Cleaned up temp directory: ${tempDir}`);
            } catch (cleanupError) {
                console.error("Error cleaning up temp directory:", cleanupError);
            }
        }

    } catch (error) {
        console.error("API Error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
