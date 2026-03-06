import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { repoName, isPrivate, description, files } = await req.json();

        if (!repoName || !files || !Array.isArray(files)) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // Get the user's GitHub access token from the database
        const account = await db.account.findFirst({
            where: {
                userId: session.user.id,
                provider: "github",
            },
        });

        if (!account || !account.accessToken) {
            return NextResponse.json(
                { error: "GitHub account not linked or missing permissions. Please sign out and sign in again with GitHub." },
                { status: 403 }
            );
        }

        const token = account.accessToken;

        // 1. Create the repository
        const createRepoRes = await fetch("https://api.github.com/user/repos", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: repoName,
                description: description || "Created with Editron",
                private: isPrivate,
                auto_init: true, // Creates an initial commit so we can get a reference
            }),
        });

        const repoData = await createRepoRes.json();

        // We will need the owner and repo name to push commits.
        let owner = "";
        let repo = repoName;

        if (!createRepoRes.ok) {
            // If the failure is a 422 (Unprocessable Entity) it often means the repo already exists.
            if (createRepoRes.status === 422 && repoData.errors?.[0]?.message?.includes("already exists")) {
                // Try to fetch the existing repo to confirm ownership
                const getRepoRes = await fetch(`https://api.github.com/user/repos?affiliation=owner`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (getRepoRes.ok) {
                    const repos = await getRepoRes.json();
                    const existingRepo = repos.find((r: any) => r.name.toLowerCase() === repoName.toLowerCase());
                    if (existingRepo) {
                        owner = existingRepo.owner.login;
                        repo = existingRepo.name;
                    } else {
                        return NextResponse.json(
                            { error: "Repository name already exists on another account or organization. Please choose a unique name." },
                            { status: 400 }
                        );
                    }
                } else {
                    return NextResponse.json({ error: "Failed to verify existing repository." }, { status: 500 });
                }
            } else {
                return NextResponse.json(
                    { error: repoData.message || "Failed to create repository." },
                    { status: createRepoRes.status }
                );
            }
        } else {
            owner = repoData.owner.login;
            repo = repoData.name;
            // Give GitHub an instant to initialize the newly created repo branch
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 2. We use the lower-level Git Data API to commit multiple files at once.
        // First, get the reference to the main branch
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
        });

        let baseTreeSha: string;
        let baseCommitSha: string;

        if (refRes.ok) {
            const refData = await refRes.json();
            baseCommitSha = refData.object.sha;

            const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
            });
            const commitData = await commitRes.json();
            baseTreeSha = commitData.tree.sha;
        } else {
            throw new Error("Could not find main branch reference.");
        }

        // 3. Create a tree containing all files
        const treeFull = files.map((f: any) => ({
            path: f.path,
            mode: "100644",
            type: "blob",
            content: f.content,
        }));

        // GitHub API limits tree creation payload size, but for a playground this should be fine.
        const createTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                base_tree: baseTreeSha,
                tree: treeFull
            }),
        });

        if (!createTreeRes.ok) {
            const err = await createTreeRes.json();
            throw new Error(`Failed to create git tree: ${err.message}`);
        }
        const newTreeData = await createTreeRes.json();

        // 4. Create a commit
        const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: "Initial Export from Editron Playground",
                tree: newTreeData.sha,
                parents: [baseCommitSha],
            }),
        });

        if (!createCommitRes.ok) throw new Error("Failed to create git commit");
        const newCommitData = await createCommitRes.json();

        // 5. Update the reference (push)
        const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sha: newCommitData.sha,
                force: false,
            }),
        });

        if (!updateRefRes.ok) throw new Error("Failed to update branch reference");

        return NextResponse.json({
            url: `https://github.com/${owner}/${repo}`,
            message: "Successfully exported to GitHub",
        });

    } catch (error: any) {
        console.error("GitHub Export Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
