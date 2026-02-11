import { useState, useEffect, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

// Singleton instance to prevent multiple boots
let webContainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

interface UseWebContainerProps {
  templateData: TemplateFolder;
}

interface UseWebContaierReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destory: () => void;
}

export const useWebContainer = ({
  templateData,
}: UseWebContainerProps): UseWebContaierReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    async function initializeWebContainer() {
      // If we already have a booted instance, use it
      if (webContainerInstance) {
        setInstance(webContainerInstance);
        setIsLoading(false);
        return;
      }

      // If initialization is already in progress, wait for it
      if (bootPromise) {
        try {
          const instance = await bootPromise;
          setInstance(instance);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to await existing WebContainer boot:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize WebContainer"
          );
          setIsLoading(false);
        }
        return;
      }

      // Start new initialization
      try {
        bootPromise = WebContainer.boot();
        const webcontainerInstanceCreated = await bootPromise;

        webContainerInstance = webcontainerInstanceCreated;
        setInstance(webcontainerInstanceCreated);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        bootPromise = null; // Reset promise on failure so we can try again if needed
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize WebContainer"
        );
        setIsLoading(false);
      }
    }

    initializeWebContainer();

    // Cleanup: We intentionally DO NOT teardown the instance here.
    // WebContainer should persist across re-renders in dev mode.
  }, []);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        // If instance is not ready yet, we can't write. 
        // But in consumer code, we should check isLoading or instance before calling this.
        throw new Error("WebContainer instance is not available");
      }

      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");

        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true }); // Create folder structure recursively
        }

        await instance.fs.writeFile(path, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, err);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [instance]
  );

  const destory = useCallback(() => {
    // Optional: Implement proper teardown if needed, but be careful with global singleton.
    // For now, we just clear local state.
    if (instance) {
      // webContainerInstance?.teardown(); // Only if we want to kill the global one
      // webContainerInstance = null;
      // bootPromise = null;
      setInstance(null);
      setServerUrl(null)
    }
  }, [instance])

  return { serverUrl, isLoading, error, instance, writeFileSync, destory }
};