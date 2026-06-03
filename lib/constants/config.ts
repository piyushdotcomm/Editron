/**
 * Centralized application configuration constants.
 *
 * This file contains shared configuration values used across the application,
 * including API endpoints, LocalStorage keys, default editor settings,
 * and reusable timeout durations.
 *
 * Centralizing these values improves maintainability, consistency,
 * and makes future environment/config updates easier.
 */

export const APP_NAME = "Editron";
// API URLs
export const NPM_REGISTRY_SEARCH_URL =
  "https://registry.npmjs.org/-/v1/search";

export const NETLIFY_API = {
  SITES: "https://api.netlify.com/api/v1/sites",
  SITE_DEPLOYS: (siteId: string) =>
    `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
} as const;

export const VERCEL_API = {
  DEPLOYMENTS: "https://api.vercel.com/v13/deployments",
} as const;

// ── LocalStorage Keys ──────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  GEMINI_KEY: "editron_gemini_key",
  GROQ_KEY: "editron_groq_key",
  MISTRAL_KEY: "editron_mistral_key",
  INLINE_SUGGESTIONS: "editron_inline_suggestions",
  EDITOR_THEME: "editron_editor_theme",
} as const;

// ── Default Values ─────────────────────────────────────────────────────────

export const DEFAULT_EDITOR_THEME = "vs-dark";

// ── Timeout Durations (ms) ─────────────────────────────────────────────────

export const TIMEOUTS = {
  COPY_RESET: 2000,
  CHAT_INPUT_FOCUS: 300,
  EDITOR_DEBOUNCE: 1500,
} as const;

// ── Editor Configuration ───────────────────────────────────────────────────

export const EDITOR_CONFIG = {
  INLINE_SUGGESTION_DEBOUNCE_MS: 1500,
} as const;
