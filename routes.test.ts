import { describe, expect, it } from "vitest";

import { publicRoutes } from "./routes";

describe("publicRoutes", () => {
  it("keeps the templates catalog public for logged-out users", () => {
    expect(publicRoutes).toContain("/templates");
  });
});
