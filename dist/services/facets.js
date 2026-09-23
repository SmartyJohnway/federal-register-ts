"use strict";
/**
 * R0-07B / R2-05 Facets & Aggregations Service Namespaces
 *
 * Implements the 15 frozen JSON Facet & Aggregation operations across 3 capability families:
 * 1. fr.documents.facets.* (10 Document facets)
 *    - agency: GET /documents/facets/agency -> DocumentAgencyFacetMap
 *    - topic: GET /documents/facets/topic -> DocumentTopicFacetMap
 *    - section: GET /documents/facets/section -> DocumentSectionFacetMap
 *    - type: GET /documents/facets/type -> DocumentTypeFacetMap
 *    - subtype: GET /documents/facets/subtype -> DocumentSubtypeFacetMap
 *    - daily: GET /documents/facets/daily -> DocumentDailyFacetMap
 *    - weekly: GET /documents/facets/weekly -> DocumentWeeklyFacetMap
 *    - monthly: GET /documents/facets/monthly -> DocumentMonthlyFacetMap
 *    - quarterly: GET /documents/facets/quarterly -> DocumentQuarterlyFacetMap
 *    - yearly: GET /documents/facets/yearly -> DocumentYearlyFacetMap
 *
 * 2. fr.publicInspection.facets.* (3 Public Inspection Document facets)
 *    - type: GET /public-inspection-documents/facets/type -> PublicInspectionTypeFacetMap
 *    - agency: GET /public-inspection-documents/facets/agency -> PublicInspectionAgencyIdFacetMap
 *    - agencies: GET /public-inspection-documents/facets/agencies -> PublicInspectionAgencySlugFacetMap
 *
 * 3. fr.publicInspection.issues.facets.* (2 Public Inspection Issue facets)
 *    - daily: GET /public-inspection-issues/facets/daily -> PublicInspectionIssueDailyFacetMap
 *    - type: GET /public-inspection-issues/facets/type -> PublicInspectionIssueTypeFacetMap
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
var _DocumentFacetsService_client, _PublicInspectionFacetsService_client, _PublicInspectionIssueFacetsService_client, _PublicInspectionIssuesService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInspectionIssuesService = exports.PublicInspectionIssueFacetsService = exports.PublicInspectionFacetsService = exports.DocumentFacetsService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
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
 * Service namespace for Document facets (fr.documents.facets.*)
 */
class DocumentFacetsService {
    constructor(client) {
        _DocumentFacetsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _DocumentFacetsService_client, client, "f");
    }
    /**
     * 1. Document agency facet.
     * Path: /documents/facets/agency
     */
    async agency(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/agency", qs, searchDecoder);
    }
    /**
     * 2. Document topic facet.
     * Path: /documents/facets/topic
     */
    async topic(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/topic", qs, searchDecoder);
    }
    /**
     * 3. Document section facet.
     * Path: /documents/facets/section
     */
    async section(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/section", qs, searchDecoder);
    }
    /**
     * 4. Document type facet.
     * Path: /documents/facets/type
     */
    async type(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/type", qs, searchDecoder);
    }
    /**
     * 5. Document subtype facet.
     * Path: /documents/facets/subtype
     */
    async subtype(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/subtype", qs, searchDecoder);
    }
    /**
     * 6. Document daily date facet.
     * Path: /documents/facets/daily
     */
    async daily(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/daily", qs, searchDecoder);
    }
    /**
     * 7. Document weekly date facet.
     * Path: /documents/facets/weekly
     */
    async weekly(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/weekly", qs, searchDecoder);
    }
    /**
     * 8. Document monthly date facet.
     * Path: /documents/facets/monthly
     */
    async monthly(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/monthly", qs, searchDecoder);
    }
    /**
     * 9. Document quarterly date facet.
     * Path: /documents/facets/quarterly
     */
    async quarterly(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/quarterly", qs, searchDecoder);
    }
    /**
     * 10. Document yearly date facet.
     * Path: /documents/facets/yearly
     */
    async yearly(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/yearly", qs, searchDecoder);
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    async agencyJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/agency", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async topicJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/topic", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async sectionJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/section", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async typeJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/type", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async subtypeJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/subtype", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async dailyJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/daily", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async weeklyJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/weekly", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async monthlyJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/monthly", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async quarterlyJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/quarterly", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async yearlyJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializeDocumentFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentFacetsService_client, "f"));
        return runtime.execute("/documents/facets/yearly", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
}
exports.DocumentFacetsService = DocumentFacetsService;
_DocumentFacetsService_client = new WeakMap();
/**
 * Service namespace for Public Inspection document facets (fr.publicInspection.facets.*)
 */
class PublicInspectionFacetsService {
    constructor(client) {
        _PublicInspectionFacetsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _PublicInspectionFacetsService_client, client, "f");
    }
    /**
     * 1. Public Inspection type facet.
     * Path: /public-inspection-documents/facets/type
     */
    async type(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionFacetsService_client, "f"));
        return runtime.execute("/public-inspection-documents/facets/type", qs, searchDecoder);
    }
    /**
     * 2. Public Inspection agency facet (keyed by Agency ID).
     * Path: /public-inspection-documents/facets/agency
     */
    async agency(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionFacetsService_client, "f"));
        return runtime.execute("/public-inspection-documents/facets/agency", qs, searchDecoder);
    }
    /**
     * 3. Public Inspection agencies facet (keyed by Agency slug).
     * Path: /public-inspection-documents/facets/agencies
     */
    async agencies(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionFacetParams(params) : [];
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionFacetsService_client, "f"));
        return runtime.execute("/public-inspection-documents/facets/agencies", qs, searchDecoder);
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    async typeJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionFacetsService_client, "f"));
        return runtime.execute("/public-inspection-documents/facets/type", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async agencyJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionFacetsService_client, "f"));
        return runtime.execute("/public-inspection-documents/facets/agency", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
    async agenciesJsonp(params) {
        const entries = params ? serializer_1.QuerySerializer.serializePublicInspectionFacetParams(params) : [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionFacetsService_client, "f"));
        return runtime.execute("/public-inspection-documents/facets/agencies", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.classifySearchHttpError)(decoded);
        });
    }
}
exports.PublicInspectionFacetsService = PublicInspectionFacetsService;
_PublicInspectionFacetsService_client = new WeakMap();
/**
 * Service namespace for Public Inspection Issue facets (fr.publicInspection.issues.facets.*)
 */
