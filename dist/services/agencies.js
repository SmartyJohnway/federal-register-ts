"use strict";
/**
 * R0-07B / R2-04 Agencies Service
 *
 * Implements the 4 frozen core JSON Agency operations:
 * 1. fr.agencies.list(params?: AgencyListParams): Promise<AgencyIndexItem<K>[]>
 * 2. fr.agencies.find(params: AgencyFindParams): Promise<AgencyProjection<K>>
 * 3. fr.agencies.findMany(params: AgencyFindManyParams): Promise<AgencyProjection<K>[]>
 * 4. fr.agencies.suggestions(params: AgencySuggestionsParams): Promise<AgencyProjection<K>[]>
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
var _AgenciesService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenciesService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
/**
 * Operation-aware agency find decoder using classifyAgencyHttpError.
 * HTTP 404 with { error: 404 } produces FederalRegisterAgencyNotFoundError.
 */
function agencyFindDecoder(decoded) {
    if (decoded.status >= 200 && decoded.status < 300) {
        return (0, transport_1.decodeJsonResponse)(decoded);
    }
    throw (0, transport_1.classifyAgencyHttpError)(decoded);
}
/**
 * Agency multi-lookup decoder normalizing upstream single-item response to plain array.
 */
function decodeAgencyListResponse(decoded) {
    const parsed = (0, transport_1.decodeJsonResponse)(decoded);
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (parsed && typeof parsed === "object") {
        return [parsed];
    }
    return [];
}
class AgenciesService {
    constructor(client) {
        _AgenciesService_client.set(this, void 0);
        __classPrivateFieldSet(this, _AgenciesService_client, client, "f");
    }
    /**
     * 1. List all agencies.
     * Path: /agencies
     * Note: Always augmented with json_url on each agency index item.
     */
    async list(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeAgencyListParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute("/agencies", qs, transport_1.decodeJsonResponse);
    }
    /**
     * 2. Single agency lookup by numeric ID or slug.
     * Path: /agencies/{idOrSlug}
     * Throws FederalRegisterAgencyNotFoundError on 404 { error: 404 }.
     */
    async find(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializeAgencyFind(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedPath = encodeURIComponent(pathSegment);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute(`/agencies/${encodedPath}`, qs, agencyFindDecoder);
    }
    /**
     * 3. Multiple agency lookup by comma-separated numeric IDs.
     * Path: /agencies/{ids}
     * Upstream returns plain AgencyProjection<K>[] omitting missing IDs.
     * Does NOT return a MultiLookupEnvelope.
     */
    async findMany(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializeAgencyFindMany(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedPath = pathSegment
            .split(",")
            .map((id) => encodeURIComponent(id))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute(`/agencies/${encodedPath}`, qs, decodeAgencyListResponse);
    }
    /**
     * 4. Agency suggestions by term.
     * Path: /agencies/suggestions
     * Returns AgencyProjection<K>[].
     */
    async suggestions(params) {
        const entries = serializer_1.QuerySerializer.serializeAgencySuggestionsParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute("/agencies/suggestions", qs, transport_1.decodeJsonResponse);
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    /**
     * List all agencies JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-001).
     */
    async listJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeAgencyListParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute("/agencies", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Single agency lookup JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-002).
     */
    async findJsonp(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializeAgencyFind(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedId = encodeURIComponent(pathSegment);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute(`/agencies/${encodedId}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifyAgencyHttpError)(decoded);
        });
    }
    /**
     * Multiple agency lookup JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-004).
     */
    async findManyJsonp(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializeAgencyFindMany(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedPath = pathSegment
            .split(",")
            .map((id) => encodeURIComponent(id))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute(`/agencies/${encodedPath}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Agency suggestions JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-005).
     */
    async suggestionsJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializeAgencySuggestionsParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _AgenciesService_client, "f"));
        return runtime.execute("/agencies/suggestions", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
}
exports.AgenciesService = AgenciesService;
_AgenciesService_client = new WeakMap();
//# sourceMappingURL=agencies.js.map