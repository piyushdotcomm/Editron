import "server-only";

import { templates } from "@/lib/constants/templates";
import type { TemplateSummary } from "@/lib/templates/types";

/**
 * Server-side summaries including small UI metadata (color, popularity, tags, features, category).
 * Use only from server components or server API routes to avoid pulling heavy data into client bundles.
 */
export function getTemplateSummariesWithMeta(): TemplateSummary[] {
    return templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        icon: template.icon,
        color: template.color,
        popularity: template.popularity,
        tags: template.tags,
        features: template.features,
        category: template.category,
    }));
}