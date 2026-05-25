"use client";

import React from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import AIChatPanel from "@/modules/playground/components/ai-chat-panel";
import AISettingsDialog from "@/modules/playground/components/ai-settings-dialog";
import { CommandPalette } from "@/modules/playground/components/command-palette";
import { DeployDialog } from "@/modules/playground/components/deploy-dialog";
import { usePlaygroundContext } from "@/modules/playground/contexts/playground-context";
import { usePlaygroundUI } from "@/modules/playground/hooks/usePlaygroundUI";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { useAI } from "@/modules/playground/hooks/useAI";
import { useSidebar } from "@/components/ui/sidebar";
import type { TemplateFile } from "@/modules/playground/lib/path-to-json";

interface PlaygroundModalsProps {
  handleSave: () => void;
  handleSaveAll: () => void;
  handleDownloadZip: () => void;
}

/**
 * Orchestrates all modal / dialog / panel overlays for the playground.
 *
 * Each dialog manages its own open/close state via the `usePlaygroundUI`
 * Zustand store, so the parent page doesn't need to track it.
 */
export const PlaygroundModals: React.FC<PlaygroundModalsProps> = ({
  handleSave,
  handleSaveAll,
  handleDownloadZip,
}) => {
  const { templateData, playgroundData, saveTemplateData } =
    usePlaygroundContext();
  const {
    showAISettings,
    setShowAISettings,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isDeployDialogOpen,
    setIsDeployDialogOpen,
    isPreviewVisible,
    setIsPreviewVisible,
  } = usePlaygroundUI();
  const { openFile, closeAllFiles } = useFileExplorer();
  const sidebar = useSidebar();

  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };

  return (
    <>
      {/* AI Chat Panel */}
      <ErrorBoundary name="AIChatPanel">
        <AIChatPanel
          templateData={templateData}
          saveTemplateData={saveTemplateData}
        />
      </ErrorBoundary>

      <AISettingsDialog
        open={showAISettings}
        onOpenChange={setShowAISettings}
      />

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        templateData={templateData}
        onFileSelect={handleFileSelect}
        onSave={() => handleSave()}
        onSaveAll={handleSaveAll}
        onDownload={handleDownloadZip}
        onTogglePreview={() => setIsPreviewVisible((prev) => !prev)}
        onToggleAI={() => useAI.getState().toggleChat()}
        onToggleSidebar={() => sidebar.toggleSidebar()}
        onOpenSettings={() => setShowAISettings(true)}
        onCloseAllFiles={closeAllFiles}
        isPreviewVisible={isPreviewVisible}
      />

      <DeployDialog
        open={isDeployDialogOpen}
        onOpenChange={setIsDeployDialogOpen}
        templateData={templateData}
        projectName={playgroundData?.title}
      />
    </>
  );
};
