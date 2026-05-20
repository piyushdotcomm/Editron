declare module 'y-websocket/bin/utils' {
  import { WebSocket, IncomingMessage } from 'ws';
  import * as Y from 'yjs';
  export function setupWSConnection(ws: WebSocket, req: IncomingMessage, options?: any): void;
  export function setPersistence(persistence: any): void;
}
