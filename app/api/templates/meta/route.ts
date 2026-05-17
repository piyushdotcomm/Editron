import { NextResponse } from "next/server";
import { getTemplateSummariesWithMeta } from "@/lib/constants/templates";

export const dynamic = "force-static";

export function GET() {
  const summaries = getTemplateSummariesWithMeta();
  return NextResponse.json(summaries);
}
