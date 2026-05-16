import { streamText, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, handleApiError, getClientIp } from "@/lib/api-utils";
import { auth } from "@/auth";
import { tools } from "./tools"; // extract tools + SYSTEM_PROMPT to a sibling module

// ─── Types ────────────────────────────────────────────────────────────────────

/** Supported AI provider identifiers. Extend here to add new providers. */
type ProviderName = "gemini" | "groq" | "mistral";

/**
 * Static configuration for a provider.
 * `envKey`      — process.env key used when the user is authenticated but
 *                 has not supplied their own API key.
 * `modelId`     — model string forwarded to the provider SDK.
 * `makeModel`   — factory: given a resolved API key, return an AI SDK model.
 */
interface ProviderConfig {
  envKey: string;
  modelId: string;
  makeModel: (apiKey: string) => ReturnType<typeof createGoogleGenerativeAI | typeof createGroq | typeof createMistral> extends infer R
    ? (modelId: string) => unknown
    : never;
}

// ─── Provider Registry ────────────────────────────────────────────────────────

/**
 * Single source of truth for every provider.
 * To add a new provider: add one entry here and update `ProviderName`.
 */
const PROVIDER_CONFIG: Record<ProviderName, {
  envKey: string;
  makeModel: (apiKey: string) => unknown;
}> = {
  gemini: {
    envKey: "GEMINI_API_KEY",
    makeModel: (apiKey) => createGoogleGenerativeAI({ apiKey })("gemini-2.0-flash"),
  },
  groq: {
    envKey: "GROQ_API_KEY",
    makeModel: (apiKey) => createGroq({ apiKey })("llama-3.1-70b-versatile"),
  },
  mistral: {
    envKey: "MISTRAL_API_KEY",
    makeModel: (apiKey) => createMistral({ apiKey })("mistral-small-latest"),
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

// ─── Request Schema ───────────────────────────────────────────────────────────

const RequestBodySchema = z.object({
  messages:   z.array(z.any()).max(100),
  provider:   z.enum(["gemini", "groq", "mistral"]).optional().default("gemini"),
  fileTree:   z.string().max(50_000).optional(),
  userApiKey: z.string().max(256).optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve the API key for a provider.
 * Precedence: user-supplied key → server env key (authenticated users only).
 * Returns `null` when no key is available, which the caller treats as an error.
 */
function resolveApiKey(
  userApiKey: string | undefined,
  isAuthenticated: boolean,
  envKey: string,
): string | null {
  if (userApiKey?.trim()) return userApiKey.trim();
  if (isAuthenticated) return process.env[envKey] ?? null;
  return null;
}

/**
 * Build the model instance for the requested provider.
 * Returns `{ model }` on success or a `NextResponse` error on failure.
 */
function buildModel(
  provider: ProviderName,
  userApiKey: string | undefined,
  isAuthenticated: boolean,
): { model: unknown } | NextResponse {
  const config = PROVIDER_CONFIG[provider];
  const apiKey = resolveApiKey(userApiKey, isAuthenticated, config.envKey);

  if (!apiKey) {
    const error = isAuthenticated
      ? `${capitalize(provider)} API key not configured. Add your key in AI settings.`
      : "Unauthorized";
    return NextResponse.json(
      { success: false, error },
      { status: isAuthenticated ? 400 : 401 },
    );
  }

  return { model: config.makeModel(apiKey) };
}

/** Capitalize the first character of a string (used in error messages). */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Message Sanitization ─────────────────────────────────────────────────────

type MessagePart = { type: string; text: string };
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content?: string;
  parts?: MessagePart[];
};

/**
 * Ensure every message has a `parts` array as expected by `convertToModelMessages`.
 * Returns a `NextResponse` error if a message is not a valid object.
 */
function sanitizeMessages(
  raw: unknown[],
): ChatMessage[] | NextResponse {
  const sanitized: ChatMessage[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request: each message must be an object" },
        { status: 400 },
      );
    }

    const m = item as ChatMessage;

    if (Array.isArray(m.parts)) {
      sanitized.push(m);
      continue;
    }

    sanitized.push({
      ...m,
      parts:
        typeof m.content === "string" && m.content.trim()
          ? [{ type: "text", text: m.content }]
          : [],
    });
  }

  return sanitized;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────
    const ip = getClientIp(request);
    const { allowed, remaining } = rateLimit(ip, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MS);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait before sending more messages." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Remaining": String(remaining),
          },
        },
      );
    }

    // ── Auth ─────────────────────────────────────────────────────────────
    const session = await auth();
    const isAuthenticated = !!session?.user;

    // ── Request validation ───────────────────────────────────────────────
    const body = await request.json();
    const parsed = RequestBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { messages, provider, fileTree, userApiKey } = parsed.data;

    // Require either a logged-in session or a user-supplied API key.
    if (!isAuthenticated && !userApiKey?.trim()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in or provide your own API key in settings." },
        { status: 401 },
      );
    }

    // ── Model resolution ─────────────────────────────────────────────────
    const modelResult = buildModel(provider, userApiKey, isAuthenticated);

    // `buildModel` returns a NextResponse when key resolution fails.
    if (modelResult instanceof NextResponse) return modelResult;

    // ── Message sanitization ─────────────────────────────────────────────
    const sanitized = sanitizeMessages(messages);

    if (sanitized instanceof NextResponse) return sanitized;

    // ── System prompt ────────────────────────────────────────────────────
    const systemInstruction = fileTree
      ? `${SYSTEM_PROMPT}\n\nProject file tree:\n${fileTree}`
      : SYSTEM_PROMPT;

    // ── Stream ───────────────────────────────────────────────────────────
    const stream = streamText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: modelResult.model as any,
      messages: await convertToModelMessages(sanitized, {
        ignoreIncompleteToolCalls: true,
      }),
      system: systemInstruction,
      tools,
    });

    return stream.toUIMessageStreamResponse();
  } catch (error: unknown) {
    return handleApiError(error, "POST /api/chat");
  }
}