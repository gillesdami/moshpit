(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jsondiffpatch", "nanoid", "../typings"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Rooms = void 0;
    const jsondiffpatch_1 = require("jsondiffpatch");
    const nanoid_1 = require("nanoid");
    const typings_1 = require("../typings");
    class Rooms extends Map {
        constructor(config) {
            super();
            this.roomsInitialState = config.initialState;
            this.maxClients = config.maxClients;
            this.roomsIntervalId = setInterval(this.broadcastRooms.bind(this), config.roomsBroadcastInterval);
        }
        _newRoom(roomId, client, metadata) {
            return {
                roomId,
                metadata,
                clients: new Set([client]),
                state: this.roomsInitialState,
                lastDispatchedState: this.roomsInitialState
            };
        }
        create(client, metadata = "") {
            this.leave(client);
            const roomId = nanoid_1.nanoid(8);
            client.roomId = roomId;
            const room = this._newRoom(roomId, client, metadata);
            this.set(roomId, room);
            return [roomId, room.lastDispatchedState];
        }
        join(client, roomId) {
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
        leave(client) {
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
                const roomPatch = jsondiffpatch_1.diff(room.lastDispatchedState, room.state);
                room.lastDispatchedState = room.state;
                if (roomPatch) {
                    for (const client of room.clients) {
                        client.send(typings_1.MOSHPIT_SERVER_ACTION.STATE_PATCH, roomPatch);
                    }
                }
            }
        }
        clear() {
            return clearInterval(this.roomsIntervalId);
        }
    }
    exports.Rooms = Rooms;
});
//# sourceMappingURL=Rooms.js.map