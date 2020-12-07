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
    exports.BiMap = void 0;
    class BiMap {
        constructor(map) {
            this.map = new Map();
            this.reverse = new Map();
            if (map) {
                if (map instanceof Map) {
                    map
                        .forEach((value, key) => {
                        this.set(key, value);
                    });
                }
                else if (Array.isArray(map)) {
                    map
                        .forEach((entry) => {
                        this.set(entry[0], entry[1]);
                    });
                }
                else {
                    Object.keys(map)
                        .forEach((key) => {
                        this.set(key, map[key]);
                    });
                }
            }
        }
        get size() {
            return this.map.size;
        }
        set(key, value) {
            if (this.map.has(key)) {
                const existingValue = this.map.get(key);
                this.reverse.delete(existingValue);
            }
            if (this.reverse.has(value)) {
                const existingKey = this.reverse.get(value);
                this.map.delete(existingKey);
            }
            this.map.set(key, value);
            this.reverse.set(value, key);
            return this;
        }
        clear() {
            this.map.clear();
            this.reverse.clear();
        }
        getValue(key) {
            return this.map.get(key);
        }
        getKey(value) {
            return this.reverse.get(value);
        }
        deleteKey(key) {
            const value = this.map.get(key);
            this.reverse.delete(value);
            return this.map.delete(key);
        }
        deleteValue(value) {
            const key = this.reverse.get(value);
            this.map.delete(key);
            return this.reverse.delete(value);
        }
        hasKey(key) {
            return this.map.has(key);
        }
        hasValue(value) {
            return this.reverse.has(value);
        }
        keys() {
            return this.map.keys();
        }
        values() {
            return this.reverse.keys();
        }
        entries() {
            return this.map.entries();
        }
        forEach(callbackfn, thisArg) {
            return this.map.forEach(callbackfn);
        }
    }
    exports.BiMap = BiMap;
});
//# sourceMappingURL=BiMap.js.map