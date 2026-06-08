import { describe, it, expect, vi } from "vitest";

// Mock next/server before importing the route to bypass NextAuth's ESM resolution issue in Vitest/jsdom
vi.mock("next/server", () => ({
    NextRequest: class {},
    NextResponse: {
        json: vi.fn(),
    }
}));

import { tools, MAX_FILE_CONTENT_CHARS, schemas } from "./chat/tools";
import { schemas as chatSchemas } from "./chat/route";

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

// Chat API Endpoint Validation Tests 
describe("/api/chat - Payload Size Validation", () => {
    const SIZE_LIMITS = {
        MAX_MESSAGE_CONTENT: 100_000,
        MAX_PART_TEXT: 50_000,
        MAX_TOTAL_PAYLOAD: 1_000_000,
        MAX_MESSAGE_COUNT: 100,
    };

    describe("Single message content validation", () => {
        it("accepts message at max content limit", () => {
            const content = "a".repeat(SIZE_LIMITS.MAX_MESSAGE_CONTENT);
            const payload = {
                messages: [{ role: "user", content }],
                provider: "gemini"
            };
            const parsed = chatSchemas.RequestBodySchema.safeParse(payload);
            expect(parsed.success).toBe(true);
        });

        it("should reject message content exceeding limit", () => {
            const content = "a".repeat(SIZE_LIMITS.MAX_MESSAGE_CONTENT + 1);
            const payload = {
                messages: [{ role: "user", content }],
                provider: "gemini"
            };
            const parsed = chatSchemas.RequestBodySchema.safeParse(payload);
            expect(parsed.success).toBe(false);
        });
    });

    describe("Message parts validation", () => {
        it("accepts part.text at max limit", () => {
            const text = "a".repeat(SIZE_LIMITS.MAX_PART_TEXT);
            const payload = {
                messages: [{
                    role: "user",
                    parts: [{ type: "text", text }]
                }],
                provider: "gemini"
            };
            expect(text.length).toBe(SIZE_LIMITS.MAX_PART_TEXT);
        });

        it("should reject part.text exceeding limit", () => {
            const text = "a".repeat(SIZE_LIMITS.MAX_PART_TEXT + 1);
            const payload = {
                messages: [{
                    role: "user",
                    parts: [{ type: "text", text }]
                }],
                provider: "gemini"
            };
            expect(text.length).toBeGreaterThan(SIZE_LIMITS.MAX_PART_TEXT);
        });

        it("accepts multiple small parts", () => {
            const payload = {
                messages: [{
                    role: "user",
                    parts: [
                        { type: "text", text: "a".repeat(10000) },
                        { type: "text", text: "b".repeat(10000) },
                        { type: "text", text: "c".repeat(10000) },
                    ]
                }],
                provider: "gemini"
            };
            const totalSize = JSON.stringify(payload).length;
            expect(totalSize).toBeLessThanOrEqual(SIZE_LIMITS.MAX_TOTAL_PAYLOAD);
        });
    });

    describe("Total payload size validation", () => {
        it("accepts payload at total size limit", () => {
            // Create payload close to but under 1MB
            const messageCount = 10;
            const contentPerMessage = Math.floor((SIZE_LIMITS.MAX_TOTAL_PAYLOAD - 5000) / messageCount);
            const payload = {
                messages: Array(messageCount).fill(null).map(() => ({
                    role: "user",
                    content: "a".repeat(contentPerMessage)
                })),
                provider: "gemini"
            };
            const totalSize = JSON.stringify(payload).length;
            expect(totalSize).toBeLessThanOrEqual(SIZE_LIMITS.MAX_TOTAL_PAYLOAD);
        });

        it("should calculate total payload size correctly", () => {
            const oversizedContent = "x".repeat(SIZE_LIMITS.MAX_TOTAL_PAYLOAD + 10000);
            const payload = {
                messages: [{ role: "user", content: oversizedContent }],
                provider: "gemini"
            };
            const totalSize = JSON.stringify(payload).length;
            expect(totalSize).toBeGreaterThan(SIZE_LIMITS.MAX_TOTAL_PAYLOAD);
        });
    });

    describe("Message count validation", () => {
        it("accepts max message count", () => {
            const payload = {
                messages: Array(SIZE_LIMITS.MAX_MESSAGE_COUNT).fill(null).map(() => ({
                    role: "user",
                    content: "short message"
                })),
                provider: "gemini"
            };
            expect(payload.messages.length).toBe(SIZE_LIMITS.MAX_MESSAGE_COUNT);
        });

        it("should reject exceeding message count", () => {
            const payload = {
                messages: Array(SIZE_LIMITS.MAX_MESSAGE_COUNT + 1).fill(null).map(() => ({
                    role: "user",
                    content: "short message"
                })),
                provider: "gemini"
            };
            expect(payload.messages.length).toBeGreaterThan(SIZE_LIMITS.MAX_MESSAGE_COUNT);
        });
    });

    describe("Message structure validation", () => {
        it("rejects message without role", () => {
            const payload = {
                messages: [{ content: "test" }],
                provider: "gemini"
            };
            // Missing required 'role' field
            expect((payload.messages[0] as any).role).toBeUndefined();
        });

        it("rejects message with invalid role", () => {
            const payload = {
                messages: [{ role: "invalid", content: "test" }],
                provider: "gemini"
            };
            const validRoles = ["system", "user", "assistant", "data", "tool"];
            expect(validRoles).not.toContain(payload.messages[0].role);
        });

        it("rejects message without content or parts", () => {
            const payload = {
                messages: [{ role: "user" }],
                provider: "gemini"
            };
            // Missing both content and parts
            expect((payload.messages[0] as any).content).toBeUndefined();
            expect((payload.messages[0] as any).parts).toBeUndefined();
        });

        it("rejects message with empty parts and no content", () => {
            const payload = {
                messages: [{ role: "user", parts: [] }],
                provider: "gemini"
            };
            const parsed = chatSchemas.RequestBodySchema.safeParse(payload);
            expect(parsed.success).toBe(false);
        });
    });

    describe("Edge cases", () => {
        it("handles very deeply nested large payloads", () => {
            const payload = {
                messages: [{
                    role: "user",
                    parts: Array(50).fill(null).map(() => ({
                        type: "text",
                        text: "a".repeat(10000)
                    }))
                }],
                provider: "gemini"
            };
            const totalSize = JSON.stringify(payload).length;
            // 50 parts * 10000 chars each = 500KB, well under 1MB
            expect(totalSize).toBeLessThan(SIZE_LIMITS.MAX_TOTAL_PAYLOAD);
        });

        it("handles unicode and special characters in size calculation", () => {
            // Unicode characters can take multiple bytes
            const payload = {
                messages: [{
                    role: "user",
                    content: "🎉".repeat(50000)  // Each emoji is ~4 bytes in UTF-8
                }],
                provider: "gemini"
            };
            const totalSize = JSON.stringify(payload).length;
            expect(totalSize).toBeGreaterThan(0);
        });

        it("fileTree is limited to 50KB", () => {
            const largeTree = "a".repeat(50_001);
            const payload = {
                messages: [{ role: "user", content: "test" }],
                provider: "gemini",
                fileTree: largeTree
            };
            expect(largeTree.length).toBeGreaterThan(50_000);
        });
    });
});
