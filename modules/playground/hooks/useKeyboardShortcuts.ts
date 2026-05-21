import { useEffect } from "react";
import { useAI } from "@/modules/playground/hooks/useAI";
import { useSidebar } from "@/components/ui/sidebar";

interface UseKeyboardShortcutsProps {
  handleSave: () => void;
  handleSaveAll: () => void;
  activeFileId: string | null;
  closeFile: (id: string) => void;
  setIsPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useKeyboardShortcuts({
  handleSave,
  handleSaveAll,
  activeFileId,
  closeFile,
  setIsPreviewVisible,
  setIsCommandPaletteOpen,
}: UseKeyboardShortcutsProps) {
  const sidebar = useSidebar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const target = e.target as HTMLElement;

        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
       return;
    }
      // Ctrl+S — Save
      if (e.ctrlKey && !e.shiftKey && key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Shift+S — Save All
      if (e.ctrlKey && e.shiftKey && key === "S") {
        e.preventDefault();
        handleSaveAll();
      }
      // Ctrl+K or Ctrl+Shift+P — Command Palette
      if ((e.ctrlKey && key === "k") || (e.ctrlKey && e.shiftKey && key === "P")) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Ctrl+B — Toggle Sidebar
      if (e.ctrlKey && !e.shiftKey && key === "b") {
        e.preventDefault();
        sidebar.toggleSidebar();
      }
      // Ctrl+\ — Toggle Preview
      if (e.ctrlKey && key === "\\") {
        e.preventDefault();
        setIsPreviewVisible((prev) => !prev);
      }
      // Ctrl+Shift+A — Toggle AI Chat
      if (e.ctrlKey && e.shiftKey && key === "A") {
        e.preventDefault();
        useAI.getState().toggleChat();
      }
      // Ctrl+W — Close current tab
      if (e.ctrlKey && !e.shiftKey && key === "w") {
        e.preventDefault();
        if (activeFileId) {
          closeFile(activeFileId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSaveAll, sidebar, activeFileId, closeFile, setIsPreviewVisible, setIsCommandPaletteOpen]);
}
