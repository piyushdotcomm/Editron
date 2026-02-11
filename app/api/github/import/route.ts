import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import {
    TemplateFile,
    TemplateFolder,
} from "@/modules/playground/lib/path-to-json";

// Parse owner/repo from a GitHub URL
function parseGithubUrl(url: string): { owner: string; repo: string } | null {
    // Normalize the URL: trim whitespace, remove trailing slashes and .git
    let cleaned = url.trim().replace(/\/+$/, "").replace(/\.git$/, "");

    // Match patterns like:
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // https://github.com/owner/repo/
    // https://github.com/owner/repo/tree/main/...
    // github.com/owner/repo
    const match = cleaned.match(
        /github\.com\/([^\/\s]+)\/([^\/\s]+)/
    );
    if (!match) return null;

    const owner = match[1];
    const repo = match[2];

    console.log(`Parsed GitHub URL: owner="${owner}", repo="${repo}" from URL="${url}"`);

    return { owner, repo };
}

// Fetch the recursive file tree from GitHub API
async function fetchRepoTree(
    owner: string,
    repo: string,
): Promise<{ tree: any[]; defaultBranch: string }> {
    // First, get the repo's default branch from the API
    const repoRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Editron-App",
            },
        }
    );

    if (!repoRes.ok) {
        throw new Error(
            `Could not fetch repository info. Make sure the repository is public and the URL is correct. (Status: ${repoRes.status})`
        );
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Editron-App",
            },
        }
    );

    if (!treeRes.ok) {
        throw new Error(
            `Could not fetch repository tree for branch '${defaultBranch}'. (Status: ${treeRes.status})`
        );
    }

    const treeData = await treeRes.json();
    return { tree: treeData.tree || [], defaultBranch };
}

// Fetch raw file content from GitHub
async function fetchFileContent(
    owner: string,
    repo: string,
    filePath: string,
    branch: string
): Promise<string> {
    const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
        {
            headers: { "User-Agent": "Editron-App" },
        }
    );

    if (res.ok) {
        return await res.text();
    }

    return `[Error: Could not fetch file content]`;
}

// Check if a file is likely binary based on extension
function isBinaryFile(filename: string): boolean {
    const binaryExtensions = [
        "png", "jpg", "jpeg", "gif", "bmp", "ico", "svg",
        "woff", "woff2", "ttf", "eot", "otf",
        "mp3", "mp4", "wav", "ogg", "webm",
        "zip", "tar", "gz", "rar", "7z",
        "pdf", "doc", "docx", "xls", "xlsx",
        "exe", "dll", "so", "dylib",
        "pyc", "class", "o", "obj",
    ];
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    return binaryExtensions.includes(ext);
}

// Files and folders to skip
const IGNORE_FILES = new Set([
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    ".DS_Store", "thumbs.db", ".gitignore", ".npmrc",
    ".env", ".env.local", ".env.development", ".env.production",
]);
const IGNORE_FOLDERS = new Set([
    "node_modules", ".git", ".vscode", ".idea",
    "dist", "build", "coverage", ".next",
]);

