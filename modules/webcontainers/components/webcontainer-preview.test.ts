/**
 * @vitest-environment jsdom
 *
 * Tests for webcontainer-preview helper functions
 */

import { describe, it, expect } from "vitest";
import { getScriptFromPkg } from "./webcontainer-preview";

describe("getScriptFromPkg", () => {
  it("returns 'dev' when dev script exists", () => {
    const pkg = JSON.stringify({ scripts: { dev: "vite" } });
    expect(getScriptFromPkg(pkg)).toBe("dev");
  });

  it("returns 'start' when only start script exists", () => {
    const pkg = JSON.stringify({ scripts: { start: "node server.js" } });
    expect(getScriptFromPkg(pkg)).toBe("start");
  });

  it("returns 'serve' when only serve script exists", () => {
    const pkg = JSON.stringify({ scripts: { serve: "vite preview" } });
    expect(getScriptFromPkg(pkg)).toBe("serve");
  });

  it("prefers 'dev' over 'start' when both exist", () => {
    const pkg = JSON.stringify({ scripts: { dev: "vite", start: "node server.js" } });
    expect(getScriptFromPkg(pkg)).toBe("dev");
  });

  it("prefers 'start' over 'serve' when both exist", () => {
    const pkg = JSON.stringify({ scripts: { start: "node server.js", serve: "vite preview" } });
    expect(getScriptFromPkg(pkg)).toBe("start");
  });

  it("returns null when no scripts exist", () => {
    const pkg = JSON.stringify({ name: "test" });
    expect(getScriptFromPkg(pkg)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(getScriptFromPkg("invalid json")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getScriptFromPkg(null)).toBeNull();
  });
});
