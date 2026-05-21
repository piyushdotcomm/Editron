"use server";

import { getTemplateSummariesWithMeta } from "@/lib/constants/template-summaries";
import type { TemplateSummary } from "@/lib/templates/types";

/**
 * Server Action: returns lightweight template summaries.
 * The heavy file-tree data in templates.ts never reaches the client bundle.
 */
export async function fetchTemplateSummaries(): Promise<TemplateSummary[]> {
  return getTemplateSummariesWithMeta();
}