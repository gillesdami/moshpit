var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jsondiffpatch", "nanoid", "../typings", "./utils/FarPromise"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoshpitClient = void 0;
    const jsondiffpatch_1 = require("jsondiffpatch");
    const nanoid_1 = require("nanoid");
    const typings_1 = require("../typings");
    const FarPromise_1 = __importDefault(require("./utils/FarPromise"));
    class MoshpitClient {
        constructor(config) {
            var _a;
            this.subscribers = [];
            this.lobbySubscribers = [];
            this.config = config;
            this.state = (_a = config.initialState) !== null && _a !== void 0 ? _a : {};
        }
        connect(userId = nanoid_1.nanoid(), onClose = () => { }) {
            this.userId = userId;
            this.ws = new WebSocket(`${this.config.address}:${this.config.port}`);
            return new Promise((resolve, reject) => {
                this.ws.onopen = () => {
                    this._send(typings_1.MOSHPIT_CLIENT_ACTION.LOGIN, this.userId);
                    resolve(this.userId);
                };
                this.ws.onclose = () => {
                    var _a, _b, _c, _d, _e, _f;
                    (_b = (_a = this.createRoomFarPromise) === null || _a === void 0 ? void 0 : _a.reject) === null || _b === void 0 ? void 0 : _b.call(_a);
                    (_d = (_c = this.joinRoomFarPromise) === null || _c === void 0 ? void 0 : _c.reject) === null || _d === void 0 ? void 0 : _d.call(_c);
                    (_f = (_e = this.leaveRoomFarPromise) === null || _e === void 0 ? void 0 : _e.reject) === null || _f === void 0 ? void 0 : _f.call(_e);
                    try {
                        reject();
                    }
                    catch (e) {
                        onClose();
                    }
                };
                this.ws.onerror = console.error;
                this.ws.onmessage = (event) => {
                    const [type, message] = JSON.parse(event.data);
                    switch (type) {
                        case typings_1.MOSHPIT_SERVER_ACTION.STATE_PATCH:
                            this.state = jsondiffpatch_1.patch(this.state, message);
                            this._emitState();
                            break;
                        case typings_1.MOSHPIT_SERVER_ACTION.LOBBY:
                            this.lobbyState = message;
                            this._emitLobbyState();
                            break;
                        case typings_1.MOSHPIT_SERVER_ACTION.LOBBY_PATCH:
                            this.lobbyState = jsondiffpatch_1.patch(this.lobbyState, message);
                            this._emitLobbyState();
                            break;
                        case typings_1.MOSHPIT_SERVER_ACTION.CREATE_ROOM_SUCCEED:
                            const [roomId, roomState] = message;
                            this.createRoomFarPromise.resolve(roomId);
                            this.state = roomState;
                            this._emitState();
                            break;
                        case typings_1.MOSHPIT_SERVER_ACTION.CREATE_ROOM_FAILED:
                            this.createRoomFarPromise.reject();
                            break;
                        case typings_1.MOSHPIT_SERVER_ACTION.JOIN_ROOM_SUCCEED:
                            this.joinRoomFarPromise.resolve();
                            this.state = message;
                            this._emitState();
                            break;
                        case typings_1.MOSHPIT_SERVER_ACTION.JOIN_ROOM_FAILED:
                            this.joinRoomFarPromise.reject();
                            break;
                        case typings_1.MOSHPIT_SERVER_ACTION.LEAVE_ROOM_SUCCEED:
                            this.leaveRoomFarPromise.resolve();
                            break;
                    }
                };
            });
        }
        subscribe(fn) {
            this.subscribers.push(fn);
            const unsubscribe = () => {
                this.subscribers = this.subscribers.filter(sub => sub !== fn);
            };
            return unsubscribe;
        }
        subscribeLobby(fn) {
            this.lobbySubscribers.push(fn);
            const unsubscribe = () => {
                this.lobbySubscribers = this.lobbySubscribers.filter(sub => sub !== fn);
            };
            return unsubscribe;
        }
        createRoom(metadata = '') {
            this._send(typings_1.MOSHPIT_CLIENT_ACTION.CREATE_ROOM, metadata);
            this.createRoomFarPromise = new FarPromise_1.default();
            return this.createRoomFarPromise.promise;
        }
        joinRoom(roomId) {
            this._send(typings_1.MOSHPIT_CLIENT_ACTION.JOIN_ROOM, roomId);
            this.joinRoomFarPromise = new FarPromise_1.default();
            return this.joinRoomFarPromise.promise;
        }
        dispatch(action) {
            this._send(typings_1.MOSHPIT_CLIENT_ACTION.ACTIONS, action);
        }
        leaveRoom() {
            this._send(typings_1.MOSHPIT_CLIENT_ACTION.LEAVE_ROOM);
            this.leaveRoomFarPromise = new FarPromise_1.default();
            return this.leaveRoomFarPromise.promise;
        }
        _send(action, payload) {
            return this.ws.send(JSON.stringify([action, payload]));
        }
        _emitState() {
            this.subscribers.forEach(sub => sub(this.state));
        }
        _emitLobbyState() {
            this.lobbySubscribers.forEach(sub => sub(this.lobbyState));
        }
    }
    exports.MoshpitClient = MoshpitClient;
});
//# sourceMappingURL=index.js.map