/**
 * @vitest-environment jsdom
 *
 * Tests for modules/playground/hooks/useAI.ts
 *
 * Coverage targets:
 *  - collectFilePaths   (pure helper)
 *  - findFileByPath     (pure helper)
 *  - deleteFileByPath   (pure helper)
 *  - addOrUpdateFile    (pure helper)
 *  - useAI              (Zustand store – state actions)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { TemplateFile, TemplateFolder } from "../lib/path-to-json";
import {
  collectFilePaths,
  deleteFileByPath,
  addOrUpdateFile,
  findFileByPath,
  useAI,
} from "./useAI";

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

/**
 * Returns a fresh deep-cloned fixture tree so every test gets a clean slate.
 *
 * Structure:
 *   index.ts
 *   README.md
 *   src/
 *     App.tsx
 *     main.tsx
 *     utils/
 *       helpers.ts
 */
function makeFixture() {
  return [
    { filename: "index",  fileExtension: "ts",  content: "// index" },
    { filename: "README", fileExtension: "md",  content: "# readme" },
    {
      folderName: "src",
      items: [
        { filename: "App",  fileExtension: "tsx", content: "// App"  },
        { filename: "main", fileExtension: "tsx", content: "// main" },
        {
          folderName: "utils",
          items: [
            { filename: "helpers", fileExtension: "ts", content: "// helpers" },
          ],
        },
      ],
    },
  ];
}

// ===========================================================================
// collectFilePaths
// ===========================================================================

describe("collectFilePaths", () => {
  it("collects root-level file paths", () => {
    const items = [
      { filename: "index",  fileExtension: "ts", content: "" },
      { filename: "README", fileExtension: "md", content: "" },
    ];
    expect(collectFilePaths(items)).toEqual(["index.ts", "README.md"]);
  });

  it("appends a trailing slash to folder entries", () => {
    const items = [{ folderName: "src", items: [] }];
    expect(collectFilePaths(items)).toContain("src/");
  });

  it("recursively collects every path in a nested tree", () => {
    const paths = collectFilePaths(makeFixture());
    expect(paths).toContain("index.ts");
    expect(paths).toContain("README.md");
    expect(paths).toContain("src/");
    expect(paths).toContain("src/App.tsx");
    expect(paths).toContain("src/main.tsx");
    expect(paths).toContain("src/utils/");
    expect(paths).toContain("src/utils/helpers.ts");
  });

  it("handles files with no extension", () => {
    const items = [{ filename: "Makefile", fileExtension: "", content: "" }];
    expect(collectFilePaths(items)).toEqual(["Makefile"]);
  });

  it("returns an empty array for an empty list", () => {
    expect(collectFilePaths([])).toEqual([]);
  });

  it("prepends the prefix to every path", () => {
    const items = [{ filename: "config", fileExtension: "json", content: "" }];
    expect(collectFilePaths(items, "root")).toEqual(["root/config.json"]);
  });
});

// ===========================================================================
// findFileByPath
// ===========================================================================

describe("findFileByPath", () => {
  it("finds a root-level file", () => {
    const result = findFileByPath(makeFixture(), "index.ts");
    expect(result).not.toBeNull();
    expect((result as TemplateFile).filename).toBe("index");
  });

  it("finds a first-level nested file", () => {
    const result = findFileByPath(makeFixture(), "src/App.tsx");
    expect(result).not.toBeNull();
    expect((result as TemplateFile).filename).toBe("App");
  });

  it("finds a deeply nested file", () => {
    const result = findFileByPath(makeFixture(), "src/utils/helpers.ts");
    expect(result).not.toBeNull();
    expect((result as TemplateFile).filename).toBe("helpers");
  });

  it("returns null for a path that does not exist", () => {
    expect(findFileByPath(makeFixture(), "doesNotExist.ts")).toBeNull();
  });

  it("is case-sensitive ('Index.ts' ≠ 'index.ts')", () => {
    expect(findFileByPath(makeFixture(), "Index.ts")).toBeNull();
  });
});

// ===========================================================================
// deleteFileByPath
// ===========================================================================

describe("deleteFileByPath", () => {
  it("deletes a root-level file", () => {
    const result = deleteFileByPath(makeFixture(), "index.ts");
    expect(collectFilePaths(result)).not.toContain("index.ts");
    expect(collectFilePaths(result)).toContain("README.md");
  });

  it("deletes a first-level nested file without touching siblings", () => {
    const result = deleteFileByPath(makeFixture(), "src/App.tsx");
    const paths = collectFilePaths(result);
    expect(paths).not.toContain("src/App.tsx");
    expect(paths).toContain("src/main.tsx");
    expect(paths).toContain("src/utils/helpers.ts");
  });

  it("deletes a deeply nested file", () => {
    const result = deleteFileByPath(makeFixture(), "src/utils/helpers.ts");
    const paths = collectFilePaths(result);
    expect(paths).not.toContain("src/utils/helpers.ts");
    // Parent folder is still present
    expect(paths).toContain("src/utils/");
  });

  it("is a no-op when the target path does not exist", () => {
    const original = makeFixture();
    const result = deleteFileByPath(original, "nonexistent.ts");
    expect(collectFilePaths(result)).toEqual(collectFilePaths(original));
  });

  it("returns a new array and does not shorten the original", () => {
    const original = makeFixture();
    const result = deleteFileByPath(original, "README.md");
    // original unchanged
    expect(original).toHaveLength(3);
    // result has one fewer root entry
    expect(result).toHaveLength(2);
  });
});

