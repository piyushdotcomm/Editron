
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import JSZip from "jszip";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await db.playground.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                templateFiles: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const zip = new JSZip();

        // Helper function to add files recursively
        const addFilesToZip = (folder: any, currentPath: string = "") => {
            Object.entries(folder).forEach(([key, value]: [string, any]) => {
                const path = currentPath ? `${currentPath}/${key}` : key;

                if (value.file && value.file.contents) {
                    zip.file(path, value.file.contents);
                } else if (value.directory) {
                    addFilesToZip(value.directory, path);
                }
            });
        };

        if (project.templateFiles && project.templateFiles.length > 0) {
            // Assuming content is stored in the first templateFile (based on schema relation)
            // The schema has templateFiles as an array but relation implies one-to-one via unique playgroundId?
            // Wait, schema says `templateFiles TemplateFile[]` but TemplateFile has `playgroundId String @unique`
            // This means a playground can have at most ONE TemplateFile record? 
            // Yes, one-to-one effectively.
            const fileRecord = project.templateFiles[0];
            if (fileRecord && fileRecord.content) {
                addFilesToZip(fileRecord.content);
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
