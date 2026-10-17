"use client";

import { useEffect } from "react";

/**
 * DalaBoot keeps the transplanted Dala landing runtime alive in a React app.
 *
 * The landing markup in `DALA_CONTENT_HTML` ends with three classic scripts
 * (manifest -> vendor -> theme). On a full page load the browser parser runs
 * them while the document is parsed: the inline flag right before the first
 * script marks that, and the theme boots on the native `DOMContentLoaded`
 * event - so the first mount here does nothing.
 *
 * When the landing is rendered client-side (navigated to from another route)
 * or re-entered after leaving, an HTML parser never executes scripts inserted
 * through innerHTML. This component therefore appends the same three scripts
 * in order and replays `DOMContentLoaded` once the last one has executed.
 *
 * If the runtime still has not booted (`<div class="asscrollbar">` missing)
 * ~9 seconds later, one guarded `location.reload()` is issued (the session
 * storage timestamp prevents reload loops).
 */

const DALA_SCRIPTS = [
  "/dala/scripts/manifest.js?id=56c180749f72ce2fab44",
  "/dala/scripts/vendor.js?id=5cba2073b4fe69285205",
  "/dala/scripts/theme.js?id=f72e8450ba238dbf931f",
];

const BOOT_MARKER = ".asscrollbar";
const BOOT_GRACE_MS = 9000;
const RELOAD_GUARD_MS = 20000;
const RELOAD_KEY = "__dala_reload_at";

declare global {
  interface Window {
    __dalaScriptsRequested?: boolean;
  }
}

let effectRuns = 0;
let lastEffectAt = 0;

function scheduleReloadGuard(): number {
  return window.setTimeout(() => {
    if (document.querySelector(BOOT_MARKER)) return;
    try {
      const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
      if (last && Date.now() - last < RELOAD_GUARD_MS) return; // no reload loops
      window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      return; // session storage unavailable - do not risk a loop
    }
    window.location.reload();
  }, BOOT_GRACE_MS);
}

export function DalaBoot() {
  useEffect(() => {
    // Read the flag at mount time: the bundle may evaluate before the parser
    // reaches the inline flag script, but by the first mount it is reliable.
    const parseHadScripts = !!window.__dalaScriptsRequested;

    // React StrictMode replays effects immediately on mount; treat that as the
    // same first run, but treat a later remount (leave & re-enter) as re-entry.
    const now = Date.now();
    const immediateRerun = now - lastEffectAt < 1000;
    effectRuns += 1;
    lastEffectAt = now;
    const firstRunThisDocument = effectRuns === 1 || immediateRerun;

    if (parseHadScripts && firstRunThisDocument) {
      // Full page load: the parser already executed the scripts and the theme
      // boots on the native DOMContentLoaded event. Nothing to do.
      return;
    }

    const appended: HTMLScriptElement[] = [];

    DALA_SCRIPTS.forEach((src, index) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = false; // keep manifest -> vendor -> theme execution order
      el.dataset.dalaBoot = "1";
      if (index === DALA_SCRIPTS.length - 1) {
        el.addEventListener("load", () => {
          // theme.js registers its boot listener on DOMContentLoaded; the
          // native event has long fired by now, so replay it.
          window.dispatchEvent(new Event("DOMContentLoaded"));
        });
      }
      document.body.appendChild(el);
      appended.push(el);
    });

    const graceTimer = scheduleReloadGuard();

    return () => {
      window.clearTimeout(graceTimer);
      appended.forEach((el) => el.remove());
      // When the landing is left through client-side navigation, undo the
      // scroll state ASScroll applied to <body> and drop its scrollbar node.
      window.setTimeout(() => {
        if (document.querySelector("[asscroll-container]")) return;
        document.body.style.removeProperty("height");
        document.body.style.removeProperty("user-select");
        const bar = document.querySelector(BOOT_MARKER);
        if (bar && bar.parentElement) bar.parentElement.removeChild(bar);
      }, 0);
    };
  }, []);

  return null;
}
