"use strict";
/**
 * R0-07B / R2-04 Public Inspection Service
 *
 * Implements the 6 frozen core JSON Public Inspection operations:
 * 1. fr.publicInspection.search(params?: PublicInspectionSearchParams): Promise<SearchResultEnvelope<PublicInspectionSearchItem<K>>>
 * 2. fr.publicInspection.availableOn(params: PublicInspectionAvailableOnParams): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>
 * 3. fr.publicInspection.current(params?: PublicInspectionCurrentParams): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>
 * 4. fr.publicInspection.find(params: PublicInspectionFindParams): Promise<PublicInspectionShow<K>>
 * 5. fr.publicInspection.findMany(params: PublicInspectionFindManyParams): Promise<MultiLookupEnvelope<PublicInspectionShow<K>>>
 * 6. fr.publicInspection.searchDetails(params?: PublicInspectionSearchDetailsParams): Promise<PublicInspectionSearchDetails>
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
var _PublicInspectionService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInspectionService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
const facets_1 = require("./facets");
/**
 * Operation-aware search decoder using classifySearchHttpError.
 */
function searchDecoder(decoded) {
    if (decoded.status >= 200 && decoded.status < 300) {
        return (0, transport_1.decodeJsonResponse)(decoded);
    }
    throw (0, transport_1.classifySearchHttpError)(decoded);
}
/**
 * Multi-lookup decoder normalizing upstream single-item response polymorphism.
 */
function decodePublicInspectionMultiLookupResponse(decoded) {
    const parsed = (0, transport_1.decodeJsonResponse)(decoded);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        if ("results" in parsed && Array.isArray(parsed.results)) {
            return parsed;
        }
        if ("errors" in parsed && parsed.errors && typeof parsed.errors === "object") {
            return {
                count: typeof parsed.count === "number" ? parsed.count : 0,
                results: Array.isArray(parsed.results) ? parsed.results : [],
                errors: parsed.errors,
            };
        }
        return {
            count: 1,
            results: [parsed],
        };
    }
    return parsed;
}
class PublicInspectionService {
    constructor(client) {
        _PublicInspectionService_client.set(this, void 0);
        __classPrivateFieldSet(this, _PublicInspectionService_client, client, "f");
        this.facets = new facets_1.PublicInspectionFacetsService(client);
        this.issues = new facets_1.PublicInspectionIssuesService(client);
    }
    /**
     * 1. Public Inspection search with structured conditions and full-text search.
     * Path: /public-inspection-documents
     */
    async search(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionSearchParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents", qs, searchDecoder);
    }
    /**
     * 2. Available-on exact issue-date retrieval.
     * Path: /public-inspection-documents?conditions[available_on]=YYYY-MM-DD
     * Returns PublicInspectionIssueDocumentsEnvelope.
     */
    async availableOn(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionAvailableOnParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents", qs, transport_1.decodeJsonResponse);
    }
    /**
     * 3. Current Public Inspection documents.
     * Path: /public-inspection-documents/current
     * Returns PublicInspectionIssueDocumentsEnvelope.
     */
    async current(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionCurrentParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents/current", qs, transport_1.decodeJsonResponse);
    }
    /**
     * 4. Single Public Inspection document lookup by document number.
     * Path: /public-inspection-documents/{documentNumber}
     */
    async find(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionFindQuery(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedDocNumber = encodeURIComponent(params.documentNumber);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute(`/public-inspection-documents/${encodedDocNumber}`, qs, transport_1.decodeJsonResponse);
    }
    /**
     * 5. Multiple Public Inspection document lookup by comma-separated numbers.
     * Path: /public-inspection-documents/{documentNumbers}
     * Returns MultiLookupEnvelope. Partial success with not_found errors is resolved, NOT thrown.
     */
    async findMany(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializePublicInspectionFindMany(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedPathSegment = pathSegment
            .split(",")
            .map((d) => encodeURIComponent(d))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute(`/public-inspection-documents/${encodedPathSegment}`, qs, decodePublicInspectionMultiLookupResponse);
    }
    /**
     * 6. Public Inspection search details.
     * Path: /public-inspection-documents/search-details
     */
    async searchDetails(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionSearchDetailsParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents/search-details", qs, searchDecoder);
    }
    /**
     * 7. Public Inspection current CSV export (FR-PI-004).
     * Path: /public-inspection-documents/current.csv
     */
    async currentCsv(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionCurrentParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents/current.csv", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * 8. Public Inspection search CSV export (FR-PI-007).
     * Path: /public-inspection-documents.csv
     */
    async searchCsv(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionSearchCsvParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents.csv", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    /**
     * 9. Public Inspection search RSS feed (FR-PI-008).
     * Path: /public-inspection-documents.rss
     */
    async searchRss(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionSearchConditionsOnly(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents.rss", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    /**
     * Public inspection search JSONP format companion (FR-PROTO-003 companion to FR-PI-001).
     */
    async searchJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionSearchParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    /**
     * Available on date JSONP format companion (FR-PROTO-003 companion to FR-PI-002).
     */
    async availableOnJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionAvailableOnParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Current public inspection JSONP format companion (FR-PROTO-003 companion to FR-PI-003).
     */
    async currentJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionCurrentParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents/current", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Single public inspection document lookup JSONP format companion (FR-PROTO-003 companion to FR-PI-005).
     */
    async findJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionFindQuery(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedDocNumber = encodeURIComponent(params.documentNumber);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute(`/public-inspection-documents/${encodedDocNumber}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Multiple public inspection document lookup JSONP format companion (FR-PROTO-003 companion to FR-PI-006).
     */
    async findManyJsonp(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializePublicInspectionFindMany(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedPathSegment = pathSegment
            .split(",")
            .map((d) => encodeURIComponent(d))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute(`/public-inspection-documents/${encodedPathSegment}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Public inspection search details JSONP format companion (FR-PROTO-003 companion to FR-PI-009).
     */
    async searchDetailsJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionSearchDetailsParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionService_client, "f"));
        return runtime.execute("/public-inspection-documents/search-details", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
}
exports.PublicInspectionService = PublicInspectionService;
_PublicInspectionService_client = new WeakMap();
//# sourceMappingURL=public_inspection.js.map