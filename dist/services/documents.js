"use strict";
/**
 * R0-07B / R2-04 Documents Service
 *
 * Implements the 7 frozen core JSON Document operations:
 * 1. fr.documents.search(params?: DocumentSearchParams): Promise<SearchResultEnvelope<DocumentSearchItem<K>>>
 * 2. fr.documents.find(params: DocumentFindParams): Promise<DocumentShow<K>>
 * 3. fr.documents.findMany(params: DocumentFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K>>>
 * 4. fr.documents.findByCitation(params: DocumentCitationFindParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>
 * 5. fr.documents.findManyByCitation(params: DocumentCitationFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>
 * 6. fr.documents.autocomplete(params: DocumentAutocompleteParams): Promise<DocumentAutocompleteSuggestion[]>
 * 7. fr.documents.searchDetails(params?: DocumentSearchDetailsParams): Promise<DocumentSearchDetails>
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
var _DocumentsService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
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
function decodeDocumentMultiLookupResponse(decoded) {
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
class DocumentsService {
    constructor(client) {
        _DocumentsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _DocumentsService_client, client, "f");
        this.facets = new facets_1.DocumentFacetsService(client);
    }
    /**
     * 1. Search documents with structured conditions and full-text search.
     * Path: /documents
     */
    async search(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentSearchParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents", qs, searchDecoder);
    }
    /**
     * 2. Single document lookup by document number.
     * Path: /documents/{documentNumber}
     */
    async find(params) {
        const entries = serializer_1.QuerySerializer.serializeDocumentFindQuery(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedDocNumber = encodeURIComponent(params.documentNumber);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(`/documents/${encodedDocNumber}`, qs, transport_1.decodeJsonResponse);
    }
    /**
     * 3. Multiple document lookup by comma-separated document numbers.
     * Path: /documents/{documentNumbers}
     * Returns MultiLookupEnvelope. Partial success with not_found errors is resolved, NOT thrown.
     */
    async findMany(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializeDocumentFindMany(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        // Each document number is separated by comma, pathSegment preserves commas
        const encodedPathSegment = pathSegment
            .split(",")
            .map((d) => encodeURIComponent(d))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(`/documents/${encodedPathSegment}`, qs, decodeDocumentMultiLookupResponse);
    }
    /**
     * 4. Single citation lookup.
     * Path: /documents/{volume}%20FR%20{page}
     * Upstream returns MultiLookupEnvelope for citation lookups.
     */
    async findByCitation(params) {
        const { volume, page, entries } = serializer_1.QuerySerializer.serializeDocumentCitationFind(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        // Wire format: /documents/{volume}%20FR%20{page}
        const path = `/documents/${encodeURIComponent(`${volume} FR ${page}`)}`;
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(path, qs, transport_1.decodeJsonResponse);
    }
    /**
     * 5. Multiple citation lookup.
     * Path: /documents/{citations}
     * Wire format: comma-separated {volume}%20FR%20{page} citations
     */
    async findManyByCitation(params) {
        const { entries } = serializer_1.QuerySerializer.serializeDocumentCitationFindMany(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const pathSegment = params.citations
            .map((c) => encodeURIComponent(`${c.volume} FR ${c.page}`))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(`/documents/${pathSegment}`, qs, transport_1.decodeJsonResponse);
    }
    /**
     * 6. Document autocomplete suggestions.
     * Path: /documents/autocomplete-suggestions
     */
    async autocomplete(params) {
        const entries = serializer_1.QuerySerializer.serializeDocumentAutocompleteParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents/autocomplete-suggestions", qs, transport_1.decodeJsonResponse);
    }
    /**
     * 7. Document search details.
     * Path: /documents/search-details
     */
    async searchDetails(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentSearchDetailsParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents/search-details", qs, searchDecoder);
    }
    /**
     * 8. Document show CSV export (FR-DOC-007).
     * Path: /documents/{ids}.csv
     */
    async findCsv(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializeDocumentFindCsv(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(`/documents/${pathSegment}.csv`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * 9. Document search RSS feed (FR-DOC-008).
     * Path: /documents.rss
     */
    async searchRss(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentSearchRssParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents.rss", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    /**
     * 10. Document search CSV export (FR-DOC-009).
     * Path: /documents.csv
     */
    async searchCsv(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentSearchCsvParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents.csv", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    /**
     * Document search JSONP format companion (FR-PROTO-003 companion to FR-DOC-001).
     */
    async searchJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentSearchParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    /**
     * Single document lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-002).
     */
    async findJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializeDocumentFindQuery(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedDocNumber = encodeURIComponent(params.documentNumber);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(`/documents/${encodedDocNumber}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Multiple document lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-003).
     */
    async findManyJsonp(params) {
        const { pathSegment, entries } = serializer_1.QuerySerializer.serializeDocumentFindMany(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const encodedPathSegment = pathSegment
            .split(",")
            .map((d) => encodeURIComponent(d))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(`/documents/${encodedPathSegment}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Single citation lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-004).
     */
    async findByCitationJsonp(params) {
        const { volume, page, entries } = serializer_1.QuerySerializer.serializeDocumentCitationFind(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const path = `/documents/${encodeURIComponent(`${volume} FR ${page}`)}`;
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(path, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Multiple citation lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-005).
     */
    async findManyByCitationJsonp(params) {
        const { entries } = serializer_1.QuerySerializer.serializeDocumentCitationFindMany(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const pathSegment = params.citations
            .map((c) => encodeURIComponent(`${c.volume} FR ${c.page}`))
            .join(",");
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute(`/documents/${pathSegment}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Document autocomplete JSONP format companion (FR-PROTO-003 companion to FR-DOC-010).
     */
    async autocompleteJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializeDocumentAutocompleteParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents/autocomplete-suggestions", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Document search details JSONP format companion (FR-PROTO-003 companion to FR-DOC-011).
     */
    async searchDetailsJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentSearchDetailsParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentsService_client, "f"));
        return runtime.execute("/documents/search-details", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
}
exports.DocumentsService = DocumentsService;
_DocumentsService_client = new WeakMap();
//# sourceMappingURL=documents.js.map