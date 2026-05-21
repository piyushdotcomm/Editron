import { useState } from "react";

export function usePlaygroundDialogs() {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);

  return {
    isPreviewVisible,
    setIsPreviewVisible,
    showAISettings,
    setShowAISettings,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isDeployDialogOpen,
    setIsDeployDialogOpen,
  };
}
