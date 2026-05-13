import { useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { create } from "zustand";

// ─── Path Sanitizer ───────────────────────────────────────────────────────────
function sanitizeRelativePath(filePath: string): string {
  if (filePath.startsWith("/") || filePath.includes("\\")) {
    throw new Error("Invalid path: absolute paths not allowed");
  }
  const parts = filePath.split("/").reduce((acc: string[], part) => {
    if (part === "..") acc.pop();
    else if (part && part !== ".") acc.push(part);
    return acc;
  }, []);
  const result = parts.join("/");
  if (result.startsWith("..")) throw new Error("Path traversal detected");
  return result;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────
interface WebContainerState {
  instance: WebContainer | null;
  bootPromise: Promise<WebContainer> | null;
  isLoading: boolean;
  error: string | null;
  serverUrl: string | null;
  initialize: () => Promise<void>;
  reset: () => void;
  setServerUrl: (url: string | null) => void;
}

export const useWebContainerStore = create<WebContainerState>((set, get) => ({
  instance: null,
  bootPromise: null,
  isLoading: false,
  error: null,
  serverUrl: null,

  initialize: async () => {
    const { instance, bootPromise } = get();

    // Already booted
    if (instance) return;

    // Boot already in progress, wait for it
    if (bootPromise) {
      try {
        const resolvedInstance = await bootPromise;
        set({ instance: resolvedInstance, isLoading: false });
      } catch (error) {
        console.error("Failed to await existing WebContainer boot:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize WebContainer",
          isLoading: false,
        });
      }
      return;
    }

    // Fresh boot
    set({ isLoading: true, error: null });
    try {
      const promise = WebContainer.boot();
      set({ bootPromise: promise });
      const newInstance = await promise;
      set({ instance: newInstance, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize WebContainer:", error);
      set({
        bootPromise: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize WebContainer",
        isLoading: false,
      });
    }
  },

  reset: () => {
    const { instance } = get();
    try {
      instance?.teardown(); // properly release resources
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
}));

// ─── Hook ─────────────────────────────────────────────────────────────────────
interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

export const useWebContainer = (): UseWebContainerReturn => {
  const { instance, isLoading, error, serverUrl, initialize, reset } =
    useWebContainerStore();

  // Auto-initialize on first use
  if (!instance && !isLoading) {
    initialize();
  }

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }

      try {
        const safePath = sanitizeRelativePath(path);
        const folderPath = safePath.includes("/")
          ? safePath.substring(0, safePath.lastIndexOf("/"))
          : null;

        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true });
        }

        await instance.fs.writeFile(safePath, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, err);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [instance]
  );

  return {
    serverUrl,
    isLoading,
    error,
    instance,
    writeFileSync,
    destroy: reset, // also fixes the typo: destory → destroy
  };
};