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


// API URLs
export const NPM_REGISTRY_SEARCH_URL =
  "https://registry.npmjs.org/-/v1/search";

// LocalStorage Keys
export const STORAGE_KEYS = {
  GEMINI_API_KEY: "editron_gemini_key",
  GROQ_API_KEY: "editron_groq_key",
  MISTRAL_API_KEY: "editron_mistral_key",
  INLINE_SUGGESTIONS: "editron_inline_suggestions",
  EDITOR_THEME: "editron_editor_theme",
} as const;

// Default Values
export const DEFAULT_EDITOR_THEME = "vs-dark";

// Timeout Durations
export const TIMEOUTS = {
  COPY_RESET: 2000,
  CHAT_INPUT_FOCUS: 300,
  EDITOR_DEBOUNCE: 1500,
} as const;