import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (must come before route import) ─────────────────────────────────────
vi.mock("next/server", () => ({
    NextRequest: class {},
    NextResponse: {
        json: vi.fn((body: unknown, init?: { status?: number }) => ({
            body,
            status: init?.status ?? 200,
        })),
    },
}));

vi.mock("@/auth", () => ({
    auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/api-utils", () => ({
    rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 19 }),
    handleApiError: vi.fn((err: unknown) => ({ status: 500, body: { error: String(err) } })),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@ai-sdk/google", () => ({ createGoogleGenerativeAI: vi.fn(() => () => "gemini-mock") }));
vi.mock("@ai-sdk/groq", () => ({ createGroq: vi.fn(() => () => "groq-mock") }));
vi.mock("@ai-sdk/mistral", () => ({ createMistral: vi.fn(() => () => "mistral-mock") }));

vi.mock("ai", () => ({
    streamText: vi.fn(() => ({
        toUIMessageStreamResponse: vi.fn(() => ({ status: 200 })),
    })),
    convertToModelMessages: vi.fn().mockResolvedValue([]),
}));

vi.mock("./chat/tools", async importOriginal => {
    const actual = await importOriginal<typeof import("./chat/tools")>();

    return {
        ...actual,
        tools: {},
    };
});

// ── Helpers ───────────────────────────────────────────────────────────────────
import { MAX_FILE_CONTENT_CHARS, schemas } from "./chat/tools";
import { NextResponse } from "next/server";

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 10_000;
const MAX_PARTS = 20;
const MAX_PART_TEXT = 5_000;
const MAX_BODY_BYTES = 1_000_000;

/** Build a minimal fake NextRequest */
function makeRequest(body: unknown, options: { contentLength?: number } = {}) {
    const json = JSON.stringify(body);

    return {
        headers: {
            get: (key: string) => {
                if (key === "content-length") {
                    return options.contentLength !== undefined
                        ? String(options.contentLength)
                        : String(new TextEncoder().encode(json).length);
                }

                return null;
            },
        },
        json: async () => body,
    };
}

/** Valid base message */
const validMsg = { role: "user", content: "Hello" };

// ── Tool payload tests ────────────────────────────────────────────────────────
describe("AI tool payload validation", () => {
    const MAX = MAX_FILE_CONTENT_CHARS;

    it("accepts content at the limit", () => {
        const parsed = schemas.edit_file.safeParse({ path: "test.txt", content: "a".repeat(MAX) });
        expect(parsed.success).toBe(true);
    });

    it("rejects content 1 char over the limit", () => {
        const parsed = schemas.edit_file.safeParse({ path: "test.txt", content: "a".repeat(MAX + 1) });
        expect(parsed.success).toBe(false);

        if (!parsed.success) {
            expect(parsed.error.issues.map(i => i.message).join(" ")).toMatch(/exceeds/i);
        }
    });

    it("rejects very large payloads without crashing", () => {
        const parsed = schemas.edit_file.safeParse({ path: "big.txt", content: "a".repeat(MAX * 10) });
        expect(parsed.success).toBe(false);
    });

    it("batch changes validation: one oversized file fails", () => {
        const parsed = schemas.edit_multiple_files.safeParse({
            changes: [
                { path: "ok.txt", content: "a".repeat(1000) },
                { path: "bad.txt", content: "a".repeat(MAX + 5) },
            ],
        });

        expect(parsed.success).toBe(false);
    });
});

// ── /api/chat route validation tests ─────────────────────────────────────────
describe("POST /api/chat – payload validation", () => {
    type PostFn = (req: ReturnType<typeof makeRequest>) => Promise<{ status: number }>;

    let POST: PostFn;

    beforeEach(async () => {
        vi.clearAllMocks();

        const mod = await import("./chat/route");
        POST = mod.POST as unknown as PostFn;
    });

    it("accepts a valid minimal request with user API key", async () => {
        const req = makeRequest({ messages: [validMsg], userApiKey: "test-key" });
        const res = await POST(req);

        expect(res.status).not.toBe(400);
        expect(res.status).not.toBe(413);
    });

    it("returns 413 when Content-Length header exceeds 1 MB", async () => {
        const req = makeRequest(
            { messages: [validMsg], userApiKey: "key" },
            { contentLength: MAX_BODY_BYTES + 1 }
        );

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 413 })
        );
    });

    it("accepts a request exactly at the 1 MB limit", async () => {
        const req = makeRequest(
            { messages: [validMsg], userApiKey: "key" },
            { contentLength: MAX_BODY_BYTES }
        );

        await POST(req);

        const calls = vi.mocked(NextResponse.json).mock.calls;
        const has413 = calls.some(([, init]) => (init as { status?: number })?.status === 413);
        expect(has413).toBe(false);
    });

    it("returns 400 when messages array exceeds 50 items", async () => {
        const messages = Array.from({ length: MAX_MESSAGES + 1 }, () => ({ ...validMsg }));
        const req = makeRequest({ messages, userApiKey: "key" });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });

    it("accepts exactly 50 messages", async () => {
        const messages = Array.from({ length: MAX_MESSAGES }, () => ({ ...validMsg }));
        const req = makeRequest({ messages, userApiKey: "key" });

        await POST(req);

        const calls = vi.mocked(NextResponse.json).mock.calls;
        const has400 = calls.some(([, init]) => (init as { status?: number })?.status === 400);
        expect(has400).toBe(false);
    });

    it("returns 400 for an empty messages array", async () => {
        const req = makeRequest({ messages: [], userApiKey: "key" });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });

    it("returns 400 when message content exceeds 10,000 characters", async () => {
        const req = makeRequest({
            messages: [{ role: "user", content: "x".repeat(MAX_CONTENT_LENGTH + 1) }],
            userApiKey: "key",
        });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });

    it("accepts message content exactly at 10,000 characters", async () => {
        const req = makeRequest({
            messages: [{ role: "user", content: "x".repeat(MAX_CONTENT_LENGTH) }],
            userApiKey: "key",
        });

        await POST(req);

        const calls = vi.mocked(NextResponse.json).mock.calls;
        const has400 = calls.some(([, init]) => (init as { status?: number })?.status === 400);
        expect(has400).toBe(false);
    });

    it("returns 400 when a message has more than 20 parts", async () => {
        const parts = Array.from({ length: MAX_PARTS + 1 }, () => ({ type: "text", text: "hi" }));
        const req = makeRequest({
            messages: [{ role: "user", parts }],
            userApiKey: "key",
        });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });

    it("accepts a message with exactly 20 parts", async () => {
        const parts = Array.from({ length: MAX_PARTS }, () => ({ type: "text", text: "hi" }));
        const req = makeRequest({
            messages: [{ role: "user", parts }],
            userApiKey: "key",
        });

        await POST(req);

        const calls = vi.mocked(NextResponse.json).mock.calls;
        const has400 = calls.some(([, init]) => (init as { status?: number })?.status === 400);
        expect(has400).toBe(false);
    });

    it("returns 400 when a part text exceeds 5,000 characters", async () => {
        const req = makeRequest({
            messages: [
                {
                    role: "user",
                    parts: [{ type: "text", text: "y".repeat(MAX_PART_TEXT + 1) }],
                },
            ],
            userApiKey: "key",
        });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });

    it("accepts part text exactly at 5,000 characters", async () => {
        const req = makeRequest({
            messages: [
                {
                    role: "user",
                    parts: [{ type: "text", text: "y".repeat(MAX_PART_TEXT) }],
                },
            ],
            userApiKey: "key",
        });

        await POST(req);

        const calls = vi.mocked(NextResponse.json).mock.calls;
        const has400 = calls.some(([, init]) => (init as { status?: number })?.status === 400);
        expect(has400).toBe(false);
    });

    it("returns 400 for a non-object message in the array", async () => {
        const req = makeRequest({
            messages: ["just a string"],
            userApiKey: "key",
        });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });

    it("returns 400 for an invalid role value", async () => {
        const req = makeRequest({
            messages: [{ role: "hacker", content: "hello" }],
            userApiKey: "key",
        });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });

    it("returns 400 for an invalid provider", async () => {
        const req = makeRequest({
            messages: [validMsg],
            provider: "openai",
            userApiKey: "key",
        });

        await POST(req);

        expect(vi.mocked(NextResponse.json)).toHaveBeenCalledWith(
            expect.objectContaining({ success: false }),
            expect.objectContaining({ status: 400 })
        );
    });
});