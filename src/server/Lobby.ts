import { diff as jsondiff } from 'jsondiffpatch';
import { MOSHPIT_SERVER_ACTION } from '../typings';
import Client from './Client';
import { Rooms } from './Rooms';

export type LobbyState = [roomId: string, clientIds: string[], metadata: string][];

export default class Lobby<T> {
    private clients: Set<Client> = new Set();
    private lobbyState: LobbyState = [];
    private lobbyIntervalId: NodeJS.Timeout;

    private rooms: Rooms<T>;

    constructor(lobbyBroadcastInterval: number, rooms: Rooms<T>) {
        this.lobbyIntervalId = setInterval(this.broadcastLobby.bind(this), lobbyBroadcastInterval);
        this.rooms = rooms;
    }

    addClient(client: Client) {
        client.send(MOSHPIT_SERVER_ACTION.LOBBY, this.lobbyState);
        this.clients.add(client);
    }

    deleteClient(ws: Client) {
        return this.clients.delete(ws);
    }

    broadcastLobby() {
        const newLobbyState: LobbyState = Array.from(
            this.rooms,
            ([_, { roomId, clients, metadata }]) => ([
                roomId,
                Array.from(clients, client => client.userId),
                metadata
            ])
        );

        const lobbyDiffs = jsondiff(this.lobbyState, newLobbyState);
        this.lobbyState = newLobbyState;

        if (lobbyDiffs) {
            for(const client of this.clients) {
                client.send(MOSHPIT_SERVER_ACTION.LOBBY_PATCH, lobbyDiffs);
            }
        }
    }

    clear() {
        clearInterval(this.lobbyIntervalId);
    }
}