// ===========================================================================
// addOrUpdateFile
// ===========================================================================

describe("addOrUpdateFile", () => {
  it("updates the content of an existing root-level file", () => {
    const result = addOrUpdateFile(makeFixture(), "index.ts", "// updated");
    expect((findFileByPath(result, "index.ts") as TemplateFile).content).toBe("// updated");
  });

  it("updates the content of a nested file", () => {
    const result = addOrUpdateFile(makeFixture(), "src/App.tsx", "// new App");
    expect((findFileByPath(result, "src/App.tsx") as TemplateFile).content).toBe("// new App");
  });

  it("updates a deeply nested file", () => {
    const result = addOrUpdateFile(
      makeFixture(),
      "src/utils/helpers.ts",
      "// new helpers"
    );
    expect((findFileByPath(result, "src/utils/helpers.ts") as TemplateFile).content).toBe(
      "// new helpers"
    );
  });

  it("creates a new root-level file that did not exist", () => {
    const result = addOrUpdateFile(makeFixture(), "newFile.ts", "// new");
    const file = findFileByPath(result, "newFile.ts") as TemplateFile;
    expect(file).not.toBeNull();
    expect(file?.content).toBe("// new");
    expect(file?.filename).toBe("newFile");
    expect(file?.fileExtension).toBe("ts");
  });

  it("creates a new file inside an existing folder", () => {
    const result = addOrUpdateFile(makeFixture(), "src/types.ts", "// types");
    expect(findFileByPath(result, "src/types.ts")).not.toBeNull();
  });

  it("creates intermediate folders when they do not exist", () => {
    const result = addOrUpdateFile([], "a/b/c.ts", "// deep");
    const paths = collectFilePaths(result);
    expect(paths).toContain("a/");
    expect(paths).toContain("a/b/");
    expect(paths).toContain("a/b/c.ts");
    expect((findFileByPath(result, "a/b/c.ts") as TemplateFile).content).toBe("// deep");
  });

  it("correctly handles a filename with no extension", () => {
    const result = addOrUpdateFile([], "Makefile", "build:");
    const file = findFileByPath(result, "Makefile") as TemplateFile;
    expect(file).not.toBeNull();
    expect(file?.filename).toBe("Makefile");
    expect(file?.fileExtension).toBe("");
  });

  it("does not mutate unrelated files when updating", () => {
    const result = addOrUpdateFile(makeFixture(), "index.ts", "// changed");
    expect((findFileByPath(result, "README.md") as TemplateFile).content).toBe("# readme");
    expect((findFileByPath(result, "src/App.tsx") as TemplateFile).content).toBe("// App");
  });
});

// ===========================================================================
// useAI – Zustand store
// ===========================================================================

