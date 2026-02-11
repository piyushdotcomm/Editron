import { NextRequest } from "next/server";
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { db } from "@/lib/db";
import { scanTemplateDirectory } from "@/modules/playground/lib/path-to-json";
import { auth } from "@/auth"; // Verified path

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
            // 1. Clone the repository using spawn
            console.log(`Cloning ${repoUrl} to ${tempDir}`);

            // Use spawn instead of exec to avoid shell issues on Windows/Unix
            await new Promise<void>((resolve, reject) => {
                const git = spawn("git", ["clone", "--depth", "1", repoUrl, tempDir], {
                    stdio: "inherit", // Pipe output to parent process for logs used by server
                    shell: false // Important: Do not use shell to avoid /bin/sh issues on Windows environments if configured oddly
                });

                git.on("close", (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Git clone failed with exit code ${code}`));
                    }
                });

                git.on("error", (err) => {
                    reject(new Error(`Failed to start git process: ${err.message}`));
                });
            });

            // 2. Scan the directory to get the template structure
            const templateData = await scanTemplateDirectory(tempDir);

            // Override the folder name with the repo name to look better in UI
            templateData.folderName = repoName;

            // 3. Create a new Playground in the database
            const playground = await db.playground.create({
                data: {
                    title: repoName,
                    description: `Imported from ${repoUrl}`,
                    userId: session.user.id,
                    template: "REACT",
                },
            });

            // 4. Save the template files to the database
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
