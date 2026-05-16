import { NextResponse } from "next/server";
import { getTemplateSummaries } from "../../../lib/constants/templates";

export async function GET() {
  const summaries = await getTemplateSummaries();
  return NextResponse.json(summaries);
}
