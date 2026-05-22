import { describe, it, expect } from "vitest";
import { getTemplateSummaries, getPopularTemplateSummaries } from "./actions";

describe("getTemplateSummaries", () => {
    it("returns a non-empty array", async () => {
        const summaries = await getTemplateSummaries();
        expect(summaries.length).toBeGreaterThan(0);
    });

    it("each summary has the expected shape", async () => {
        const summaries = await getTemplateSummaries();

        for (const s of summaries) {
            expect(s).toHaveProperty("id");
            expect(s).toHaveProperty("name");
            expect(s).toHaveProperty("description");
            expect(s).toHaveProperty("icon");
            expect(s).toHaveProperty("features");
            expect(typeof s.id).toBe("string");
            expect(typeof s.name).toBe("string");
            expect(Array.isArray(s.features)).toBe(true);
        }
    });

    it("does not leak extra TemplateOption fields", async () => {
        const summaries = await getTemplateSummaries();
        const allowedKeys = new Set([
            "id",
            "name",
            "description",
            "icon",
            "color",
            "popularity",
            "tags",
            "features",
            "category",
        ]);

        for (const s of summaries) {
            for (const key of Object.keys(s)) {
                expect(allowedKeys.has(key)).toBe(true);
            }
        }
    });
});

describe("getPopularTemplateSummaries", () => {
    it("returns at most `limit` items", async () => {
        const summaries = await getPopularTemplateSummaries(2);
        expect(summaries.length).toBeLessThanOrEqual(2);
    });

    it("only returns templates with popularity === 5", async () => {
        const summaries = await getPopularTemplateSummaries(100);

        for (const s of summaries) {
            expect(s.popularity).toBe(5);
        }
    });

    it("defaults to 4 when no limit is given", async () => {
        const summaries = await getPopularTemplateSummaries();
        expect(summaries.length).toBeLessThanOrEqual(4);
    });
});