class PublicInspectionIssueFacetsService {
    constructor(client) {
        _PublicInspectionIssueFacetsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _PublicInspectionIssueFacetsService_client, client, "f");
    }
    /**
     * 1. Daily Public Inspection Issue facet.
     * Path: /public-inspection-issues/facets/daily
     * Requires: publicationDate.gte
     * Uses decodePublicInspectionIssueFacetResponse for HTTP 200 { status: 400, error: string } quirk.
     */
    async daily(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionIssueDailyFacetParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionIssueFacetsService_client, "f"));
        return runtime.execute("/public-inspection-issues/facets/daily", qs, transport_1.decodePublicInspectionIssueFacetResponse);
    }
    /**
     * 2. Type Public Inspection Issue facet.
     * Path: /public-inspection-issues/facets/type
     * Requires: publicationDate.is
     * Uses decodePublicInspectionIssueFacetResponse for HTTP 200 { status: 400, error: string } quirk.
     */
    async type(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionIssueTypeFacetParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionIssueFacetsService_client, "f"));
        return runtime.execute("/public-inspection-issues/facets/type", qs, transport_1.decodePublicInspectionIssueFacetResponse);
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    async dailyJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionIssueDailyFacetParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionIssueFacetsService_client, "f"));
        return runtime.execute("/public-inspection-issues/facets/daily", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                if (decoded.bodyKind === "json" &&
                    decoded.parsedJson &&
                    decoded.parsedJson.status === 400 &&
                    typeof decoded.parsedJson.error === "string") {
                    throw (0, transport_1.decodePublicInspectionIssueFacetResponse)(decoded);
                }
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.decodePublicInspectionIssueFacetResponse)(decoded);
        });
    }
    async typeJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializePublicInspectionIssueTypeFacetParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _PublicInspectionIssueFacetsService_client, "f"));
        return runtime.execute("/public-inspection-issues/facets/type", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                if (decoded.bodyKind === "json" &&
                    decoded.parsedJson &&
                    decoded.parsedJson.status === 400 &&
                    typeof decoded.parsedJson.error === "string") {
                    throw (0, transport_1.decodePublicInspectionIssueFacetResponse)(decoded);
                }
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.decodePublicInspectionIssueFacetResponse)(decoded);
        });
    }
}
exports.PublicInspectionIssueFacetsService = PublicInspectionIssueFacetsService;
_PublicInspectionIssueFacetsService_client = new WeakMap();
/**
 * Nested presenter for Public Inspection Issues (fr.publicInspection.issues.*)
 */
class PublicInspectionIssuesService {
    constructor(client) {
        _PublicInspectionIssuesService_client.set(this, void 0);
        __classPrivateFieldSet(this, _PublicInspectionIssuesService_client, client, "f");
        this.facets = new PublicInspectionIssueFacetsService(client);
    }
}
exports.PublicInspectionIssuesService = PublicInspectionIssuesService;
_PublicInspectionIssuesService_client = new WeakMap();
//# sourceMappingURL=facets.js.map