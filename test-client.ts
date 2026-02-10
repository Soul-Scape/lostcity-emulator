/**
 * Quick test client to verify WebSocket connection + login flow.
 * Run: npx tsx test-client.ts
 */
import WebSocket from 'ws';

const WS_URL = 'ws://localhost:8888';

console.log(`[TestClient] Connecting to ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('[TestClient] Connected! Sending auth_login...');
    ws.send(JSON.stringify({
        type: 'auth_login',
        username: 'testplayer',
        password: 'test123',
    }));
});

ws.on('message', (data: Buffer) => {
    try {
        const msg = JSON.parse(data.toString());
        console.log(`[TestClient] Received: ${msg.type}`, JSON.stringify(msg).substring(0, 200));

        // after login_accept, send some test messages
        if (msg.type === 'login_accept') {
            console.log('[TestClient] Login accepted! PID:', msg.pid);

            // wait a tick then send a move click
            setTimeout(() => {
                console.log('[TestClient] Sending move_click...');
                ws.send(JSON.stringify({
                    type: 'move_click',
                    x: 3201,
                    z: 3201,
                    run: false,
                }));
            }, 1000);

            // send a chat message
            setTimeout(() => {
                console.log('[TestClient] Sending public chat...');
                ws.send(JSON.stringify({
                    type: 'message_public',
                    message: 'Hello world!',
                    color: 0,
                    effect: 0,
                }));
            }, 2000);

            // send getcoord cheat (if staffmod)
            setTimeout(() => {
                console.log('[TestClient] Sending ::getcoord...');
                ws.send(JSON.stringify({
                    type: 'client_cheat',
                    command: 'getcoord',
                }));
            }, 3000);

            // send no_timeout keepalive
            setTimeout(() => {
                console.log('[TestClient] Sending no_timeout keepalive...');
                ws.send(JSON.stringify({ type: 'no_timeout' }));
            }, 4000);

            // disconnect after 6 seconds
            setTimeout(() => {
                console.log('[TestClient] Test complete. Disconnecting...');
                ws.send(JSON.stringify({ type: 'logout' }));
                setTimeout(() => ws.close(), 500);
            }, 6000);
        }
    } catch (err) {
        console.error('[TestClient] Bad message:', data.toString().substring(0, 200));
    }
});

ws.on('close', () => {
    console.log('[TestClient] Disconnected');
    process.exit(0);
});

ws.on('error', (err: Error) => {
    console.error('[TestClient] Error:', err.message);
    process.exit(1);
});
