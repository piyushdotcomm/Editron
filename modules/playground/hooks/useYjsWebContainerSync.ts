import { useEffect, useRef } from "react";
import * as Y from "yjs";
import type { TemplateFolder, TemplateFile } from "@/modules/playground/lib/path-to-json";
import { fetchCollabToken, getOrCreateYDoc } from "@/lib/yjs";

export function useYjsWebContainerSync(
  playgroundId: string | undefined,
  templateData: TemplateFolder | null,
  writeFileSync: ((path: string, content: string) => Promise<void>) | null
) {
  const observersRef = useRef<Map<string, (event: Y.YTextEvent) => void>>(new Map());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    if (!playgroundId || !templateData || !writeFileSync) return;

    let disposed = false;

    const setupSync = async () => {
      try {
        const token = await fetchCollabToken(playgroundId);
        if (disposed) return;
        const { doc } = getOrCreateYDoc(playgroundId, token);
        docRef.current = doc;

        // Helper to get all files and their paths
        const getAllFiles = (folder: TemplateFolder, currentPath: string = ""): { file: TemplateFile; path: string }[] => {
          let files: { file: TemplateFile; path: string }[] = [];
          folder.items.forEach((item) => {
            if ("folderName" in item) {
              const newPath = currentPath ? `${currentPath}/${item.folderName}` : item.folderName;
              files = files.concat(getAllFiles(item, newPath));
            } else {
              files.push({ file: item, path: currentPath });
            }
          });
          return files;
        };

        const files = getAllFiles(templateData);

        files.forEach(({ file, path }) => {
          const fileId = (file as any).id;
          const ext = file.fileExtension ? `.${file.fileExtension}` : "";
          const fileKey = fileId || `${file.filename}${ext}`;

          const filePath = path
            ? `${path}/${file.filename}${ext}`
            : `${file.filename}${ext}`;

          if (!observersRef.current.has(fileKey)) {
            const yText = doc.getText(fileKey);
            
            const observer = (event: Y.YTextEvent) => {
              if (debounceTimersRef.current.has(fileKey)) {
                clearTimeout(debounceTimersRef.current.get(fileKey)!);
              }

              const timer = setTimeout(() => {
                const content = yText.toString();
                // Only write if it's different to avoid loops? 
                // writeFileSync already handles safe writes, but let's just write.
                writeFileSync(filePath, content).catch((err) => {
                  console.error(`Failed to sync Yjs changes to WebContainer for ${filePath}:`, err);
                });
              }, 500);

              debounceTimersRef.current.set(fileKey, timer);
            };

            yText.observe(observer);
            observersRef.current.set(fileKey, observer);
          }
        });
      } catch (err) {
        console.error("useYjsWebContainerSync failed to init:", err);
      }
    };

    setupSync();

    return () => {
      disposed = true;
    };
  }, [playgroundId, templateData, writeFileSync]);

  // Deep cleanup on unmount
  useEffect(() => {
    return () => {
      if (docRef.current) {
        observersRef.current.forEach((observer, fileKey) => {
          const yText = docRef.current!.getText(fileKey);
          yText.unobserve(observer);
        });
      }
      observersRef.current.clear();
      
      debounceTimersRef.current.forEach((timer) => clearTimeout(timer));
      debounceTimersRef.current.clear();
    };
  }, []);
}
