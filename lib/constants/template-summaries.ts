import "server-only";

import { templates } from "@/lib/constants/templates";
import type { TemplateSummary } from "@/lib/templates/types";

/**
 * Synchronous helper kept for the static API route (`/api/templates/meta`).
 * That route implements GET synchronously and is forced static
 * (`export const dynamic = "force-static"`), so this helper is kept
 * synchronous to match the route's static/pure-data nature.
 *
 * @deprecated Use {@link import("@/lib/templates/actions").getTemplateSummaries} instead.
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