describe("useAI store", () => {
  // Reset to a known baseline before each test so tests are fully isolated.
  beforeEach(() => {
    useAI.setState({
      provider: "mistral",
      isChatOpen: false,
      chatMessages: [],
      isGenerating: false,
      inlineSuggestionsEnabled: true,
      editorTheme: "vs-dark",
      userGeminiKey: "",
      userGroqKey: "",
      userMistralKey: "",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- provider ---------------------------------------------------------------
  describe("setProvider", () => {
    it("updates the active provider to gemini", () => {
      useAI.getState().setProvider("gemini");
      expect(useAI.getState().provider).toBe("gemini");
    });

    it("updates the active provider to groq", () => {
      useAI.getState().setProvider("groq");
      expect(useAI.getState().provider).toBe("groq");
    });
  });

  // --- chat visibility --------------------------------------------------------
  describe("chat visibility", () => {
    it("openChat sets isChatOpen to true", () => {
      useAI.getState().openChat();
      expect(useAI.getState().isChatOpen).toBe(true);
    });

    it("closeChat sets isChatOpen to false", () => {
      useAI.setState({ isChatOpen: true });
      useAI.getState().closeChat();
      expect(useAI.getState().isChatOpen).toBe(false);
    });

    it("toggleChat flips isChatOpen from false → true → false", () => {
      expect(useAI.getState().isChatOpen).toBe(false);
      useAI.getState().toggleChat();
      expect(useAI.getState().isChatOpen).toBe(true);
      useAI.getState().toggleChat();
      expect(useAI.getState().isChatOpen).toBe(false);
    });
  });

  // --- messages ---------------------------------------------------------------
  describe("addMessage / clearChat", () => {
    it("addMessage appends a message with auto-generated id and timestamp", () => {
      useAI.getState().addMessage({ role: "user", content: "Hello AI" });
      const msgs = useAI.getState().chatMessages;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].role).toBe("user");
      expect(msgs[0].content).toBe("Hello AI");
      expect(msgs[0].id).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(msgs[0].timestamp).toBeGreaterThan(0);
    });

    it("addMessage preserves message order", () => {
      useAI.getState().addMessage({ role: "user",      content: "Q1" });
      useAI.getState().addMessage({ role: "assistant", content: "A1" });
      const msgs = useAI.getState().chatMessages;
      expect(msgs).toHaveLength(2);
      expect(msgs[0].content).toBe("Q1");
      expect(msgs[1].content).toBe("A1");
    });

    it("clearChat empties the messages array", () => {
      useAI.getState().addMessage({ role: "user", content: "test" });
      useAI.getState().clearChat();
      expect(useAI.getState().chatMessages).toHaveLength(0);
    });
  });

  // --- generating flag --------------------------------------------------------
  describe("setIsGenerating", () => {
    it("sets the flag to true", () => {
      useAI.getState().setIsGenerating(true);
      expect(useAI.getState().isGenerating).toBe(true);
    });

    it("sets the flag back to false", () => {
      useAI.setState({ isGenerating: true });
      useAI.getState().setIsGenerating(false);
      expect(useAI.getState().isGenerating).toBe(false);
    });
  });

  // --- API keys ---------------------------------------------------------------
  describe("setUserApiKey / getUserApiKey", () => {
    it("stores the key in state for gemini", () => {
      useAI.getState().setUserApiKey("gemini", "gem-123");
      expect(useAI.getState().userGeminiKey).toBe("gem-123");
    });

    it("stores the key in state for groq", () => {
      useAI.getState().setUserApiKey("groq", "groq-456");
      expect(useAI.getState().userGroqKey).toBe("groq-456");
    });

    it("stores the key in state for mistral", () => {
      useAI.getState().setUserApiKey("mistral", "mist-789");
      expect(useAI.getState().userMistralKey).toBe("mist-789");
    });

    it("persists the gemini key to localStorage", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem");
      useAI.getState().setUserApiKey("gemini", "abc");
      expect(spy).toHaveBeenCalledWith("editron_gemini_key", "abc");
    });

    it("persists the groq key to localStorage", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem");
      useAI.getState().setUserApiKey("groq", "xyz");
      expect(spy).toHaveBeenCalledWith("editron_groq_key", "xyz");
    });

    it("getUserApiKey returns the key for the active provider (no argument)", () => {
      useAI.setState({ provider: "groq", userGroqKey: "groq-key" });
      expect(useAI.getState().getUserApiKey()).toBe("groq-key");
    });

    it("getUserApiKey accepts an explicit provider argument", () => {
      useAI.setState({ userGeminiKey: "gem-key" });
      expect(useAI.getState().getUserApiKey("gemini")).toBe("gem-key");
    });

    it("getUserApiKey falls back to mistral key when provider is mistral", () => {
      useAI.setState({ provider: "mistral", userMistralKey: "mist-key" });
      expect(useAI.getState().getUserApiKey()).toBe("mist-key");
    });
  });

  // --- inline suggestions -----------------------------------------------------
  describe("toggleInlineSuggestions", () => {
    it("flips the flag from true to false", () => {
      useAI.setState({ inlineSuggestionsEnabled: true });
      useAI.getState().toggleInlineSuggestions();
      expect(useAI.getState().inlineSuggestionsEnabled).toBe(false);
    });

    it("flips the flag from false to true", () => {
      useAI.setState({ inlineSuggestionsEnabled: false });
      useAI.getState().toggleInlineSuggestions();
      expect(useAI.getState().inlineSuggestionsEnabled).toBe(true);
    });

    it("persists the new value to localStorage", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem");
      useAI.setState({ inlineSuggestionsEnabled: true });
      useAI.getState().toggleInlineSuggestions();
      expect(spy).toHaveBeenCalledWith("editron_inline_suggestions", "false");
    });
  });

  // --- editor theme -----------------------------------------------------------
  describe("setEditorTheme", () => {
    it("updates the editorTheme state", () => {
      useAI.getState().setEditorTheme("github-dark");
      expect(useAI.getState().editorTheme).toBe("github-dark");
    });

    it("persists the theme to localStorage", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem");
      useAI.getState().setEditorTheme("monokai");
      expect(spy).toHaveBeenCalledWith("editron_editor_theme", "monokai");
    });
  });
});
