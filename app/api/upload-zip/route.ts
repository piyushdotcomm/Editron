import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";

interface TemplateFile {
    filename: string;
    fileExtension: string;
    content: string;
}

interface TemplateFolder {
    folderName: string;
    items: (TemplateFile | TemplateFolder)[];
}

// Binary / large file extensions to skip
const SKIP_EXTENSIONS = new Set([
    "png", "jpg", "jpeg", "gif", "bmp", "ico", "svg",
    "woff", "woff2", "ttf", "eot", "otf",
    "mp3", "mp4", "wav", "avi", "mov",
    "zip", "tar", "gz", "rar",
    "pdf", "doc", "docx", "xls", "xlsx",
    "exe", "dll", "so", "dylib",
    "pyc", "class", "o",
]);

const SKIP_FOLDERS = new Set([
    "node_modules", ".git", ".next", "dist", "build",
    "__pycache__", ".cache", ".DS_Store",
]);

function isTemplateFolder(item: TemplateFile | TemplateFolder): item is TemplateFolder {
    return "folderName" in item;
}

async function zipToTemplateFolder(zip: JSZip): Promise<TemplateFolder> {
    const root: TemplateFolder = { folderName: "Root", items: [] };

    // Collect all file paths
    const filePaths: string[] = [];
    zip.forEach((relativePath, file) => {
        if (!file.dir) {
            filePaths.push(relativePath);
        }
    });

    // Detect common root folder (e.g. "my-project/src/..." -> strip "my-project/")
    let commonPrefix = "";
    if (filePaths.length > 0) {
        const firstSlash = filePaths[0].indexOf("/");
        if (firstSlash > 0) {
            const candidate = filePaths[0].substring(0, firstSlash + 1);
            if (filePaths.every((p) => p.startsWith(candidate))) {
                commonPrefix = candidate;
            }
        }
    }

    for (const filePath of filePaths) {
        const cleanPath = commonPrefix ? filePath.slice(commonPrefix.length) : filePath;
        if (!cleanPath) continue;

        const parts = cleanPath.split("/");
        const fileName = parts.pop()!;

        // Skip hidden files and folders in skip list
        if (parts.some((p) => SKIP_FOLDERS.has(p) || p.startsWith("."))) continue;
        if (fileName.startsWith(".")) continue;

        const ext = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "";
        if (SKIP_EXTENSIONS.has(ext)) continue;

        // Navigate/create folder structure
        let currentFolder = root;
        for (const part of parts) {
            let existing = currentFolder.items.find(
                (item) => isTemplateFolder(item) && item.folderName === part
            ) as TemplateFolder | undefined;

            if (!existing) {
                existing = { folderName: part, items: [] };
                currentFolder.items.push(existing);
            }
            currentFolder = existing;
        }

        // Read file content
        try {
            const file = zip.file(filePath);
            if (!file) continue;

            const content = await file.async("string");
            // Skip very large files (>500KB)
            if (content.length > 500_000) continue;

            const dotIndex = fileName.lastIndexOf(".");
            const name = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
            const extension = dotIndex > 0 ? fileName.substring(dotIndex + 1) : "";

            currentFolder.items.push({
                filename: name,
                fileExtension: extension,
                content,
            });
        } catch {
            // Skip binary/unreadable files
            continue;
        }
    }

    return root;
}

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = (formData.get("title") as string) || "Uploaded Project";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!file.name.endsWith(".zip")) {
            return NextResponse.json({ error: "Only .zip files are supported" }, { status: 400 });
        }

        // Max 50MB
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const templateData = await zipToTemplateFolder(zip);

        // Create playground
        const playground = await db.playground.create({
            data: {
                title,
                description: `Uploaded from ${file.name}`,
                template: "STATIC",
                userId: user.id,
            },
        });

        // Save template files
        await db.templateFile.create({
            data: {
                playgroundId: playground.id,
                content: JSON.stringify(templateData),
            },
        });

        return NextResponse.json({
            id: playground.id,
            title: playground.title,
        });
    } catch (error: any) {
        console.error("ZIP upload error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process ZIP file" },
            { status: 500 }
        );
    }
}
