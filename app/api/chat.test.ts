import { describe, it, expect } from "vitest";
import { tools } from "./chat/route";

describe("AI tool payload validation", () => {
    const MAX = 100_000;

    it("accepts content at the limit", () => {
        const content = "a".repeat(MAX);
        const parsed = tools.edit_file.inputSchema.safeParse({ path: "test.txt", content });
        expect(parsed.success).toBe(true);
    });

    it("rejects content 1 char over the limit", () => {
        const content = "a".repeat(MAX + 1);
        const parsed = tools.edit_file.inputSchema.safeParse({ path: "test.txt", content });
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
            const msgs = parsed.error.issues.map(i => i.message).join(" ");
            expect(msgs).toMatch(/exceeds/);
        }
    });

    it("rejects very large payloads without crashing", () => {
        const content = "a".repeat(MAX * 10);
        const parsed = tools.edit_file.inputSchema.safeParse({ path: "big.txt", content });
        expect(parsed.success).toBe(false);
    });

    it("batch changes validation: one oversized file fails", () => {
        const ok = { path: "ok.txt", content: "a".repeat(1000) };
        const bad = { path: "bad.txt", content: "a".repeat(MAX + 5) };
        const parsed = tools.edit_multiple_files.inputSchema.safeParse({ changes: [ok, bad] });
        expect(parsed.success).toBe(false);
    });
});
