"use strict";
/**
 * R0-07B / R2-06 Topics Service
 *
 * Implements:
 * 1. fr.topics.suggestions(params: TopicSuggestionsParams): Promise<readonly TopicProjection<K>[]>
 *    Path: /topics/suggestions
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
var _TopicsService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicsService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class TopicsService {
    constructor(client) {
        _TopicsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _TopicsService_client, client, "f");
    }
    /**
     * Topic catalog (CAP-001).
     * Path: /topics.json
     */
    async list() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _TopicsService_client, "f"));
        return runtime.execute("/topics.json", undefined, transport_1.decodeJsonResponse);
    }
    /**
     * Topic suggestions (FR-TOPIC-001).
     * Path: /topics/suggestions
     */
    async suggestions(params) {
        const entries = serializer_1.QuerySerializer.serializeTopicSuggestionsParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _TopicsService_client, "f"));
        return runtime.execute("/topics/suggestions", qs, transport_1.decodeJsonResponse);
    }
    // --- FR-PROTO-003 JSONP Sibling Method ---
    /**
     * Topic suggestions JSONP format companion (FR-PROTO-003 companion to FR-TOPIC-001).
     */
    async suggestionsJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializeTopicSuggestionsParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _TopicsService_client, "f"));
        return runtime.execute("/topics/suggestions", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300)
                return decoded.rawText ?? "";
            throw (0, transport_1.decodeJsonResponse)(decoded);
        });
    }
}
exports.TopicsService = TopicsService;
_TopicsService_client = new WeakMap();
//# sourceMappingURL=topics.js.map