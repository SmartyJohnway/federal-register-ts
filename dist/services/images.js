"use strict";
/**
 * R0-07B / R2-06 Images Service
 *
 * Implements:
 * 1. fr.images.find(params: ImageFindParams): Promise<ImageMetadataMap>
 *    Path: /images/{identifier}
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
var _ImagesService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class ImagesService {
    constructor(client) {
        _ImagesService_client.set(this, void 0);
        __classPrivateFieldSet(this, _ImagesService_client, client, "f");
    }
    /**
     * Find public image metadata by identifier (FR-IMAGE-001).
     * Path: /images/{identifier}
     * Note: Missing/non-public image returns HTTP 404 with {}, which throws FederalRegisterEmptyJsonError.
     */
    async find(params) {
        const identifier = serializer_1.QuerySerializer.serializeImageFind(params);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _ImagesService_client, "f"));
        return runtime.execute(`/images/${encodeURIComponent(identifier)}`, undefined, transport_1.decodeJsonResponse);
    }
    // --- FR-PROTO-003 JSONP Sibling Method ---
    /**
     * Find public image metadata JSONP format companion (FR-PROTO-003 companion to FR-IMAGE-001).
     */
    async findJsonp(params) {
        const identifier = serializer_1.QuerySerializer.serializeImageFind(params);
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _ImagesService_client, "f"));
        return runtime.execute(`/images/${encodeURIComponent(identifier)}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
}
exports.ImagesService = ImagesService;
_ImagesService_client = new WeakMap();
//# sourceMappingURL=images.js.map