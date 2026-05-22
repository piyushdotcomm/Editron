import "server-only";

import { templates } from "@/lib/constants/templates";
import type { TemplateSummary } from "@/lib/templates/types";

/**
 * Synchronous helper kept for the static API route (`/api/templates/meta`)
 * which cannot be async.  All other consumers should prefer the server
 * actions in `@/lib/templates/actions`.
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