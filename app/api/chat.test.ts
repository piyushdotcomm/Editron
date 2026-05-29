import { describe, it, expect, vi } from "vitest";

// Mock next/server before importing the route to bypass NextAuth's ESM resolution issue in Vitest/jsdom
vi.mock("next/server", () => ({
    NextRequest: class {},
    NextResponse: {
        json: vi.fn(),
    }
}));

import { MAX_FILE_CONTENT_CHARS, schemas } from "./chat/tools";

describe("AI tool payload validation", () => {
    const MAX = MAX_FILE_CONTENT_CHARS;

    it("accepts content at the limit", () => {
        const content = "a".repeat(MAX);
        const parsed = schemas.edit_file.safeParse({ path: "test.txt", content });
        expect(parsed.success).toBe(true);
    });

    it("rejects content 1 char over the limit", () => {
        const content = "a".repeat(MAX + 1);
        const parsed = schemas.edit_file.safeParse({ path: "test.txt", content });
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
            const msgs = parsed.error.issues.map((i) => i.message).join(" ");
            expect(msgs).toMatch(/exceeds/);
        }
    });

    it("rejects very large payloads without crashing", () => {
        const content = "a".repeat(MAX * 10);
        const parsed = schemas.edit_file.safeParse({ path: "big.txt", content });
        expect(parsed.success).toBe(false);
    });

    it("batch changes validation: one oversized file fails", () => {
        const ok = { path: "ok.txt", content: "a".repeat(1000) };
        const bad = { path: "bad.txt", content: "a".repeat(MAX + 5) };
        const parsed = schemas.edit_multiple_files.safeParse({ changes: [ok, bad] });
        expect(parsed.success).toBe(false);
    });
});
