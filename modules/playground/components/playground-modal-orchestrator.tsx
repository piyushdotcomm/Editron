import React from 'react';
import AIChatPanel from './ai-chat-panel';
import AISettingsDialog from './ai-settings-dialog';
import { CommandPalette } from './command-palette';
import { DeployDialog } from './deploy-dialog';
import { usePlaygroundContext } from './playground-context';
import { useModalStore } from '../hooks/useModalStore';
import { usePlaygroundActions } from '../hooks/usePlaygroundActions';
import { useFileExplorer } from '../hooks/useFileExplorer';
import { useSidebar } from '@/components/ui/sidebar';
import { useAI } from '../hooks/useAI';

export const PlaygroundModalOrchestrator = () => {
  const { templateData, saveTemplateData, playgroundData } = usePlaygroundContext();
  const {
    showAISettings, toggleAISettings, setShowAISettings,
    isCommandPaletteOpen, setIsCommandPaletteOpen,
    isDeployDialogOpen, setIsDeployDialogOpen,
    isPreviewVisible, togglePreview
  } = useModalStore();
  const { handleSave, handleSaveAll, handleDownloadZip } = usePlaygroundActions();
  const { openFile, closeAllFiles } = useFileExplorer();
  const { toggleSidebar } = useSidebar();
  const toggleAIChat = useAI(state => state.toggleChat);

  return (
    <>
      <AIChatPanel
        templateData={templateData}
        saveTemplateData={saveTemplateData}
      />
      
      <AISettingsDialog 
        open={showAISettings} 
        onOpenChange={setShowAISettings} 
      />

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        templateData={templateData}
        onFileSelect={openFile}
        onSave={() => handleSave()}
        onSaveAll={handleSaveAll}
        onDownload={handleDownloadZip}
        onTogglePreview={togglePreview}
        onToggleAI={toggleAIChat}
        onToggleSidebar={toggleSidebar}
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
