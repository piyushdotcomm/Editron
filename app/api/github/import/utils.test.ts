import { describe, expect, it } from "vitest";
import { buildTemplateFolderFromEntries, parseGitHubRepoUrl } from "./utils";

describe("parseGitHubRepoUrl", () => {
  it("parses a standard repository URL", () => {
    expect(parseGitHubRepoUrl("https://github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
      path: undefined,
    });
  });

  it("parses a tree URL and preserves the nested path", () => {
    expect(parseGitHubRepoUrl("https://github.com/vercel/next.js/tree/main/examples/blog")).toEqual({
      owner: "vercel",
      repo: "next.js",
      branch: "main",
      path: "examples/blog",
    });
  });

  it("rejects non-GitHub URLs", () => {
    expect(parseGitHubRepoUrl("https://gitlab.com/example/repo")).toBeNull();
  });

  it("rejects issue URLs instead of treating them like subpaths", () => {
    expect(parseGitHubRepoUrl("https://github.com/vercel/next.js/issues/123")).toBeNull();
  });
});

describe("buildTemplateFolderFromEntries", () => {
  it("creates a nested template folder from flat GitHub file entries", () => {
    const result = buildTemplateFolderFromEntries("repo", [
      { path: "src/index.tsx", content: "console.log('hi');", size: 18 },
      { path: "src/components/Button.tsx", content: "export const Button = () => null;", size: 33 },
      { path: "package.json", content: "{}", size: 2 },
    ]);

    expect(result.folderName).toBe("repo");
    expect(result.items).toHaveLength(2);

    const srcFolder = result.items.find((item) => "folderName" in item && item.folderName === "src");
    expect(srcFolder && "folderName" in srcFolder).toBe(true);
  });

  it("skips binary files and hidden paths", () => {
    const result = buildTemplateFolderFromEntries("repo", [
      { path: ".git/config", content: "ignore", size: 6 },
      { path: "assets/logo.png", content: "binary", size: 6 },
      { path: "src/app.ts", content: "export {}", size: 9 },
    ]);

    expect(result.items).toHaveLength(1);
  });
});
