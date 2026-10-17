"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * DalaBoot keeps the transplanted Dala landing runtime alive in a React app.
 *
 * The landing markup in `DALA_CONTENT_HTML` ends with three classic scripts
 * (manifest -> vendor -> theme). On a full page load the browser parser runs
 * them while the document is parsed: an inline flag script right before the
 * first script marks itself with `data-dala-ran="1"`, and the patched theme
 * boots the moment it executes - so the first mount here does nothing.
 *
 * When the landing is rendered client-side (navigated to from another route)
 * or re-entered after leaving, an HTML parser never executes scripts inserted
 * through innerHTML. This component therefore appends the same three scripts
 * in order; the patched theme boots itself (it no longer waits for a
 * DOMContentLoaded that already fired), so no synthetic event is replayed and
 * stale listeners from earlier executions can never stack up.
 *
 * If a script fails to load, the full-screen `.js-site-loader` is dismissed so
 * the static landing stays readable. If the runtime still has not booted
 * (`<div class="asscrollbar">` missing) ~9 seconds later, one guarded
 * `location.reload()` is issued (the session storage timestamp prevents
 * reload loops).
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
const RUNTIME_FLAG = 'script[data-dala-ran="1"]';
const STYLESHEET_SELECTOR = 'link[data-dala-style="1"]';
const EMBED_SELECTOR = "[data-dala-embed]";
const STYLE_WAIT_MS = 3000;

// `useLayoutEffect` warns during SSR; fall back to `useEffect` on the server.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

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

/** Static fallback: drop the full-screen loader when the runtime cannot boot. */
function revealStaticLanding(): void {
  const loader = document.querySelector<HTMLElement>(".js-site-loader");
  if (!loader) return;
  loader.style.opacity = "0";
  loader.style.visibility = "hidden";
  loader.style.pointerEvents = "none";
}

export function DalaBoot() {
  // On a client-side entry the landing stylesheet still has to load, and the
  // unstyled markup would flash before it applies. Hide the embed until the
  // link is ready; layout effect so the hide happens before that first paint.
  useIsomorphicLayoutEffect(() => {
    const link = document.querySelector<HTMLLinkElement>(STYLESHEET_SELECTOR);
    const embed = document.querySelector<HTMLElement>(EMBED_SELECTOR);
    if (!link || !embed) return;

    let revealed = false;
    let timer = 0;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.clearTimeout(timer);
      embed.style.visibility = "";
    };

    if (link.sheet) {
      // Full page load: the stylesheet is already applied (render-blocking).
      return;
    }

    embed.style.visibility = "hidden";
    link.addEventListener("load", reveal);
    link.addEventListener("error", reveal);
    timer = window.setTimeout(reveal, STYLE_WAIT_MS);

    return () => {
      window.clearTimeout(timer);
      link.removeEventListener("load", reveal);
      link.removeEventListener("error", reveal);
      if (!revealed) embed.style.visibility = "";
    };
  }, []);

  useEffect(() => {
    // Full page load: the parser executed the embedded scripts (the inline
    // flag script marks itself), so the theme already boots on its own.
    if (document.querySelector(RUNTIME_FLAG)) return;

    let graceTimer = 0;
    const appended: HTMLScriptElement[] = [];
    const detachListeners: Array<() => void> = [];

    DALA_SCRIPTS.forEach((src) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = false; // keep manifest -> vendor -> theme execution order
      el.dataset.dalaBoot = "1";
      const onError = () => {
        // The runtime cannot boot: expose the static landing instead of the
        // full-screen loader and defuse the reload guard.
        window.clearTimeout(graceTimer);
        revealStaticLanding();
      };
      el.addEventListener("error", onError);
      detachListeners.push(() => el.removeEventListener("error", onError));
      document.body.appendChild(el);
      appended.push(el);
    });

    graceTimer = scheduleReloadGuard();

    return () => {
      window.clearTimeout(graceTimer);
      detachListeners.forEach((detach) => detach());
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
