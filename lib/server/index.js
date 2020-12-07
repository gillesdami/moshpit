var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "ws", "../typings", "./Client", "./lobby", "./Rooms"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoshpitServer = void 0;
    const ws_1 = __importDefault(require("ws"));
    const typings_1 = require("../typings");
    const Client_1 = __importDefault(require("./Client"));
    const lobby_1 = __importDefault(require("./lobby"));
    const Rooms_1 = require("./Rooms");
    const CONFIG_DEFAULTS = {
        initialState: {},
        maxClients: Infinity,
        maxRoomMetadataLength: 1024,
        maxUserIdLength: 1024,
        lobbyBroadcastInterval: 500,
        roomsBroadcastInterval: 50
    };
    class MoshpitServer {
        constructor(config, reducer) {
            this.config = Object.assign(CONFIG_DEFAULTS, config);
            this.reducer = reducer;
            this.rooms = new Rooms_1.Rooms(this.config);
            this.lobby = new lobby_1.default(this.config.lobbyBroadcastInterval, this.rooms);
            this.wss = new ws_1.default.Server({ port: this.config.port });
            this.wss.on('connection', (ws) => {
                const client = new Client_1.default(ws);
                ws.on('close', () => {
                    this.rooms.leave(client);
                    this.lobby.deleteClient(client);
                });
                ws.on('message', (message) => {
                    const response = this.handleSocketMessage(client, JSON.parse(message));
                    if (response)
                        ws.send(JSON.stringify(response));
                });
                ws.on('error', err => {
                    console.log('error', client.userId, err);
                });
                this.lobby.addClient(client);
            });
            console.log("running on port " + config.port);
        }
        replaceReducer(nextReducer) {
            this.reducer = nextReducer;
        }
        handleSocketMessage(client, message) {
            var _a;
            const [type, payload] = message;
            switch (type) {
                case typings_1.MOSHPIT_CLIENT_ACTION.LOGIN:
                    if (typeof payload === "string" && payload.length < 1024)
                        client.userId = payload;
                    break;
                case typings_1.MOSHPIT_CLIENT_ACTION.ACTIONS:
                    const room = this.rooms.get(client.userId);
                    if (room) {
                        room.state = this.reducer(room.state, payload, client.userId);
                    }
                    return;
                case typings_1.MOSHPIT_CLIENT_ACTION.CREATE_ROOM:
                    if (!client.userId || ((_a = payload === null || payload === void 0 ? void 0 : payload.length) !== null && _a !== void 0 ? _a : 0 > this.config.maxRoomMetadataLength)) {
                        return [typings_1.MOSHPIT_SERVER_ACTION.CREATE_ROOM_FAILED];
                    }
                    const roomData = this.rooms.create(client, payload);
                    return [typings_1.MOSHPIT_SERVER_ACTION.CREATE_ROOM_SUCCEED, roomData];
                case typings_1.MOSHPIT_CLIENT_ACTION.JOIN_ROOM:
                    try {
                        const state = this.rooms.join(client, payload);
                        return [typings_1.MOSHPIT_SERVER_ACTION.JOIN_ROOM_SUCCEED, state];
                    }
                    catch (e) {
                        return [typings_1.MOSHPIT_SERVER_ACTION.JOIN_ROOM_FAILED];
                    }
                case typings_1.MOSHPIT_CLIENT_ACTION.LEAVE_ROOM:
                    this.rooms.leave(client);
                    return [typings_1.MOSHPIT_SERVER_ACTION.LEAVE_ROOM_SUCCEED];
            }
        }
        clear() {
            this.lobby.clear();
            this.rooms.clear();
            this.wss.close();
        }
    }
    exports.MoshpitServer = MoshpitServer;
});
//# sourceMappingURL=index.js.map