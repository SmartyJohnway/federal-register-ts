"use strict";
/**
 * R0-07B / R2-06 Suggested Searches Service
 *
 * Implements:
 * 1. fr.suggestedSearches.list(): Promise<SuggestedSearchIndexMap>
 *    Path: /suggested_searches
 * 2. fr.suggestedSearches.listBySections(params: SuggestedSearchSectionsParams): Promise<SuggestedSearchIndexMap>
 *    Path: /suggested_searches?conditions[sections][]=...
 * 3. fr.suggestedSearches.find(params: SuggestedSearchFindParams): Promise<SuggestedSearchDetail>
 *    Path: /suggested_searches/{slug}
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
var _SuggestedSearchesService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestedSearchesService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class SuggestedSearchesService {
    constructor(client) {
        _SuggestedSearchesService_client.set(this, void 0);
        __classPrivateFieldSet(this, _SuggestedSearchesService_client, client, "f");
    }
    /**
     * List suggested searches grouped by section (FR-SUGGEST-001).
     * Path: /suggested_searches
     */
    async list() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SuggestedSearchesService_client, "f"));
        return runtime.execute("/suggested_searches", undefined, transport_1.decodeJsonResponse);
    }
    /**
     * Filter suggested searches by sections (FR-SUGGEST-002).
     * Path: /suggested_searches?conditions[sections][]=...
     */
    async listBySections(params) {
        const entries = serializer_1.QuerySerializer.serializeSuggestedSearchSectionsParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SuggestedSearchesService_client, "f"));
        return runtime.execute("/suggested_searches", qs, transport_1.decodeJsonResponse);
    }
    /**
     * Find suggested search by slug (FR-SUGGEST-003).
     * Path: /suggested_searches/{slug}
     */
    async find(params) {
        const slug = serializer_1.QuerySerializer.serializeSuggestedSearchFind(params);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SuggestedSearchesService_client, "f"));
        return runtime.execute(`/suggested_searches/${encodeURIComponent(slug)}`, undefined, transport_1.decodeJsonResponse);
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    /**
     * List suggested searches JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-001).
     */
    async listJsonp(params) {
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SuggestedSearchesService_client, "f"));
        return runtime.execute("/suggested_searches", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
    /**
     * Filter suggested searches by sections JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-002).
     */
    async listBySectionsJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializeSuggestedSearchSectionsParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SuggestedSearchesService_client, "f"));
        return runtime.execute("/suggested_searches", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
    /**
     * Find suggested search by slug JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-003).
     */
    async findJsonp(params) {
        const slug = serializer_1.QuerySerializer.serializeSuggestedSearchFind(params);
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SuggestedSearchesService_client, "f"));
        return runtime.execute(`/suggested_searches/${encodeURIComponent(slug)}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
}
exports.SuggestedSearchesService = SuggestedSearchesService;
_SuggestedSearchesService_client = new WeakMap();
//# sourceMappingURL=suggested_searches.js.map