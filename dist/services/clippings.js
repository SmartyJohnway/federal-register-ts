"use strict";
/**
 * R0-07B / R2-06 Clippings Service
 *
 * Implements:
 * 1. fr.clippings.current(): Promise<WebClippingsResponse>
 *    Path: /clippings
 *
 * Notes:
 * Anonymous state frozen; authenticated state is AUTH_DEFERRED per R0-02F.
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ClippingsService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingsService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
class ClippingsService {
    constructor(client) {
        _ClippingsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _ClippingsService_client, client, "f");
    }
    /**
     * Get current clippings and folders (FR-WEB-001).
     * Path: /clippings
     */
    async current() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _ClippingsService_client, "f"));
        return runtime.execute("/clippings", undefined, transport_1.decodeJsonResponse);
    }
}
exports.ClippingsService = ClippingsService;
_ClippingsService_client = new WeakMap();
//# sourceMappingURL=clippings.js.map