import { useCallback } from "react";
import JSZip from "jszip";
import { toast } from "sonner";
import { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";

function addFilesToZip(folder: TemplateFolder, zipFolder: JSZip) {
  folder.items.forEach((item) => {
    if ("folderName" in item) {
      const newFolder = zipFolder.folder(item.folderName);
      if (newFolder) addFilesToZip(item, newFolder);
    } else {
      zipFolder.file(
        item.filename + (item.fileExtension ? `.${item.fileExtension}` : ""),
        item.content
      );
    }
  });
}

interface UseDownloadProps {
  templateData: TemplateFolder | null;
  projectTitle?: string;
}

export function useDownload({ templateData, projectTitle }: UseDownloadProps) {
  const handleDownloadZip = useCallback(async () => {
  if (!templateData) return;

  let url: string | null = null;
  let link: HTMLAnchorElement | null = null;

  try {
    const zip = new JSZip();

    addFilesToZip(templateData, zip);

    const content = await zip.generateAsync({ type: "blob" });

    url = window.URL.createObjectURL(content);

    link = document.createElement("a");

    link.href = url;
    link.download = `${projectTitle || "project"}.zip`;

    document.body.appendChild(link);

    link.click();

    toast.success("Project downloaded successfully");
  } catch (error) {
    console.error("Download error:", error);

    toast.error("Failed to download project");
  } finally {
    if (link && document.body.contains(link)) {
      document.body.removeChild(link);
    }

    if (url) {
      window.URL.revokeObjectURL(url);
    }
  }
}, [templateData, projectTitle]);

  return { handleDownloadZip };
}
