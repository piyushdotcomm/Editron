import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Maintain a cache of Y.Doc instances to avoid creating multiple providers for the same room
const yDocs = new Map<string, { doc: Y.Doc; provider: WebsocketProvider }>();

export async function fetchCollabToken(roomId: string): Promise<string> {
    const response = await fetch(`/api/collab-token/${roomId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to get collaboration token");
    }

    const payload = await response.json();

    if (!payload?.token || typeof payload.token !== "string") {
        throw new Error("Collaboration token missing from response");
    }

    return payload.token;
}

export function getOrCreateYDoc(roomId: string, token: string) {
    if (yDocs.has(roomId)) {
        return yDocs.get(roomId)!;
    }

    const doc = new Y.Doc();

    // Connect to the collaboration server
    const explicitUrl = process.env.NEXT_PUBLIC_COLLAB_SERVER_URL;
    let serverUrl: string;

    if (explicitUrl) {
        serverUrl = explicitUrl;
    } else if (typeof window !== "undefined") {
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (isLocalhost) {
            serverUrl = "ws://localhost:1234";
        } else {
            // On deployment, NEXT_PUBLIC_COLLAB_SERVER_URL MUST be set (e.g. wss://editron-collab.onrender.com)
            console.warn("[Yjs] ⚠️ NEXT_PUBLIC_COLLAB_SERVER_URL is not set. Real-time collaboration will not work on deployment. Set this in your Vercel environment variables.");
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            serverUrl = `${protocol}//${window.location.host}/api/collab`; // fallback, likely won't work
        }
    } else {
        serverUrl = "ws://localhost:1234";
    }

    const provider = new WebsocketProvider(serverUrl, roomId, doc, {
        params: {
            token,
        },
    } as any);

    yDocs.set(roomId, { doc, provider });

    // Optional: Clean up when the connection is closed to prevent memory leaks
    provider.on('synced', (isSynced: boolean) => {
        console.log(`[Yjs] Room ${roomId} mapped. Synced:`, isSynced);
    });
    provider.on('status', (event: any) => {
        console.log(`[Yjs] Room ${roomId} status:`, event.status);
    });

    return { doc, provider };
}

export function destroyYDoc(roomId: string) {
    const instance = yDocs.get(roomId);
    if (instance) {
        instance.provider.destroy();
        instance.doc.destroy();
        yDocs.delete(roomId);
    }
}
