"use server";

import { templates, TemplateOption } from "@/lib/constants/templates";

/**
 * Server action to fetch the template options.
 * This decouples the massive templates static data from the client bundles,
 * keeping the bundles light and optimizing page-load performance.
 */
export async function getTemplates(): Promise<TemplateOption[]> {
  "use cache";
  return templates;
}
