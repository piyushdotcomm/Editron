"use client";

import { useEffect, useState } from "react";
import { fetchCollabToken, getOrCreateYDoc } from "@/lib/yjs";

/**
 * Subscribes to the Yjs awareness session for a given playground
 * and returns the number of currently active collaborators.
 *
 * Returns 0 when collaboration is inactive or the provider is not
 * yet initialised, so callers never receive undefined/null.
 */
export function useCollaboratorCount(playgroundId: string): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!playgroundId) return;

    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      try {
        const token = await fetchCollabToken(playgroundId);
        if (disposed) return;

        const { provider } = getOrCreateYDoc(playgroundId, token);

        const updateCount = () => {
          const states = Array.from(
            provider.awareness.getStates().values()
          );
          // Count only states that have a user object attached
          const activeCount = states.filter((s) => s.user).length;
          setCount(activeCount);
        };

        provider.awareness.on("change", updateCount);
        updateCount(); // run once immediately

        cleanup = () => {
          provider.awareness.off("change", updateCount);
        };
      } catch {
        // Collaboration unavailable — keep count at 0
        setCount(0);
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [playgroundId]);

  return count;
}