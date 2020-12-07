(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MOSHPIT_SERVER_ACTION = exports.MOSHPIT_CLIENT_ACTION = void 0;
    var MOSHPIT_CLIENT_ACTION;
    (function (MOSHPIT_CLIENT_ACTION) {
        MOSHPIT_CLIENT_ACTION[MOSHPIT_CLIENT_ACTION["ACTIONS"] = 0] = "ACTIONS";
        MOSHPIT_CLIENT_ACTION[MOSHPIT_CLIENT_ACTION["CREATE_ROOM"] = 1] = "CREATE_ROOM";
        MOSHPIT_CLIENT_ACTION[MOSHPIT_CLIENT_ACTION["JOIN_ROOM"] = 2] = "JOIN_ROOM";
        MOSHPIT_CLIENT_ACTION[MOSHPIT_CLIENT_ACTION["LEAVE_ROOM"] = 3] = "LEAVE_ROOM";
        MOSHPIT_CLIENT_ACTION[MOSHPIT_CLIENT_ACTION["LOGIN"] = 4] = "LOGIN";
    })(MOSHPIT_CLIENT_ACTION = exports.MOSHPIT_CLIENT_ACTION || (exports.MOSHPIT_CLIENT_ACTION = {}));
    var MOSHPIT_SERVER_ACTION;
    (function (MOSHPIT_SERVER_ACTION) {
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["STATE_PATCH"] = 1] = "STATE_PATCH";
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["LOBBY"] = 2] = "LOBBY";
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["LOBBY_PATCH"] = 3] = "LOBBY_PATCH";
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["CREATE_ROOM_SUCCEED"] = 4] = "CREATE_ROOM_SUCCEED";
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["CREATE_ROOM_FAILED"] = 5] = "CREATE_ROOM_FAILED";
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["JOIN_ROOM_SUCCEED"] = 6] = "JOIN_ROOM_SUCCEED";
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["JOIN_ROOM_FAILED"] = 7] = "JOIN_ROOM_FAILED";
        MOSHPIT_SERVER_ACTION[MOSHPIT_SERVER_ACTION["LEAVE_ROOM_SUCCEED"] = 8] = "LEAVE_ROOM_SUCCEED";
    })(MOSHPIT_SERVER_ACTION = exports.MOSHPIT_SERVER_ACTION || (exports.MOSHPIT_SERVER_ACTION = {}));
});
//# sourceMappingURL=typings.js.map