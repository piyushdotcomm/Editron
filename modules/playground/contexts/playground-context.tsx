"use client";

import React, { createContext, useContext } from "react";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import type { WebContainer } from "@webcontainer/api";

export interface PlaygroundData {
  id?: string;
  title?: string;
  description?: string;
  createdAt?: string | Date;
  [key: string]: unknown;
}

export type SplitDirection = "horizontal" | "vertical";

export interface EditorPane {
  id: string;
  activeFileId: string | null;
}

/**
 * Shared playground dependencies provided to all children.
 * Eliminates prop-drilling of templateData, saveTemplateData,
 * web-container instance, and related state.
 */
export interface PlaygroundContextValue {
  /** Current playground route id */
  id: string;

  /** Parsed template folder tree (null while loading) */
  templateData: TemplateFolder | null;

  /** High-level playground metadata (title, etc.) */
  playgroundData: PlaygroundData | null;

  /** Persist template data to the server */
  saveTemplateData: (data: TemplateFolder) => Promise<void>;

  /** WebContainer instance (null before boot) */
  instance: WebContainer | null;

  /** Write a file inside the running WebContainer */
  writeFileSync: ((path: string, content: string) => Promise<void>) | null;

  /** Dev-server URL exposed by the WebContainer */
  serverUrl: string | null;

  /** Whether the container is still booting */
  containerLoading: boolean;

  /** Container-level error message, if any */
  containerError: string | null;

  editorPanes: EditorPane[];
  setEditorPanes: React.Dispatch<React.SetStateAction<EditorPane[]>>;

  splitDirection: SplitDirection;
  setSplitDirection: React.Dispatch<React.SetStateAction<SplitDirection>>;

  activePaneId: string | null;
  setActivePaneId: React.Dispatch<React.SetStateAction<string | null>>;
}

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

export const PlaygroundProvider: React.FC<
  PlaygroundContextValue & { children: React.ReactNode }
> = ({ children, ...value }) => {
  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};

/**
 * Consume the playground context.
 * Must be rendered inside `<PlaygroundProvider>`.
 */
export function usePlaygroundContext(): PlaygroundContextValue {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) {
    throw new Error(
      "usePlaygroundContext must be used within a PlaygroundProvider",
    );
  }
  return ctx;
}