// Convert flat tree to nested TemplateFolder structure
function buildTemplateStructure(
    tree: any[],
    fileContents: Map<string, string>,
    rootName: string
): TemplateFolder {
    const root: TemplateFolder = { folderName: rootName, items: [] };

    // Create a map for quick folder lookup
    const folderMap = new Map<string, TemplateFolder>();
    folderMap.set("", root);

    // Sort tree so directories come before files within the same level
    const sorted = [...tree].sort((a, b) => {
        if (a.type === "tree" && b.type !== "tree") return -1;
        if (a.type !== "tree" && b.type === "tree") return 1;
        return a.path.localeCompare(b.path);
    });

    for (const item of sorted) {
        const parts = item.path.split("/");
        const name = parts[parts.length - 1];

        // Check if any parent folder is ignored
        const hasIgnoredParent = parts.some((p: string) => IGNORE_FOLDERS.has(p));
        if (hasIgnoredParent) continue;

        if (item.type === "tree") {
            // It's a directory
            if (IGNORE_FOLDERS.has(name)) continue;

            const folder: TemplateFolder = { folderName: name, items: [] };
            folderMap.set(item.path, folder);

            // Add to parent
            const parentPath = parts.slice(0, -1).join("/");
            const parent = folderMap.get(parentPath) || root;
            parent.items.push(folder);
        } else if (item.type === "blob") {
            // It's a file
            if (IGNORE_FILES.has(name)) continue;
            if (isBinaryFile(name)) continue;

            const ext = name.includes(".") ? name.split(".").pop()! : "";
            const filename = ext ? name.slice(0, -(ext.length + 1)) : name;

            const content = fileContents.get(item.path) || "";

            const file: TemplateFile = {
                filename,
                fileExtension: ext,
                content,
            };

            // Add to parent
            const parentPath = parts.slice(0, -1).join("/");
            const parent = folderMap.get(parentPath) || root;
            parent.items.push(file);
        }
    }

    return root;
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { repoUrl, subdir } = await req.json();

        if (!repoUrl || typeof repoUrl !== "string") {
            return Response.json(
                { error: "Invalid repository URL" },
                { status: 400 }
            );
        }

        const parsed = parseGithubUrl(repoUrl);
        if (!parsed) {
            return Response.json(
                { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
                { status: 400 }
            );
        }

        const { owner, repo } = parsed;

        try {
            // 1. Fetch the repository file tree
            console.log(`Fetching tree for ${owner}/${repo}`);
            const { tree, defaultBranch } = await fetchRepoTree(owner, repo);

            // 2. Check for monorepo: if no root package.json and no subdir selected, detect subdirs
            const hasRootPackageJson = tree.some(
                (item: any) => item.type === "blob" && item.path === "package.json"
            );

            if (!hasRootPackageJson && !subdir) {
                // Find all subdirectories that contain a package.json
                const packageJsonFiles = tree.filter(
                    (item: any) =>
                        item.type === "blob" &&
                        item.path.endsWith("/package.json") &&
                        item.path.split("/").length === 2 // Only top-level subdirs
                );

                const subdirs = packageJsonFiles.map((item: any) =>
                    item.path.replace("/package.json", "")
                );

                if (subdirs.length > 0) {
                    console.log(`Monorepo detected. Subdirs with package.json: ${subdirs.join(", ")}`);
                    return Response.json({
                        needsSubdir: true,
                        subdirs,
                        message: "This repository is a monorepo. Please select which project to import.",
                    });
                }

                // No package.json anywhere — import anyway as-is
                console.log("No package.json found anywhere, importing full repo as-is");
            }

            // 3. If a subdir is selected, filter and rebase the tree
            let workingTree = tree;
            const subdirPrefix = subdir ? `${subdir}/` : "";
            const projectName = subdir || repo;

            if (subdir) {
                console.log(`Importing subdirectory: ${subdir}`);
                workingTree = tree
                    .filter((item: any) => item.path.startsWith(subdirPrefix) || item.path === subdir)
                    .map((item: any) => ({
                        ...item,
                        path: item.path.substring(subdirPrefix.length), // Strip the subdir prefix
                    }))
                    .filter((item: any) => item.path.length > 0); // Remove the subdir entry itself
            }

            // 4. Filter to only text files we care about
            const filesToFetch = workingTree.filter(
                (item: any) =>
                    item.type === "blob" &&
                    !isBinaryFile(item.path) &&
                    !IGNORE_FILES.has(item.path.split("/").pop()!) &&
                    !item.path.split("/").some((p: string) => IGNORE_FOLDERS.has(p)) &&
                    (item.size || 0) < 1024 * 1024 // Skip files > 1MB
            );

            // 5. Fetch file contents in parallel (batched to avoid rate limits)
            console.log(`Fetching ${filesToFetch.length} files...`);
            const fileContents = new Map<string, string>();
            const BATCH_SIZE = 10;

            for (let i = 0; i < filesToFetch.length; i += BATCH_SIZE) {
                const batch = filesToFetch.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(
                    batch.map(async (item: any) => {
                        // Use the ORIGINAL path (with subdir prefix) for fetching from GitHub
                        const fetchPath = subdir ? `${subdirPrefix}${item.path}` : item.path;
                        const content = await fetchFileContent(owner, repo, fetchPath, defaultBranch);
                        return { path: item.path, content };
                    })
                );

                for (const { path, content } of results) {
                    fileContents.set(path, content);
                }
            }

            // 6. Build the template structure
            const templateData = buildTemplateStructure(workingTree, fileContents, projectName);

            // 7. Create a new Playground in the database
            const playground = await db.playground.create({
                data: {
                    title: projectName,
                    description: `Imported from ${repoUrl}${subdir ? ` (${subdir}/)` : ""}`,
                    userId: session.user.id,
                    template: "REACT",
                },
            });

            // 8. Save the template files to the database
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
            return Response.json(
                {
                    error:
                        "Failed to import repository: " +
                        (error instanceof Error ? error.message : String(error)),
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("API Error:", error);
        return Response.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
