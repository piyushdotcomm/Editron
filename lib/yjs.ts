import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Maintain a cache of Y.Doc instances to avoid creating multiple providers for the same room
const yDocs = new Map<string, { doc: Y.Doc; provider: WebsocketProvider }>();

export function getOrCreateYDoc(roomId: string) {
    if (yDocs.has(roomId)) {
        return yDocs.get(roomId)!;
    }

    const doc = new Y.Doc();

    // Connect to the collaboration server
    // In development, it's typically ws://localhost:1234
    // In production, use the environment variable
    const serverUrl = process.env.NEXT_PUBLIC_COLLAB_SERVER_URL || "ws://localhost:1234";

    const provider = new WebsocketProvider(serverUrl, roomId, doc);

    yDocs.set(roomId, { doc, provider });

    // Optional: Clean up when the connection is closed to prevent memory leaks
    provider.on('synced', (isSynced: boolean) => {
        console.log(`[Yjs] Room ${roomId} mapped. Synced:`, isSynced);
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
