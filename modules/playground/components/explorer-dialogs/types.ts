export interface TemplateFile {
  filename: string;
  fileExtension: string;
  content: string;
}

export interface TemplateFolder {
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

export type TemplateItem = TemplateFile | TemplateFolder;