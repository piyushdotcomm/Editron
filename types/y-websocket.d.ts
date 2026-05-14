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