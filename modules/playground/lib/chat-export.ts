/**
 * Chat Export Utilities
 * Handles exporting chat messages to Markdown and JSON formats
 */

export interface ExportMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

/**
 * Format messages for Markdown export
 */
export function exportToMarkdown(messages: any[]): string {
  if (messages.length === 0) {
    return "# Chat Transcript\n\nNo messages to export.";
  }

  const timestamp = new Date().toLocaleString();
  let markdown = `# Chat Transcript\n\n`;
  markdown += `**Exported on:** ${timestamp}\n\n`;
  markdown += `---\n\n`;

  messages.forEach((msg, index) => {
    const rawParts: any[] = (msg as any).parts ?? [];
    const textParts = rawParts.filter((p: any) => p.type === "text");
    const textContent: string = (
      textParts.map((p: any) => p.text).join("") ||
      (msg as any).content ||
      ""
    );

    // Skip synthetic messages
    if (msg.role === "user" && textParts.length === 0) {
      return;
    }

    const roleLabel = msg.role === "user" ? "👤 You" : "🤖 Assistant";
    const msgTime = msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString()
      : "";

    markdown += `## ${roleLabel}`;
    if (msgTime) {
      markdown += ` *(${msgTime})*`;
    }
    markdown += `\n\n`;
    markdown += `${textContent}\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Format messages for JSON export
 */
export function exportToJSON(messages: any[]): string {
  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages
      .map((msg) => {
        const rawParts: any[] = (msg as any).parts ?? [];
        const textParts = rawParts.filter((p: any) => p.type === "text");
        const textContent: string = (
          textParts.map((p: any) => p.text).join("") ||
          (msg as any).content ||
          ""
        );

        // Skip synthetic messages
        if (msg.role === "user" && textParts.length === 0) {
          return null;
        }

        return {
          id: msg.id,
          role: msg.role,
          content: textContent,
          timestamp: msg.createdAt ? new Date(msg.createdAt).toISOString() : null,
          toolInvocations: rawParts
            .filter((p: any) => p.type?.startsWith("tool-") || p.type === "tool-invocation")
            .map((ti: any) => ({
              toolName: ti.toolName ?? ti.type?.split("-").slice(1).join("-"),
              toolCallId: ti.toolCallId,
              input: ti.input,
              state: ti.state,
            })),
        };
      })
      .filter(Boolean),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(format: "md" | "json"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const timestamp = `${year}${month}${date}-${hours}${minutes}`;
  const ext = format === "md" ? "md" : "json";

  return `chat-${timestamp}.${ext}`;
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { 
    type: filename.endsWith(".json") ? "application/json" : "text/markdown"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export chat messages to Markdown file
 */
export function exportChatAsMarkdown(messages: any[]): void {
  const markdown = exportToMarkdown(messages);
  const filename = generateFilename("md");
  downloadFile(markdown, filename);
}

/**
 * Export chat messages to JSON file
 */
export function exportChatAsJSON(messages: any[]): void {
  const json = exportToJSON(messages);
  const filename = generateFilename("json");
  downloadFile(json, filename);
}
