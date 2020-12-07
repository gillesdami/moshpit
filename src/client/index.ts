import { patch as jsonPatch } from 'jsondiffpatch';
import { nanoid } from 'nanoid';
import { LobbyState } from '../server/Lobby';
import {
    Config,
    MoshpitServerMessage,
    MOSHPIT_CLIENT_ACTION as MCA,
    MOSHPIT_SERVER_ACTION as MSA
} from "../typings";
import FarPromise from './utils/FarPromise';

export class MoshpitClient<T> {
    private config: Config;
    private ws: WebSocket;
    private userId: string;

    private state: any;
    private lobbyState: LobbyState[];
    private subscribers: ((state: T) => void)[] = [];
    private lobbySubscribers: ((lobbyState: LobbyState[]) => void)[] = [];

    private createRoomFarPromise?: FarPromise<string>;
    private joinRoomFarPromise?: FarPromise<void>;
    private leaveRoomFarPromise?: FarPromise<void>;

    constructor(config: Config) {
        this.config = config;
        this.state = config.initialState ?? {};
    }

    /**
     * Attempt to establish a websocket connection with the server.
     * Returns a promise which resolves with the userId if the connection is established.
     */
    connect(userId: string = nanoid(), onClose: () => void = () => {}) {
        this.userId = userId;
        this.ws = new WebSocket(`${this.config.address}:${this.config.port}`);

        return new Promise<string>((resolve, reject) => {
            this.ws.onopen = () => {
                this._send(MCA.LOGIN, this.userId)
                resolve(this.userId);
            };

            this.ws.onclose = () => {
                this.createRoomFarPromise?.reject?.();
                this.joinRoomFarPromise?.reject?.();
                this.leaveRoomFarPromise?.reject?.();

                try {
                    reject();
                }
                catch(e) {
                    onClose();
                }
            };

            this.ws.onerror = console.error;
            
            this.ws.onmessage = (event) => {
                const [type, message]: MoshpitServerMessage = JSON.parse(event.data);

                switch(type) {
                    case MSA.STATE_PATCH:
                        this.state = jsonPatch(this.state, message);
                        this._emitState();
                        break;
                    case MSA.LOBBY:
                        this.lobbyState = message;
                        this._emitLobbyState();
                        break;
                    case MSA.LOBBY_PATCH:
                        this.lobbyState = jsonPatch(this.lobbyState, message);
                        this._emitLobbyState();
                        break;
                    case MSA.CREATE_ROOM_SUCCEED:
                        const [roomId, roomState] = message;

                        this.createRoomFarPromise.resolve(roomId);
                        
                        this.state = roomState;
                        this._emitState();
                        break;
                    case MSA.CREATE_ROOM_FAILED:
                        this.createRoomFarPromise.reject();
                        break;
                    case MSA.JOIN_ROOM_SUCCEED:
                        this.joinRoomFarPromise.resolve();

                        this.state = message;
                        this._emitState();
                        break;
                    case MSA.JOIN_ROOM_FAILED:
                        this.joinRoomFarPromise.reject();
                        break;
                    case MSA.LEAVE_ROOM_SUCCEED:
                        this.leaveRoomFarPromise.resolve();
                        break;
                }
            };
        });
    }

    /**
     * Adds a change listener. It will be called every time some part of the synchronised
     * state have changed with the new state.
     * Returns a function that unsubscribes the change listener.
     */
    subscribe(fn: (state: T) => void) {
        this.subscribers.push(fn);

        const unsubscribe = () => {
            this.subscribers = this.subscribers.filter(sub => sub !== fn);
        };

        return unsubscribe;
    }

    /**
     * Adds a change listener. It will be called every time some part of the synchronised
     * lobby state have changed with the new state.
     * Returns a function that unsubscribes the change listener.
     */
    subscribeLobby(fn: (lobbyState: LobbyState[]) => void) {
        this.lobbySubscribers.push(fn);

        const unsubscribe = () => {
            this.lobbySubscribers = this.lobbySubscribers.filter(sub => sub !== fn);
        };

        return unsubscribe;
    }

    /**
     * Create a room with optional metadatas and join it.
     * Returns a promise which resolves with the newly created roomId.
     */
    createRoom(metadata: string = '') {
        this._send(MCA.CREATE_ROOM, metadata);
        this.createRoomFarPromise = new FarPromise();

        return this.createRoomFarPromise.promise;
    }

    /**
     * Join a room by roomId. Only one room may be joined at a time.
     * If you have already joined an other room, you will silently leave it.
     * Returns a promise.
     */
    joinRoom(roomId: string) {
        this._send(MCA.JOIN_ROOM, roomId);
        this.joinRoomFarPromise = new FarPromise();

        return this.joinRoomFarPromise.promise;
    }
    
    /**
     * Dispatch an action in the servers reducer.
     * It will be ignored by the server if you are not in a room.
     */
    dispatch(action: any) {
        this._send(MCA.ACTIONS, action);
    }

    /**
     * Leave the room you are currently in.
     * Returns a promise, the promise resolves even if you were not in any room.
     */
    leaveRoom() {
        this._send(MCA.LEAVE_ROOM);
        this.leaveRoomFarPromise = new FarPromise();

        return this.leaveRoomFarPromise.promise;
    }
    
    private _send(action: MCA, payload?: any) {
        return this.ws.send(JSON.stringify([action, payload]));
    }

    private _emitState() {
        this.subscribers.forEach(sub => sub(this.state));
    }

    private _emitLobbyState() {
        this.lobbySubscribers.forEach(sub => sub(this.lobbyState));
    }
}