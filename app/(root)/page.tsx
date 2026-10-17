import { DALA_CONTENT_HTML } from "@/components/marketing/dala-content-html";
import { DalaBoot } from "@/components/marketing/dala-boot";

/**
 * Editron landing page — Dala layout transplant (see dala-recon/build-port.js).
 *
 * The markup is the original Dala landing body, kept verbatim (structure,
 * classes, motion markup) with Editron texts and links baked in. It ships with
 * the three runtime scripts at its end: on a full page load the parser runs
 * them and they boot on DOMContentLoaded; DalaBoot covers client-side
 * navigation, where innerHTML never executes scripts.
 */

const FONT_PRELOADS = [
  "/dala/fonts/PPNeueMontreal-Light.woff2?6b8baf9c2be548c40ad3d89e520b72ac",
  "/dala/fonts/PPNeueMontreal-Regular.woff2?e975bf8371aec1efabce9f2164d14431",
  "/dala/fonts/PPNeueMontreal-SemiBold.woff2?82363d624b471941cd6b3f2e06777e06",
];

export default function Home() {
  return (
    <>
      {FONT_PRELOADS.map((href) => (
        <link
          key={href}
          rel="preload"
          as="font"
          href={href}
          crossOrigin="anonymous"
        />
      ))}
      {/* data-dala-style marks the landing stylesheet for DalaBoot's
          load gate; data-dala-embed marks the subtree it manages. */}
      {/* eslint-disable-next-line @next/next/no-css-tags -- deliberate: the Dala stylesheet must stay a plain route-scoped <link> (see PR #787 review) */}
      <link
        rel="stylesheet"
        data-dala-style="1"
        href="/dala/css/style.css?id=3a3f3a982e763a689cb5"
      />
      {/* The Dala runtime owns this subtree and mutates it on boot (split
          text, slider DOM, etc.) before React hydrates - suppress the
          innerHTML hydration mismatch. */}
      <div
        data-dala-embed
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: DALA_CONTENT_HTML }}
      />
      <DalaBoot />
    </>
  );
}
