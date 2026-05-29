"use client";

import { create } from "zustand";

/**
 * Lightweight Zustand store for playground UI state that needs to be
 * shared across multiple components (header buttons, keyboard shortcuts,
 * modal components).
 *
 * This replaces the `useState` calls that were scattered across the
 * monolithic page component and prop-drilled to children.
 */
interface PlaygroundUIState {
  isPreviewVisible: boolean;
  showAISettings: boolean;
  showPreferences: boolean;
  isCommandPaletteOpen: boolean;
  isDeployDialogOpen: boolean;
  cursorPosition: { line: number; col: number };

  // Actions
  setIsPreviewVisible: (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowAISettings: (v: boolean) => void;
  setShowPreferences: (v: boolean) => void;
  setIsCommandPaletteOpen: (v: boolean) => void;
  setIsDeployDialogOpen: (v: boolean) => void;
  setCursorPosition: (pos: { line: number; col: number }) => void;
  togglePreview: () => void;
  resetUI: () => void;
}

export const usePlaygroundUI = create<PlaygroundUIState>((set) => ({
  isPreviewVisible: false,
  showAISettings: false,
  showPreferences: false,
  isCommandPaletteOpen: false,
  isDeployDialogOpen: false,
  cursorPosition: { line: 1, col: 1 },

  setIsPreviewVisible: (v) =>
    set((s) => ({
      isPreviewVisible: typeof v === "function" ? v(s.isPreviewVisible) : v,
    })),
  setShowAISettings: (v) => set({ showAISettings: v }),
  setShowPreferences: (v) => set({ showPreferences: v }),
  setIsCommandPaletteOpen: (v) => set({ isCommandPaletteOpen: v }),
  setIsDeployDialogOpen: (v) => set({ isDeployDialogOpen: v }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  togglePreview: () =>
    set((s) => ({ isPreviewVisible: !s.isPreviewVisible })),
  resetUI: () =>
    set({
      isPreviewVisible: false,
      showAISettings: false,
      showPreferences: false,
      isCommandPaletteOpen: false,
      isDeployDialogOpen: false,
      cursorPosition: { line: 1, col: 1 },
    }),
}));
