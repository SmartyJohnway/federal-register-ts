"use strict";
/**
 * R0-07B / R2-06 Issues Service
 *
 * Implements:
 * 1. fr.issues.find(params: IssueFindParams): Promise<IssueToc>
 *    Path: /issues/{YYYY-MM-DD}.json
 * 2. fr.issues.current(): Promise<IssueToc>
 *    Path: /issues/current.json
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
var _IssuesService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class IssuesService {
    constructor(client) {
        _IssuesService_client.set(this, void 0);
        __classPrivateFieldSet(this, _IssuesService_client, client, "f");
    }
    /**
     * Find issue table of contents by publication date (FR-ISSUE-001).
     * Path: /issues/{YYYY-MM-DD}.json
     */
    async find(params) {
        const pubDate = serializer_1.QuerySerializer.serializeIssueFind(params);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _IssuesService_client, "f"));
        return runtime.execute(`/issues/${encodeURIComponent(pubDate)}.json`, undefined, transport_1.decodeJsonResponse);
    }
    /**
     * Get current issue table of contents (FR-ISSUE-002).
     * Path: /issues/current.json
     */
    async current() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _IssuesService_client, "f"));
        return runtime.execute("/issues/current.json", undefined, transport_1.decodeJsonResponse);
    }
    // --- FR-PROTO-003 JSONP Sibling Methods ---
    /**
     * Find issue TOC JSONP format companion (FR-PROTO-003 companion to FR-ISSUE-001).
     */
    async findJsonp(params) {
        const pubDate = serializer_1.QuerySerializer.serializeIssueFind(params);
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _IssuesService_client, "f"));
        return runtime.execute(`/issues/${encodeURIComponent(pubDate)}.json`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
    /**
     * Current issue TOC JSONP format companion (FR-PROTO-003 companion to FR-ISSUE-002).
     */
    async currentJsonp(params) {
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _IssuesService_client, "f"));
        return runtime.execute("/issues/current.json", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
}
exports.IssuesService = IssuesService;
_IssuesService_client = new WeakMap();
//# sourceMappingURL=issues.js.map