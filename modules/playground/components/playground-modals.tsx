import AISettingsDialog from "@/modules/playground/components/ai-settings-dialog";
import { CommandPalette } from "@/modules/playground/components/command-palette";
import { DeployDialog } from "@/modules/playground/components/deploy-dialog";
import { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { useSidebar } from "@/components/ui/sidebar";
import { useAI } from "@/modules/playground/hooks/useAI";

interface PlaygroundModalsProps {
  // AI Settings
  showAISettings: boolean;
  setShowAISettings: (open: boolean) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  templateData: TemplateFolder;
  onFileSelect: (file: TemplateFile) => void;
  onSave: () => void;
  onSaveAll: () => void;
  onCloseAllFiles: () => void;
  onDownload: () => void;
  isPreviewVisible: boolean;
  setIsPreviewVisible: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Deploy
  isDeployDialogOpen: boolean;
  setIsDeployDialogOpen: (open: boolean) => void;
  projectName?: string;
}

export function PlaygroundModals({
  showAISettings,
  setShowAISettings,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  templateData,
  onFileSelect,
  onSave,
  onSaveAll,
  onCloseAllFiles,
  onDownload,
  isPreviewVisible,
  setIsPreviewVisible,
  isDeployDialogOpen,
  setIsDeployDialogOpen,
  projectName,
}: PlaygroundModalsProps) {
  const sidebar = useSidebar();

  return (
    <>
      <AISettingsDialog open={showAISettings} onOpenChange={setShowAISettings} />

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        templateData={templateData}
        onFileSelect={onFileSelect}
        onSave={onSave}
        onSaveAll={onSaveAll}
        onDownload={onDownload}
        onTogglePreview={() => setIsPreviewVisible((prev) => !prev)}
        onToggleAI={() => useAI.getState().toggleChat()}
        onToggleSidebar={() => sidebar.toggleSidebar()}
        onOpenSettings={() => setShowAISettings(true)}
        onCloseAllFiles={onCloseAllFiles}
        isPreviewVisible={isPreviewVisible}
      />

      <DeployDialog
        open={isDeployDialogOpen}
        onOpenChange={setIsDeployDialogOpen}
        templateData={templateData}
        projectName={projectName}
      />
    </>
  );
}
