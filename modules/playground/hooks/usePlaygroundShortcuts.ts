import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useModalStore } from './useModalStore';
import { useAI } from './useAI';
import { useFileExplorer } from './useFileExplorer';

import { usePlaygroundActions } from './usePlaygroundActions';

export function usePlaygroundShortcuts() {
  const { handleSave, handleSaveAll } = usePlaygroundActions();
  const sidebar = useSidebar();
  const toggleCommandPalette = useModalStore(state => state.toggleCommandPalette);
  const togglePreview = useModalStore(state => state.togglePreview);
  const { activeFileId, closeFile } = useFileExplorer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S — Save
      if (e.ctrlKey && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Shift+S — Save All
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleSaveAll();
      }
      // Ctrl+K or Ctrl+Shift+P — Command Palette
      if ((e.ctrlKey && e.key === "k") || (e.ctrlKey && e.shiftKey && e.key === "P")) {
        e.preventDefault();
        toggleCommandPalette();
      }
      // Ctrl+B — Toggle Sidebar
      if (e.ctrlKey && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        sidebar.toggleSidebar();
      }
      // Ctrl+\ — Toggle Preview
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        togglePreview();
      }
      // Ctrl+Shift+A — Toggle AI Chat
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        useAI.getState().toggleChat();
      }
      // Ctrl+W — Close current tab
      if (e.ctrlKey && !e.shiftKey && e.key === "w") {
        e.preventDefault();
        if (activeFileId) {
          closeFile(activeFileId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSaveAll, sidebar, activeFileId, closeFile, toggleCommandPalette, togglePreview]);
}
