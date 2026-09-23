"use strict";
/**
 * R0-07B / R2-06 Sections Service
 *
 * Implements:
 * 1. fr.sections.list(): Promise<SectionMap>
 *    Path: /sections
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
var _SectionsService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionsService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class SectionsService {
    constructor(client) {
        _SectionsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _SectionsService_client, client, "f");
    }
    /**
     * List Federal Register sections (FR-SECTION-001).
     * Path: /sections
     */
    async list() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SectionsService_client, "f"));
        return runtime.execute("/sections", undefined, transport_1.decodeJsonResponse);
    }
    // --- FR-PROTO-003 JSONP Sibling Method ---
    /**
     * List Federal Register sections JSONP format companion (FR-PROTO-003 companion to FR-SECTION-001).
     */
    async listJsonp(params) {
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SectionsService_client, "f"));
        return runtime.execute("/sections", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
}
exports.SectionsService = SectionsService;
_SectionsService_client = new WeakMap();
//# sourceMappingURL=sections.js.map