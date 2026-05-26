declare module 'y-websocket/bin/utils' {
  import { Doc } from 'yjs';
  import WebSocket from 'ws';
  import { IncomingMessage } from 'http';

  export function setupWSConnection(
    conn: WebSocket,
    req: IncomingMessage,
    options?: { docName?: string; gc?: boolean }
  ): void;

  export function setPersistence(options: {
    bindState: (docName: string, ydoc: Doc) => Promise<void> | void;
    writeState: (docName: string, ydoc: Doc) => Promise<void> | void;
  }): void;
}