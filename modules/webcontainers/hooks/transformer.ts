import { TemplateFolder, TemplateItem, TemplateFile } from "../../playground/lib/path-to-json";

interface WebContainerFile {
  file: {
    contents: string;
  };
}

interface WebContainerDirectory {
  directory: {
    [key: string]: WebContainerFile | WebContainerDirectory;
  };
}

export type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

/**
 * Determine the filesystem key for a TemplateItem.
 *
 * Folders are identified by the presence of both `folderName` and `items`.
 * Everything else is treated as a file — including extension-less files such
 * as `README` or `Makefile` where `fileExtension` is an empty string.
 */
function itemKey(item: TemplateItem): string {
  if ('folderName' in item && 'items' in item) {
    return (item as TemplateFolder).folderName;
  }
  // File: append the extension only when it is a non-empty string.
  const file = item as TemplateFile;
  return file.fileExtension
    ? `${file.filename}.${file.fileExtension}`
    : file.filename;
}

export function transformToWebContainerFormat(template: TemplateFolder): WebContainerFileSystem {
  function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
    if ('folderName' in item && 'items' in item) {
      // This is a directory
      const directoryContents: WebContainerFileSystem = {};
      
      item.items.forEach(subItem => {
        directoryContents[itemKey(subItem)] = processItem(subItem);
      });

      return {
        directory: directoryContents
      };
    } else {
      // This is a file
      const file = item as TemplateFile;
      return {
        file: {
          contents: file.content
        }
      };
    }
  }

  const result: WebContainerFileSystem = {};
  
  template.items.forEach(item => {
    result[itemKey(item)] = processItem(item);
  });

  return result;
}