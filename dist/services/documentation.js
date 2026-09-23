"use strict";
/**
 * R0-07B / R2-06 Documentation Service
 *
 * Implements:
 * 1. fr.documentation.fetchOpenApi(): Promise<FederalRegisterOpenApiDocument>
 *    Path: /documentation
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
var _DocumentationService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class DocumentationService {
    constructor(client) {
        _DocumentationService_client.set(this, void 0);
        __classPrivateFieldSet(this, _DocumentationService_client, client, "f");
    }
    /**
     * Fetch current Federal Register OpenAPI 3.0 document (FR-DOCS-001).
     * Path: /documentation
     */
    async fetchOpenApi() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentationService_client, "f"));
        return runtime.execute("/documentation", undefined, transport_1.decodeJsonResponse);
    }
    /**
     * Fetch current Federal Register OpenAPI 3.0 document as JSONP (FR-DOCS-001 companion).
     * Path: /documentation
     */
    async fetchOpenApiJsonp(params) {
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _DocumentationService_client, "f"));
        return runtime.execute("/documentation", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
}
exports.DocumentationService = DocumentationService;
_DocumentationService_client = new WeakMap();
//# sourceMappingURL=documentation.js.map