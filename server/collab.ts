import { WebSocketServer } from 'ws';
import http from 'http';
// @ts-ignore
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import * as Y from 'yjs';
import { db } from '../lib/db';
import { verifyCollabToken } from '../lib/collab-token';
import { MongodbPersistence } from 'y-mongodb-provider';
import dotenv from 'dotenv';
import { parse } from 'url';

// Load environment variables for the standalone server
dotenv.config();

const port = process.env.COLLAB_PORT || 1234;
const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Editron Yjs Collaboration Server is running\n');
});

const wss = new WebSocketServer({ noServer: true });

// Setup MongoDB persistence
const _mdb = new MongodbPersistence(process.env.DATABASE_URL as string, {
    collectionName: 'yjs-transactions',
    flushSize: 100,
    multipleCollections: false,
});

setPersistence({
    bindState: async (docName: string, ydoc: Y.Doc) => {
        const persistedYdoc = await _mdb.getYDoc(docName);
        const newUpdates = Y.encodeStateAsUpdate(ydoc);
        _mdb.storeUpdate(docName, newUpdates);
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
        ydoc.on('update', async (update: Uint8Array) => {
            _mdb.storeUpdate(docName, update);
        });
    },
    writeState: async (docName: string, ydoc: Y.Doc) => {
        await _mdb.flushDocument(docName);
    }
});

wss.on('connection', (ws, req) => {
    const docName = req.url?.split('?')[0].slice(1) || 'default';

    setupWSConnection(ws, req, { docName, gc: true });
});

// Upgrade HTTP to WS with NextAuth JWT Validation
server.on('upgrade', async (request, socket, head) => {
    try {
        const parsedUrl = parse(request.url || '', true);
        const docName = parsedUrl.pathname?.slice(1) || 'default';
        const collabToken = typeof parsedUrl.query.token === 'string' ? parsedUrl.query.token : null;

        if (!collabToken) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        const tokenPayload = verifyCollabToken(collabToken);

        if (!tokenPayload || tokenPayload.roomId !== docName) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        const playground = await db.playground.findFirst({
            where: {
                id: docName,
                userId: tokenPayload.userId,
            },
            select: {
                id: true,
            },
        });

        if (!playground) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
            console.log('WebSocket successfully upgraded!');
            wss.emit('connection', ws, request);
        });
    } catch (error) {
        console.error('Upgrade error:', error);
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
    }
});

server.listen(port, () => {
    console.log(`Collaboration server running on port ${port}`);
});
