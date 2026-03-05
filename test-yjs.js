const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');
const ws = require('ws');

// Mock browser WebSocket for y-websocket
global.WebSocket = ws;

const doc1 = new Y.Doc();
const doc2 = new Y.Doc();

const provider1 = new WebsocketProvider('ws://localhost:1234', 'test-room', doc1);
const provider2 = new WebsocketProvider('ws://localhost:1234', 'test-room', doc2);

provider1.on('status', event => {
    console.log('Provider 1 status:', event.status);
});

provider2.on('status', event => {
    console.log('Provider 2 status:', event.status);
});

provider1.on('synced', () => {
    console.log('Provider 1 synced');
    const text1 = doc1.getText('content');

    if (text1.length === 0) {
        text1.insert(0, 'Hello from Client 1');
    } else {
        console.log('Provider 1 text is already:', text1.toString());
    }
});

provider2.on('synced', () => {
    console.log('Provider 2 synced');
    const text2 = doc2.getText('content');
    console.log('Provider 2 sees text:', text2.toString());

    text2.observe(event => {
        console.log('Provider 2 text updated:', text2.toString());
    });
});

setTimeout(() => {
    console.log("Adding text from client 1...");
    doc1.getText('content').insert(doc1.getText('content').length, ' + Extra');
}, 2000);

setTimeout(() => {
    console.log("Final text on client 2:", doc2.getText('content').toString());
    process.exit(0);
}, 4000);
