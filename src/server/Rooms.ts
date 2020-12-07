import { diff as jsondiff } from 'jsondiffpatch';
import { nanoid } from 'nanoid';
import { Config, MOSHPIT_SERVER_ACTION } from '../typings';
import Client from './Client';

export interface Room<T> {
    clients: Set<Client>,
    metadata: string,
    roomId: string,
    state: T,
    lastDispatchedState: T
}

export class Rooms<T> extends Map<string, Room<T>> {
    public roomsInitialState: any;
    public maxClients: any;

    private roomsIntervalId: NodeJS.Timeout;

    constructor(config: Config) {
        super();
        this.roomsInitialState = config.initialState;
        this.maxClients = config.maxClients;

        this.roomsIntervalId = setInterval(this.broadcastRooms.bind(this), config.roomsBroadcastInterval);
    }

    private _newRoom(roomId: string, client: Client, metadata: string): Room<T> {
        return {
            roomId,
            metadata,
            clients: new Set([client]),
            state: this.roomsInitialState,
            lastDispatchedState: this.roomsInitialState
        }
    }

    create(client: Client, metadata: string = "") {
        this.leave(client); // a user cannot be in 2 rooms at once

        const roomId = nanoid(8);
        client.roomId = roomId;

        const room = this._newRoom(roomId, client, metadata);
        this.set(roomId, room);

        return [roomId, room.lastDispatchedState];
    }

    join(client: Client, roomId: string) {
        const room = this.get(roomId);

        if (!room) {
            throw new Error(`Room ${roomId} does not exist.`);
        }
        else if (room.clients.has(client)) {
            return room.lastDispatchedState;
        }
        else if (room.clients.size >= this.maxClients) {
            throw new Error(`Room ${roomId} is full`);
        }

        client.roomId = room.roomId;
        room.clients.add(client);
        
        return room.lastDispatchedState;
    }

    leave(client: Client) {
        const room = this.get(client.roomId);

        if (room) {
            room.clients.delete(client);
            client.roomId = null;

            if (room.clients.size === 0) {
                this.delete(room.roomId);
            }
        }
    }

    broadcastRooms() {
        for (const [_, room] of this) {
            const roomPatch = jsondiff(room.lastDispatchedState, room.state);
            room.lastDispatchedState = room.state;
            
            if (roomPatch) {
                for (const client of room.clients) {
                    client.send(MOSHPIT_SERVER_ACTION.STATE_PATCH, roomPatch);
                }
            }
        }
    }

    clear() {
        return clearInterval(this.roomsIntervalId);
    }
}