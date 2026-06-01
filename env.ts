import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),

    // ❗ IMPORTANT: optional hata diya
    AUTH_SECRET: z.string().min(1),

    GEMINI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    MISTRAL_API_KEY: z.string().optional(),

    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_COLLAB_SERVER_URL: z.string().optional(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_COLLAB_SERVER_URL:
      process.env.NEXT_PUBLIC_COLLAB_SERVER_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});