
import { useEffect, useCallback } from "react";
import { create } from "zustand";
import { WebContainer } from "@webcontainer/api";

interface UseWebContainerProps {}

interface WebContainerStore {
  instance: WebContainer | null;
  bootPromise: Promise<WebContainer> | null;
  isLoading: boolean;
  error: string | null;
  serverUrl: string | null;

  initialize: () => Promise<WebContainer>;
  reset: () => void;
  setServerUrl: (url: string | null) => void;
}

export const useWebContainerStore = create<WebContainerStore>(
  (set, get) => ({
    instance: null,
    bootPromise: null,
    isLoading: false,
    error: null,
    serverUrl: null,

    initialize: async () => {
      const { instance, bootPromise } = get();

      // Already initialized
      if (instance) {
        return instance;
      }

      // Existing boot in progress
      if (bootPromise) {
        return bootPromise;
      }

      try {
        set({
          isLoading: true,
          error: null,
        });

        const promise = WebContainer.boot();

        set({
          bootPromise: promise,
        });

        const webContainerInstance = await promise;

        set({
          instance: webContainerInstance,
          bootPromise: null,
          isLoading: false,
          error: null,
        });

        return webContainerInstance;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to initialize WebContainer";

        console.error("Failed to initialize WebContainer:", error);

        set({
          instance: null,
          bootPromise: null,
          isLoading: false,
          error: errorMessage,
        });

        throw error;
      }
    },

    reset: () => {
      const { instance } = get();

      try {
        // Optional teardown if needed
        // instance?.teardown();
      } catch (error) {
        console.error("Failed to teardown WebContainer:", error);
      }

      set({
        instance: null,
        bootPromise: null,
        isLoading: false,
        error: null,
        serverUrl: null,
      });
    },

    setServerUrl: (url) => {
      set({ serverUrl: url });
    },
  })
);

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

export const useWebContainer = (): UseWebContainerReturn => {
  const {
    instance,
    isLoading,
    error,
    serverUrl,
    initialize,
    reset,
  } = useWebContainerStore();

  useEffect(() => {
  useWebContainerStore
    .getState()
    .initialize()
    .catch((error) => {
      console.error(
        "WebContainer initialization failed:",
        error
      );
    });
}, []);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }

      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");

        if (folderPath) {
          await instance.fs.mkdir(folderPath, {
            recursive: true,
          });
        }

        await instance.fs.writeFile(path, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to write file";

        console.error(`Failed to write file at ${path}:`, err);

        throw new Error(
          `Failed to write file at ${path}: ${errorMessage}`
        );
      }
    },
    [instance]
  );

  const destroy = useCallback(() => {
    reset();
  }, [reset]);

  return {
    serverUrl,
    isLoading,
    error,
    instance,
    writeFileSync,
    destroy,
  };
};



