(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jsondiffpatch", "../typings"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jsondiffpatch_1 = require("jsondiffpatch");
    const typings_1 = require("../typings");
    class Lobby {
        constructor(lobbyBroadcastInterval, rooms) {
            this.clients = new Set();
            this.lobbyState = [];
            this.lobbyIntervalId = setInterval(this.broadcastLobby.bind(this), lobbyBroadcastInterval);
            this.rooms = rooms;
        }
        addClient(client) {
            client.send(typings_1.MOSHPIT_SERVER_ACTION.LOBBY, this.lobbyState);
            this.clients.add(client);
        }
        deleteClient(ws) {
            return this.clients.delete(ws);
        }
        broadcastLobby() {
            const newLobbyState = Array.from(this.rooms, ([_, { roomId, clients, metadata }]) => ([
                roomId,
                Array.from(clients, client => client.userId),
                metadata
            ]));
            const lobbyDiffs = jsondiffpatch_1.diff(this.lobbyState, newLobbyState);
            this.lobbyState = newLobbyState;
            if (lobbyDiffs) {
                for (const client of this.clients) {
                    client.send(typings_1.MOSHPIT_SERVER_ACTION.LOBBY_PATCH, lobbyDiffs);
                }
            }
        }
        clear() {
            clearInterval(this.lobbyIntervalId);
        }
    }
    exports.default = Lobby;
});
//# sourceMappingURL=Lobby.js.map