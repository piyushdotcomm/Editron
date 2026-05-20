declare module 'y-websocket' {
  import * as Y from 'yjs'
  import { Awareness } from 'y-protocols/awareness'

  export class WebsocketProvider {
    constructor(
      serverUrl: string,
      roomname: string,
      doc: Y.Doc,
      options?: {
        connect?: boolean
        awareness?: Awareness
        params?: Record<string, string>
        WebSocketPolyfill?: typeof WebSocket
        resyncInterval?: number
        maxBackoffTime?: number
        disableBc?: boolean
      }
    )
    wsconnected: boolean
    wsconnecting: boolean
    bcconnected: boolean
    shouldConnect: boolean
    awareness: Awareness
    connect(): void
    disconnect(): void
    destroy(): void
    on(event: string, handler: (...args: unknown[]) => void): void
    off(event: string, handler: (...args: unknown[]) => void): void
  }
}

declare module 'y-websocket/bin/utils' {
  import type { IncomingMessage } from 'http'
  import type WebSocket from 'ws'
  import type * as Y from 'yjs'

  export function setupWSConnection(
    ws: WebSocket,
    req: IncomingMessage,
    options?: { docName?: string; gc?: boolean }
  ): void

  export function setPersistence(persistence: {
    bindState: (docName: string, ydoc: Y.Doc) => void | Promise<void>
    writeState: (docName: string, ydoc: Y.Doc) => void | Promise<void>
  }): void
}