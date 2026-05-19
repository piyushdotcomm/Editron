import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCurrentUserId } from "@/lib/playground-auth";
import JSZip from "jszip";
import type { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";

function sanitizePathSegment(segment: string): string {
    return segment.replace(/\.\.+/g, "").replace(/[/\\]/g, "").replace(/\0/g, "").trim();
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        let userId: string;
        try {
            userId = await requireCurrentUserId();
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await db.playground.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                templateFiles: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const zip = new JSZip();

        // Helper function to add files recursively from TemplateFolder structure
        const addFilesToZip = (folder: TemplateFolder, currentPath: string = "") => {
            if (!folder || !Array.isArray(folder.items)) {
                throw new Error("Invalid template schema detected. The project could not be exported.");
            }

            folder.items.forEach((item: TemplateFile | TemplateFolder) => {
                if ("folderName" in item) {
                    // It's a folder
                    const cleanFolderName = sanitizePathSegment(item.folderName);
                    if (!cleanFolderName) return;
                    const newPath = currentPath ? `${currentPath}/${cleanFolderName}` : cleanFolderName;
                    addFilesToZip(item, newPath);
                } else if ("filename" in item) {
                    // It's a file
                    const cleanFilename = sanitizePathSegment(item.filename);
                    if (!cleanFilename) return;
                    const cleanExt = item.fileExtension ? sanitizePathSegment(item.fileExtension) : "";
                    const fullFilename = cleanExt ? `${cleanFilename}.${cleanExt}` : cleanFilename;
                    const filePath = currentPath ? `${currentPath}/${fullFilename}` : fullFilename;
                    zip.file(filePath, item.content || "");
                }
            });
        };

        if (project.templateFiles && project.templateFiles.length > 0) {
            const fileRecord = project.templateFiles[0];
            if (fileRecord && fileRecord.content) {
                try {
                    addFilesToZip(fileRecord.content as unknown as TemplateFolder);
                } catch (schemaError: any) {
                    return NextResponse.json({ error: schemaError.message || "Invalid schema" }, { status: 500 });
                }
            }
        }

        const zipContent = await zip.generateAsync({ type: "blob" });
        const buffer = Buffer.from(await zipContent.arrayBuffer());

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip"`,
            },
        });

    } catch (error) {
        console.error("Error generating zip:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}