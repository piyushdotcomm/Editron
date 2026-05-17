import { NextResponse } from "next/server";
import { getTemplateSummaries } from "@/lib/constants/template-summaries";

export const dynamic = "force-static";

export function GET() {
  const summaries = getTemplateSummaries();
  return NextResponse.json(summaries);
}
