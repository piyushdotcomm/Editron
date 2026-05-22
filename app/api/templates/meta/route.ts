import { NextResponse } from "next/server";
import { getTemplateSummariesWithMeta } from "@/lib/constants/template-summaries";

// Static generation: this response is computed once at build time.
// The heavy templates.ts data never reaches any client bundle.
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  const summaries = getTemplateSummariesWithMeta();
  return NextResponse.json(summaries, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}