import WebSocket from 'ws';
import {
    Config, MoshpitClientMessage,
    MOSHPIT_CLIENT_ACTION as MCA,
    MOSHPIT_SERVER_ACTION as MSA,

    Reducer
} from '../typings';
import Client from './Client';
import Lobby from './lobby';
import { Rooms } from './Rooms';

const CONFIG_DEFAULTS = {
    initialState: {},
    maxClients: Infinity,
    maxRoomMetadataLength: 1024,
    maxUserIdLength: 1024,
    lobbyBroadcastInterval: 500,
    roomsBroadcastInterval: 50
};

export class MoshpitServer<T,U> {
    public wss: WebSocket.Server;
    private reducer: Reducer<T,U>;
    private rooms: Rooms<T>;
    private lobby: Lobby<T>;
    
    private config: Config;

    constructor(config: Config, reducer: Reducer<T,U>) {
        this.config = Object.assign(CONFIG_DEFAULTS, config);
        this.reducer = reducer;

        this.rooms = new Rooms(this.config);
        this.lobby = new Lobby(this.config.lobbyBroadcastInterval, this.rooms);

        this.wss = new WebSocket.Server({ port: this.config.port });

        this.wss.on('connection', (ws) => {
            const client = new Client(ws);

            ws.on('close', () => {
                this.rooms.leave(client);
                this.lobby.deleteClient(client);
            });

            ws.on('message', (message: string) => {
                const response = this.handleSocketMessage(client, JSON.parse(message));

                if (response) ws.send(JSON.stringify(response));
            });

            ws.on('error', err => {
                console.log('error', client.userId, err);
            });

            this.lobby.addClient(client);
        });

        console.log("running on port " + config.port);
    }

    replaceReducer(nextReducer: Reducer<T,U>) {
        this.reducer = nextReducer;
    }

    handleSocketMessage(client: Client, message: MoshpitClientMessage) {
        const [type, payload] = message;

        switch (type) {
            case MCA.LOGIN:
                if (typeof payload === "string" && payload.length < 1024) client.userId = payload;
                break;
            case MCA.ACTIONS:
                const room = this.rooms.get(client.userId);
                
                if (room) {
                    room.state = this.reducer(room.state, payload, client.userId);
                }
                return;
            case MCA.CREATE_ROOM:
                if (!client.userId || (payload?.length ?? 0 > this.config.maxRoomMetadataLength)) {
                    return [MSA.CREATE_ROOM_FAILED];
                }
                
                const roomData = this.rooms.create(client, payload);
                return [MSA.CREATE_ROOM_SUCCEED, roomData];
            case MCA.JOIN_ROOM:
                try {
                    const state = this.rooms.join(client, payload);
                    return [MSA.JOIN_ROOM_SUCCEED, state];
                }
                catch (e) {
                    return [MSA.JOIN_ROOM_FAILED];
                }
            case MCA.LEAVE_ROOM:
                this.rooms.leave(client);
                return [MSA.LEAVE_ROOM_SUCCEED];
        }
    }

    clear() {
        this.lobby.clear();
        this.rooms.clear();
        this.wss.close();
    }
}