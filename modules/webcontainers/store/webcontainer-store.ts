import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { WebContainer } from "@webcontainer/api";

type WebContainerStatus = "idle" | "booting" | "booted" | "error";

interface WebContainerState {
  instance: WebContainer | null;
  status: WebContainerStatus;
  isLoading: boolean;
  isBooted: boolean;
  error: string | null;
  bootWebContainer: () => Promise<void>;
  teardown: () => void;
}

// Module-level promise guard so concurrent callers share the same boot attempt
let bootPromise: Promise<void> | null = null;

export const useWebContainerStore = create<WebContainerState>()(
  devtools(
    (set, get) => ({
      instance: null,
      status: "idle",
      isLoading: false,
      isBooted: false,
      error: null,

      bootWebContainer: async () => {
        const { status } = get();

        // Already booted — nothing to do
        if (status === "booted") return;

        // In-flight boot — share the existing promise
        if (bootPromise) {
          await bootPromise;
          return;
        }

        set({ status: "booting", isLoading: true, error: null });

        bootPromise = WebContainer.boot()
          .then((instance) => {
            set({ instance, status: "booted", isLoading: false, isBooted: true });
          })
          .catch((err) => {
            bootPromise = null;
            set({
              status: "error",
              isLoading: false,
              error: err instanceof Error ? err.message : "Failed to initialize WebContainer",
            });
          });

        await bootPromise;
      },

      teardown: () => {
        const { instance } = get();
        if (instance) {
          try {
            instance.teardown();
          } catch {
            // ignore teardown errors
          }
        }
        bootPromise = null;
        set({ instance: null, status: "idle", isLoading: false, isBooted: false, error: null });
      },
    }),
    { name: "webcontainer-store" }
  )
);
