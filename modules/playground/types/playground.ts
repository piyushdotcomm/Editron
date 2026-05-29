import type { TemplateFile } from "@/modules/playground/lib/path-to-json";

export interface PlaygroundData {
  id: string;
  title?: string | null;
  template?: string | null;
  templateFiles?: TemplateFile[];
}

export interface ActiveFile extends TemplateFile {
  id: string;
  hasUnsavedChanges: boolean;
  originalContent?: string;
}
