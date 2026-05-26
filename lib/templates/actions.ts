"use server";

import { templates } from "@/lib/constants/templates";
import type { TemplateSummary } from "@/lib/templates/types";

/**
 * Server Action: returns lightweight template summaries for UI display.
 * Only the fields the client actually needs are serialised, keeping the
 * full TemplateOption array (descriptions, features, etc.) out of the
 * client bundle entirely.
 */
export async function getTemplateSummaries(): Promise<TemplateSummary[]> {
    return templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        icon: t.icon,
        color: t.color,
        popularity: t.popularity,
        tags: t.tags,
        features: t.features,
        category: t.category,
    }));
}

/**
 * Server Action: returns only the popular templates (popularity === 5),
 * capped at `limit` items.  Used by the landing-page hero section so the
 * client receives the absolute minimum payload.
 */
export async function getPopularTemplateSummaries(
    limit = 4,
): Promise<TemplateSummary[]> {
    const sanitizedLimit = Number.isFinite(limit)
        ? Math.max(0, Math.min(Math.floor(limit), templates.length))
        : 4;

    return templates
        .filter((t) => t.popularity === 5)
        .slice(0, sanitizedLimit)
        .map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            icon: t.icon,
            color: t.color,
            popularity: t.popularity,
            tags: t.tags,
            features: t.features,
            category: t.category,
        }));
}
