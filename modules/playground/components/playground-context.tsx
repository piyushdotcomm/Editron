import { createContext, useContext } from 'react';
import { TemplateFolder } from '../lib/path-to-json';

export interface PlaygroundContextType {
  id: string;
  playgroundData: any;
  templateData: TemplateFolder | null;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
  instance: any;
  writeFileSync: any;
  serverUrl: string | null;
  containerLoading: boolean;
  containerError: string | null;
}

export const PlaygroundContext = createContext<PlaygroundContextType | null>(null);

export const usePlaygroundContext = () => {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error("Missing PlaygroundContext.Provider");
  return ctx;
};
