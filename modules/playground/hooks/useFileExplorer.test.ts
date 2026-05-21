/**
 * @vitest-environment jsdom
 *
 * Basic tests for modules/playground/hooks/useFileExplorer.tsx
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFileExplorer } from "./useFileExplorer";
import { generateFileId } from "../lib";
import type { TemplateFile, TemplateFolder } from "../lib/path-to-json";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function makeRootTemplate(): TemplateFolder {
  return {
    folderName: "root",
    items: [
      { filename: "index", fileExtension: "ts", content: "// index" },
      { filename: "README", fileExtension: "md", content: "# readme" },
      {
        folderName: "src",
        items: [
          { filename: "App", fileExtension: "tsx", content: "// App" },
        ],
      },
    ],
  };
}

const sampleFile: TemplateFile = {
  filename: "index",
  fileExtension: "ts",
  content: "// index",
};

const readmeFile: TemplateFile = {
  filename: "README",
  fileExtension: "md",
  content: "# readme",
};

describe("useFileExplorer store", () => {
  let rootTemplate: TemplateFolder;

  beforeEach(() => {
    rootTemplate = makeRootTemplate();
    useFileExplorer.setState({
      playgroundId: "",
      templateData: null,
      openFiles: [],
      activeFileId: null,
      editorContent: "",
    });
  });

  describe("setters", () => {
    it("setPlaygroundId updates playgroundId", () => {
      useFileExplorer.getState().setPlaygroundId("pg-1");
      expect(useFileExplorer.getState().playgroundId).toBe("pg-1");
    });

    it("setTemplateData updates templateData", () => {
      const data = makeRootTemplate();
      useFileExplorer.getState().setTemplateData(data);
      expect(useFileExplorer.getState().templateData).toBe(data);
    });

    it("setEditorContent updates editorContent", () => {
      useFileExplorer.getState().setEditorContent("hello");
      expect(useFileExplorer.getState().editorContent).toBe("hello");
    });
  });

  describe("openFile", () => {
    it("opens a file and sets it as active", () => {
      const indexId = generateFileId(sampleFile, rootTemplate);
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);

      const state = useFileExplorer.getState();
      expect(state.openFiles).toHaveLength(1);
      expect(state.activeFileId).toBe(indexId);
      expect(state.editorContent).toBe("// index");
      expect(state.openFiles[0].hasUnsavedChanges).toBe(false);
    });

    it("focuses an already-open file without duplicating tabs", () => {
      const indexId = generateFileId(sampleFile, rootTemplate);
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);
      useFileExplorer.getState().openFile({
        ...sampleFile,
        content: "// changed in tree",
      });

      const state = useFileExplorer.getState();
      expect(state.openFiles).toHaveLength(1);
      expect(state.activeFileId).toBe(indexId);
      expect(state.editorContent).toBe("// index");
    });
  });

  describe("closeFile", () => {
    it("closes a non-active tab without changing editor content", () => {
      const indexId = generateFileId(sampleFile, rootTemplate);
      const readmeId = generateFileId(readmeFile, rootTemplate);
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);
      useFileExplorer.getState().openFile(readmeFile);

      useFileExplorer.getState().closeFile(indexId);

      const state = useFileExplorer.getState();
      expect(state.openFiles).toHaveLength(1);
      expect(state.activeFileId).toBe(readmeId);
      expect(state.editorContent).toBe("# readme");
    });

    it("switches to the last remaining tab when the active tab is closed", () => {
      const indexId = generateFileId(sampleFile, rootTemplate);
      const readmeId = generateFileId(readmeFile, rootTemplate);
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);
      useFileExplorer.getState().openFile(readmeFile);

      useFileExplorer.getState().closeFile(readmeId);

      const state = useFileExplorer.getState();
      expect(state.openFiles).toHaveLength(1);
      expect(state.activeFileId).toBe(indexId);
      expect(state.editorContent).toBe("// index");
    });

    it("clears editor state when the last tab is closed", () => {
      const indexId = generateFileId(sampleFile, rootTemplate);
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);
      useFileExplorer.getState().closeFile(indexId);

      const state = useFileExplorer.getState();
      expect(state.openFiles).toHaveLength(0);
      expect(state.activeFileId).toBeNull();
      expect(state.editorContent).toBe("");
    });
  });

  describe("closeAllFiles", () => {
    it("closes every open tab and resets editor state", () => {
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);
      useFileExplorer.getState().closeAllFiles();

      const state = useFileExplorer.getState();
      expect(state.openFiles).toHaveLength(0);
      expect(state.activeFileId).toBeNull();
      expect(state.editorContent).toBe("");
    });
  });

  describe("updateFileContent", () => {
    it("marks the active file as dirty and updates editor content", () => {
      const indexId = generateFileId(sampleFile, rootTemplate);
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);
      useFileExplorer.getState().updateFileContent(indexId, "// edited");

      const state = useFileExplorer.getState();
      expect(state.editorContent).toBe("// edited");
      expect(state.openFiles[0].content).toBe("// edited");
      expect(state.openFiles[0].hasUnsavedChanges).toBe(true);
    });

    it("updates a background tab without changing the active editor", () => {
      const indexId = generateFileId(sampleFile, rootTemplate);
      useFileExplorer.getState().setTemplateData(rootTemplate);
      useFileExplorer.getState().openFile(sampleFile);
      useFileExplorer.getState().openFile(readmeFile);

      useFileExplorer.getState().updateFileContent(indexId, "// edited");

      const state = useFileExplorer.getState();
      expect(state.editorContent).toBe("# readme");
      expect(state.openFiles.find((f) => f.id === indexId)?.hasUnsavedChanges).toBe(
        true
      );
    });
  });
});
