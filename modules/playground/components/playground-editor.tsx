"use client";
import { useRef, useEffect, useCallback } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "@/modules/playground/lib/editor-config";
import type { TemplateFile } from "@/modules/playground/lib/path-to-json";
import { useAI } from "@/modules/playground/hooks/useAI";

// Prettier standalone browser imports
import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginHtml from "prettier/plugins/html";
import prettierPluginPostcss from "prettier/plugins/postcss";
import prettierPluginTypeScript from "prettier/plugins/typescript";

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
}

let inlineProviderDisposable: any = null;
let formatterDisposable: any = null;

const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
}: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.updateOptions({
      ...defaultEditorOptions,
      inlineSuggest: { enabled: true },
      formatOnSave: true,
    });

    configureMonaco(monaco);
    updateEditorLanguage();
    registerInlineCompletionProvider(monaco);
    registerPrettierFormatter(monaco);
  };

  const registerPrettierFormatter = (monaco: Monaco) => {
    if (formatterDisposable) {
      formatterDisposable.dispose();
      formatterDisposable = null;
    }

    const languages = ["javascript", "typescript", "html", "css", "json"];

    formatterDisposable = monaco.languages.registerDocumentFormattingEditProvider(languages, {
      async provideDocumentFormattingEdits(model, options, token) {
        const text = model.getValue();
        const languageId = model.getLanguageId();

        // Map monaco language ids to prettier parsers
        let parser = "babel";
        const plugins = [
          prettierPluginBabel,
          prettierPluginEstree,
          prettierPluginHtml,
          prettierPluginPostcss,
          prettierPluginTypeScript
        ];

        switch (languageId) {
          case "javascript":
            parser = "babel";
            break;
          case "typescript":
            parser = "typescript";
            break;
          case "html":
            parser = "html";
            break;
          case "css":
            parser = "css";
            break;
          case "json":
            parser = "json";
            // Prettier json parser is in babel/estree usually for standalone or it needs its own.
            // Using babel as a fallback, though technically prettier exposes a separate json plugin if needed.
            // But usually babel handles json well enough in browser standalone.
            break;
          default:
            return [];
        }

        try {
          const formatted = await prettier.format(text, {
            parser,
            plugins,
            singleQuote: false,
            tabWidth: options.tabSize || 2,
            useTabs: options.insertSpaces === false,
          });

          return [
            {
              range: model.getFullModelRange(),
              text: formatted,
            },
          ];
        } catch (error) {
          console.error("Prettier formatting error:", error);
          return [];
        }
      }
    });
  };

  const registerInlineCompletionProvider = (monaco: Monaco) => {
    // Dispose previous provider if exists
    if (inlineProviderDisposable) {
      inlineProviderDisposable.dispose();
      inlineProviderDisposable = null;
    }

    inlineProviderDisposable = monaco.languages.registerInlineCompletionsProvider(
      { pattern: "**" },
      {
        provideInlineCompletions: async (model, position, context, token) => {
          // Check if inline suggestions are enabled
          if (!useAI.getState().inlineSuggestionsEnabled) return { items: [] };
          if (token.isCancellationRequested) return { items: [] };

          // Gather context: lines around cursor
          const lineCount = model.getLineCount();
          const currentLine = model.getLineContent(position.lineNumber);
          const textBeforeCursor = currentLine.substring(0, position.column - 1);

          // Don't trigger on empty lines or very short input
          if (textBeforeCursor.trim().length < 3) return { items: [] };

          // Build context from surrounding lines
          const startLine = Math.max(1, position.lineNumber - 20);
          const endLine = Math.min(lineCount, position.lineNumber + 5);
          const contextLines: string[] = [];
          for (let i = startLine; i <= endLine; i++) {
            if (i === position.lineNumber) {
              contextLines.push(textBeforeCursor + "█"); // cursor marker
            } else {
              contextLines.push(model.getLineContent(i));
            }
          }

          const prompt = contextLines.join("\n");
          const language = model.getLanguageId();

          // Wait with debounce (return promise that resolves after delay)
          await new Promise<void>((resolve) => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(resolve, 1500);
          });

          if (token.isCancellationRequested) return { items: [] };

          try {
            const { provider, getUserApiKey } = useAI.getState();
            const userApiKey = getUserApiKey();

            const res = await fetch("/api/completion", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt,
                language,
                provider,
                userApiKey: userApiKey || undefined,
              }),
            });

            if (!res.ok) return { items: [] };

            const data = await res.json();
            const completion = data.completion?.trim();

            if (!completion) return { items: [] };

            // Clean up completion - remove markdown code fences if present
            let cleanCompletion = completion;
            if (cleanCompletion.startsWith("```")) {
              const lines = cleanCompletion.split("\n");
              lines.shift(); // remove opening fence
              if (lines[lines.length - 1]?.trim() === "```") lines.pop();
              cleanCompletion = lines.join("\n");
            }

            return {
              items: [
                {
                  insertText: cleanCompletion,
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                  },
                },
              ],
            };
          } catch (error) {
            console.warn("Inline completion error:", error);
            return { items: [] };
          }
        },

        freeInlineCompletions: () => { },
      }
    );
  };

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const language = getEditorLanguage(activeFile.fileExtension || "");
    try {
      monacoRef.current.editor.setModelLanguage(model, language);
    } catch (error) {
      console.warn("Failed to set editor language:", error);
    }
  };

  useEffect(() => {
    updateEditorLanguage();
  }, [activeFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inlineProviderDisposable) {
        inlineProviderDisposable.dispose();
        inlineProviderDisposable = null;
      }
      if (formatterDisposable) {
        formatterDisposable.dispose();
        formatterDisposable = null;
      }
    };
  }, []);

  const { editorTheme } = useAI();

  useEffect(() => {
    async function loadTheme() {
      if (!monacoRef.current) return;

      const sanitizeThemeId = (name: string) => name.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
      const safeThemeId = sanitizeThemeId(editorTheme);

      if (editorTheme === "vs-dark" || editorTheme === "vs" || editorTheme === "hc-black") {
        monacoRef.current.editor.setTheme(editorTheme);
        return;
      }

      try {
        const res = await fetch(`/themes/${editorTheme}.json`);
        if (!res.ok) throw new Error("Network response was not ok");
        const themeData = await res.json();

        monacoRef.current.editor.defineTheme(safeThemeId, themeData);
        monacoRef.current.editor.setTheme(safeThemeId);
      } catch (error) {
        console.error("Failed to load Monaco theme", error);
        monacoRef.current.editor.setTheme("vs-dark"); // fallback
      }
    }

    loadTheme();
  }, [editorTheme]);

  return (
    <div className="h-full relative">
      <Editor
        height={"100%"}
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={
          activeFile
            ? getEditorLanguage(activeFile.fileExtension || "")
            : "plaintext"
        }
        // @ts-ignore
        options={{
          ...defaultEditorOptions,
          inlineSuggest: { enabled: true },
        }}
      />
    </div>
  );
};

export default PlaygroundEditor;