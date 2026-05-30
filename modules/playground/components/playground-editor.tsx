"use client";

import { TIMEOUTS } from "@/lib/constants/config";
import React, { useRef, useEffect, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { KeyCode } from "monaco-editor";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "@/modules/playground/lib/editor-config";
import type { TemplateFile } from "@/modules/playground/lib/path-to-json";
import { useAI } from "@/modules/playground/hooks/useAI";
import { usePreferences } from "@/modules/playground/hooks/usePreferences";

import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginHtml from "prettier/plugins/html";
import prettierPluginPostcss from "prettier/plugins/postcss";
import prettierPluginTypeScript from "prettier/plugins/typescript";

import { MonacoBinding } from "y-monaco";
import { fetchCollabToken, getOrCreateYDoc } from "@/lib/yjs";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";

// Module-scoped guards for singleton registrations
let inlineProviderRegistered = false;
let formatterRegistered = false;

// Module-scoped debounce map for per-model debouncing in split-view
const inlineCompletionDebounce = new Map<
  string,
  {
    timer: ReturnType<typeof setTimeout>;
    resolve: () => void;
  }
>();

export interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
  onCursorChange?: (line: number, col: number) => void;
}
const Editor = dynamic(
  () => import("@monaco-editor/react"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        Loading editor...
      </div>
    ),
  },
);

