import { tool as createTool } from "ai";
import { z } from "zod";

// DOS protection: limit prevents AI from hallucinating extremely large payloads
export const MAX_FILE_CONTENT_CHARS = 100_000;
// Cap batch file changes to prevent aggregate payload attacks
export const MAX_BATCH_CHANGES = 50;

/**
 * Tool definitions exposed to the AI model. Each tool includes a Zod
 * input schema to validate parameters at the system boundary.
 */
export const tools = {
    read_file: createTool({
        description: "Read the contents of a file in the project. Use this to understand existing code before making changes.",
        inputSchema: z.object({
            path: z.string().describe("The file path relative to the project root, e.g. src/App.tsx or package.json"),
        }),
    }),
    edit_file: createTool({
        description: "Replace the entire content of a single file. Provide the COMPLETE new file content.",
        inputSchema: z.object({
            path: z.string().describe("The file path relative to the project root"),
            // Prevent overly large content (character limit)
            content: z.string()
                .max(MAX_FILE_CONTENT_CHARS, { message: `content exceeds max characters (${MAX_FILE_CONTENT_CHARS})` }),
        }),
    }),
    edit_multiple_files: createTool({
        description: "Create or replace the content of MULTIPLE files at once.",
        inputSchema: z.object({
            changes: z.array(z.object({
                path: z.string().describe("The file path relative to the project root"),
                // Same protections for batch changes
                content: z.string()
                    .max(MAX_FILE_CONTENT_CHARS, { message: `content exceeds max characters (${MAX_FILE_CONTENT_CHARS})` }),
            })).max(MAX_BATCH_CHANGES, { message: `changes array exceeds max batch size (${MAX_BATCH_CHANGES})` }).describe("An array of file modifications to execute as a batch"),
        }),
    }),
    delete_file: createTool({
        description: "Delete a file from the project.",
        inputSchema: z.object({
            path: z.string().describe("The file path relative to the project root"),
        }),
    }),
};
