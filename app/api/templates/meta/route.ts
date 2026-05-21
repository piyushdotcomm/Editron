import { NextResponse } from "next/server";
import { getTemplateSummariesWithMeta } from "@/lib/constants/template-summaries";

export const dynamic = "force-static";

export function GET() {
  const summaries = getTemplateSummariesWithMeta();
  return NextResponse.json(summaries);
}
