import { tool as createTool } from "ai";
import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum characters allowed per file content payload. */
export const MAX_FILE_CONTENT_CHARS = 100_000;

/** Maximum number of files in a single batch-edit operation. */
export const MAX_BATCH_CHANGES = 50;

// ─── System Prompt ────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are an expert coding assistant embedded in a code editor called Editron.

CRITICAL RULES - follow these strictly:
1. You MUST use the edit_file or edit_multiple_files tools to create or modify files. NEVER just describe code changes in text - actually call the tool.
2. Before editing existing code, use read_file to understand the current file contents.
3. When using edit_file or edit_multiple_files, provide the COMPLETE file content - no partial snippets, no placeholders.
4. After making changes, briefly explain what you did in 1-2 sentences.
5. If you need to scaffold, refactor, or build multiple files at once, ALWAYS use the edit_multiple_files tool to perform the changes in a single batch.

WORKFLOW for every request that involves code:
1. Call read_file to see the current state
2. Call edit_file or edit_multiple_files with the complete new file content
3. Explain what changed

If the user asks you to create a new file, call the edit tool with the full content immediately. Do NOT tell the user what code to write - write it yourself using the tool.`;

// ─── Shared File Content Schema ───────────────────────────────────────────────

const fileContentSchema = z
  .string()
  .max(MAX_FILE_CONTENT_CHARS, {
    message: `content exceeds max characters (${MAX_FILE_CONTENT_CHARS})`,
  });

// ─── Tool Definitions ─────────────────────────────────────────────────────────

/**
 * Tool definitions exposed to the AI model.
 * Each tool includes a Zod input schema validated at the system boundary.
 */
export const tools = {
  read_file: createTool({
    description:
      "Read the contents of a file in the project. Use this to understand existing code before making changes.",
    inputSchema: z.object({
      path: z
        .string()
        .describe(
          "The file path relative to the project root, e.g. src/App.tsx or package.json",
        ),
    }),
  }),

  edit_file: createTool({
    description:
      "Replace the entire content of a single file. Provide the COMPLETE new file content.",
    inputSchema: z.object({
      path: z.string().describe("The file path relative to the project root"),
      content: fileContentSchema,
    }),
  }),

  edit_multiple_files: createTool({
    description: "Create or replace the content of MULTIPLE files at once.",
    inputSchema: z.object({
      changes: z
        .array(
          z.object({
            path: z
              .string()
              .describe("The file path relative to the project root"),
            content: fileContentSchema,
          }),
        )
        .max(MAX_BATCH_CHANGES, {
          message: `changes array exceeds max batch size (${MAX_BATCH_CHANGES})`,
        })
        .describe("An array of file modifications to execute as a batch"),
    }),
  }),

  delete_file: createTool({
    description: "Delete a file from the project.",
    inputSchema: z.object({
      path: z.string().describe("The file path relative to the project root"),
    }),
  }),
};