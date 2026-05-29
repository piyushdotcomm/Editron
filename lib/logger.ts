/**
 * Lightweight logger that suppresses debug/info logs in production.
 * Use this instead of console.log throughout the codebase.
 */
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
    log:   (...args: unknown[]) => { if (isDev) console.log(...args);   },
    info:  (...args: unknown[]) => { if (isDev) console.info(...args);  },
    warn:  (...args: unknown[]) => { if (isDev) console.warn(...args);  },
    error: (...args: unknown[]) => console.error(...args), // always log errors
    debug: (...args: unknown[]) => { if (isDev) console.debug(...args); },
};