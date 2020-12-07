import WebSocket from 'ws';
import { MOSHPIT_SERVER_ACTION as MSA } from '../typings';

export default class Client {
    public ws: WebSocket
    public roomId: string | null = null;
    public userId: string | null = null;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    send(action: MSA, payload: any) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify([action, payload]));
        }
    }
}