const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  onCursorChange,
}: PlaygroundEditorProps) => {
  const params = useParams();
  const playgroundId = params?.id as string;
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const bindingRef = useRef<{ destroy: () => void } | null>(null);
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  const handleEditorDidMount = (
    editor: MonacoEditor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsMounted(true);

    editor.updateOptions({
      ...defaultEditorOptions,
      inlineSuggest: { enabled: true },
    });

    // Explicitly add keyboard controls for inline AI suggestions
    editor.addCommand(
      KeyCode.Tab,
      () => {
        editor.trigger("keyboard", "editor.action.inlineSuggest.commit", {});
      },
      "inlineSuggestionVisible"
    );

    editor.addCommand(
      KeyCode.Escape,
      () => {
        editor.trigger("keyboard", "editor.action.inlineSuggest.hide", {});
      },
      "inlineSuggestionVisible"
    );

    // Cursor position tracking for status bar
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position.lineNumber, e.position.column);
    });

    configureMonaco(monaco);
    updateEditorLanguage();
    registerInlineCompletionProvider(monaco);
    registerPrettierFormatter(monaco);
  };

  const registerPrettierFormatter = (monaco: Monaco) => {
    // Singleton guard: only register once globally
    if (formatterRegistered) return;

    const languages = ["javascript", "typescript", "html", "css", "json"];

    const disposables = languages.map((lang) =>
      monaco.languages.registerDocumentFormattingEditProvider(lang, {
        async provideDocumentFormattingEdits(model, options, _token) {
          const text = model.getValue();
          const languageId = model.getLanguageId();

          let parser = "babel";

          const plugins = [
            prettierPluginBabel,
            prettierPluginEstree,
            prettierPluginHtml,
            prettierPluginPostcss,
            prettierPluginTypeScript,
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
        },
      }),
    );

    formatterRegistered = true;
  };

  const registerInlineCompletionProvider = (monaco: Monaco) => {
    // Singleton guard: only register once globally
    if (inlineProviderRegistered) return;

    monaco.languages.registerInlineCompletionsProvider(
      { pattern: "**" },
      {
        provideInlineCompletions: async (model, position, _context, token) => {
          // Check if inline suggestions are enabled
          if (!useAI.getState().inlineSuggestionsEnabled) return { items: [] };
          if (token.isCancellationRequested) return { items: [] };

          // Gather context: lines around cursor
          const lineCount = model.getLineCount();
          const currentLine = model.getLineContent(position.lineNumber);
          const textBeforeCursor = currentLine.substring(
            0,
            position.column - 1,
          );

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
            const key = model.uri.toString();

            const pending = inlineCompletionDebounce.get(key);

            if (pending) {
              clearTimeout(pending.timer);
              pending.resolve();
            }

            const timer = setTimeout(() => {
              inlineCompletionDebounce.delete(key);
              resolve();
            }, EDITOR_CONFIG.INLINE_SUGGESTION_DEBOUNCE_MS);

            inlineCompletionDebounce.set(key, {
              timer,
              resolve,
            });

            token.onCancellationRequested(() => {
              const current = inlineCompletionDebounce.get(key);

              if (current?.timer === timer) {
                inlineCompletionDebounce.delete(key);
              }

              clearTimeout(timer);
              resolve();
            });
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

        freeInlineCompletions: () => {},
      },
    );

    inlineProviderRegistered = true;
  };

  const updateEditorLanguage = useCallback(() => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const language = getEditorLanguage(activeFile.fileExtension || "");
    try {
      monacoRef.current.editor.setModelLanguage(model, language);
    } catch (error) {
      console.warn("Failed to set editor language:", error);
    }
  }, [activeFile]);

  useEffect(() => {
    updateEditorLanguage();
  }, [updateEditorLanguage]);

  // Bind Yjs to Monaco
  useEffect(() => {
    if (
      !activeFile ||
      !monacoRef.current ||
      !editorRef.current ||
      !playgroundId
    )
      return;

    // Check if collaboration enabled ideally... For now we bind unconditionally or check session docs.
    // If the room doesn't exist on server, y-websocket will just act locally until server connects.
    const model = editorRef.current.getModel();
    if (!model) return;

    let disposed = false;
    let awarenessCleanup = () => {};

    void (async () => {
      try {
        const token = await fetchCollabToken(playgroundId);
        if (disposed) return;

        const { doc, provider } = getOrCreateYDoc(playgroundId, token);
        // Use file id if available (contains full path), otherwise fallback to filename+ext
        const fileId = (activeFile as TemplateFile & { id?: string })?.id;
        const ext = activeFile.fileExtension
          ? `.${activeFile.fileExtension}`
          : "";
        const fileKey = fileId || `${activeFile.filename}${ext}`;

        const yText = doc.getText(fileKey);

        // Initial content population if empty
        if (yText.length === 0 && content) {
          yText.insert(0, content);
        }

        if (bindingRef.current) {
          bindingRef.current.destroy();
        }

        const binding = new MonacoBinding(
          yText,
          model,
          new Set(editorRef.current ? [editorRef.current] : []),
          provider.awareness,
        );

        const userColor = session?.user?.email
          ? "#" +
            Math.floor(
              Math.abs(Math.sin(session.user.email.charCodeAt(0)) * 16777215),
            )
              .toString(16)
              .padEnd(6, "0")
          : "#30bced";

        provider.awareness.setLocalStateField("user", {
          name: session?.user?.name || "Anonymous",
          color: userColor,
        });

        const handleAwarenessUpdate = () => {
          const styleId = "yjs-awareness-styles";
          let styleEl = document.getElementById(styleId);
          if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
          }

          const states = Array.from(
            provider.awareness.getStates().entries() as Iterable<
              [number, { user?: { color?: string; name?: string } }]
            >,
          );
          let css = "";

          for (const [clientId, state] of states) {
            if (state.user) {
              const color = state.user.color || "orange";
              const name = state.user.name || "Anonymous";

              css += `
                .yRemoteSelection-${clientId} {
                  background-color: ${color}40; /* 40 hex is 25% opacity */
                }
                .yRemoteSelectionHead-${clientId} {
                  border-left: 2px solid ${color};
                  border-top: 2px solid ${color};
                  border-bottom: 2px solid ${color};
                }
                .yRemoteSelectionHead-${clientId}::after {
                  border-color: ${color};
                }
                .yRemoteSelectionHead-${clientId}::before {
                  content: "${name}";
                  position: absolute;
                  top: -18px;
                  left: -2px;
                  font-size: 11px;
                  background-color: ${color};
                  color: white;
                  padding: 1px 4px;
                  border-radius: 2px;
                  white-space: nowrap;
                  pointer-events: none;
                  z-index: 10;
                  font-family: var(--font-inter), sans-serif;
                  opacity: 0;
                  transition: opacity 0.2s ease-in-out;
                }
                .yRemoteSelectionHead-${clientId}:hover::before {
                  opacity: 1;
                }
              `;
            }
          }
          styleEl.innerHTML = css;
        };

        provider.awareness.on("update", handleAwarenessUpdate);
        awarenessCleanup = () => {
          provider.awareness.off("update", handleAwarenessUpdate);
        };

        bindingRef.current = binding;
      } catch (e) {
        console.error("Yjs binding error:", e);
      }
    })();

    return () => {
      disposed = true;
      awarenessCleanup();
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [activeFile, playgroundId, isMounted, content, session]);

  // Cleanup on unmount - only binding cleanup, providers are global singletons
  useEffect(() => {
    return () => {
      // Provider disposals removed - they are global singletons that should persist
      // Only clean up the binding for this editor instance
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
 feat/split-view-editor

      if (playgroundId) {
        destroyYDoc(playgroundId);
      }
      
      // Dispose all Monaco models on unmount to prevent memory leaks
      if (monacoRef.current) {
        monacoRef.current.editor.getModels().forEach((model) => {
          model.dispose();
        });
      }
 develop
    };
  }, []);

  const { editorTheme, fontLigatures } = usePreferences();

  useEffect(() => {
    async function loadTheme() {
      if (!monacoRef.current) return;

      const sanitizeThemeId = (name: string) =>
        name.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
      const safeThemeId = sanitizeThemeId(editorTheme);

      if (
        editorTheme === "vs-dark" ||
        editorTheme === "vs" ||
        editorTheme === "hc-black"
      ) {
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

  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const currentModel = editorRef.current.getModel();
      monacoRef.current.editor.getModels().forEach((model) => {
        if (model !== currentModel) {
          model.dispose();
        }
      });
    }
  }, [activeFile]);

  return (
    <div className="h-full relative">
      <Editor

        height="100%"
        height={"100%"}
        path={(activeFile as any)?.id || activeFile?.filename || "default"}

        defaultValue={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={
          activeFile
            ? getEditorLanguage(activeFile.fileExtension || "")
            : "plaintext"
        }
        options={{
          ...defaultEditorOptions,
          fontLigatures: fontLigatures,
          inlineSuggest: { enabled: true },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default React.memo(PlaygroundEditor);
