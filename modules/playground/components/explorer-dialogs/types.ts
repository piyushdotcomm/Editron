export interface BaseTemplateItem {
  content?: string;
}

export interface TemplateFile extends BaseTemplateItem {
  filename: string;
  fileExtension: string;
  content: string;
}

export interface TemplateFolder extends BaseTemplateItem {
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

export type TemplateItem = TemplateFile | TemplateFolder;