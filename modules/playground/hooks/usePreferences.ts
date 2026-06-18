"use client";

import { create } from "zustand";
import { STORAGE_KEYS, DEFAULT_EDITOR_THEME } from "@/lib/constants/config";

interface PreferencesState {
  editorTheme: string;
  fontLigatures: boolean;
  
  setEditorTheme: (theme: string) => void;
  setFontLigatures: (enabled: boolean) => void;
}

const getInitialTheme = () => {
  if (typeof window === "undefined") return DEFAULT_EDITOR_THEME;
  return localStorage.getItem(STORAGE_KEYS.EDITOR_THEME) || DEFAULT_EDITOR_THEME;
};

const getInitialLigatures = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("editron:preferences:ligatures") !== "false";
};

export const usePreferences = create<PreferencesState>((set) => ({
  editorTheme: getInitialTheme(),
  fontLigatures: getInitialLigatures(),

  setEditorTheme: (theme: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_THEME, theme);
    } catch {}
    set({ editorTheme: theme });
  },

  setFontLigatures: (enabled: boolean) => {
    try {
      localStorage.setItem("editron:preferences:ligatures", String(enabled));
    } catch {}
    set({ fontLigatures: enabled });
  }
}));
