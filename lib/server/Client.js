var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "ws"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ws_1 = __importDefault(require("ws"));
    class Client {
        constructor(ws) {
            this.roomId = null;
            this.userId = null;
            this.ws = ws;
        }
        send(action, payload) {
            if (this.ws.readyState === ws_1.default.OPEN) {
                this.ws.send(JSON.stringify([action, payload]));
            }
        }
    }
    exports.default = Client;
});
//# sourceMappingURL=Client.js.map