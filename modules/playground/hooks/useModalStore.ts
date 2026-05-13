import { create } from 'zustand';

interface ModalState {
  isPreviewVisible: boolean;
  showAISettings: boolean;
  isCommandPaletteOpen: boolean;
  isDeployDialogOpen: boolean;
  
  setIsPreviewVisible: (visible: boolean) => void;
  togglePreview: () => void;
  
  setShowAISettings: (visible: boolean) => void;
  toggleAISettings: () => void;
  
  setIsCommandPaletteOpen: (visible: boolean) => void;
  toggleCommandPalette: () => void;
  
  setIsDeployDialogOpen: (visible: boolean) => void;
  toggleDeployDialog: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isPreviewVisible: false,
  showAISettings: false,
  isCommandPaletteOpen: false,
  isDeployDialogOpen: false,
  
  setIsPreviewVisible: (visible) => set({ isPreviewVisible: visible }),
  togglePreview: () => set((state) => ({ isPreviewVisible: !state.isPreviewVisible })),
  
  setShowAISettings: (visible) => set({ showAISettings: visible }),
  toggleAISettings: () => set((state) => ({ showAISettings: !state.showAISettings })),
  
  setIsCommandPaletteOpen: (visible) => set({ isCommandPaletteOpen: visible }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  
  setIsDeployDialogOpen: (visible) => set({ isDeployDialogOpen: visible }),
  toggleDeployDialog: () => set((state) => ({ isDeployDialogOpen: !state.isDeployDialogOpen })),
}));
