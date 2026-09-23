"use strict";
/**
 * R0-07B / R2-06 Effective Dates Service
 *
 * Implements:
 * 1. fr.effectiveDates.calculate(params: EffectiveDatesParams): Promise<EffectiveDateMap>
 *    Path: /effective-dates?start_date=...&end_date=...
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
var _EffectiveDatesService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectiveDatesService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class EffectiveDatesService {
    constructor(client) {
        _EffectiveDatesService_client.set(this, void 0);
        __classPrivateFieldSet(this, _EffectiveDatesService_client, client, "f");
    }
    /**
     * Calculate effective-date calendar (FR-EFFDATE-001).
     * Path: /effective-dates?start_date=...&end_date=...
     */
    async calculate(params) {
        const entries = serializer_1.QuerySerializer.serializeEffectiveDatesParams(params);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _EffectiveDatesService_client, "f"));
        return runtime.execute("/effective-dates", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.parsedJson;
            }
            throw (0, transport_1.classifyEffectiveDateHttpError)(decoded);
        });
    }
    // --- FR-PROTO-003 JSONP Sibling Method ---
    /**
     * Calculate effective-date calendar JSONP format companion (FR-PROTO-003 companion to FR-EFFDATE-001).
     */
    async calculateJsonp(params) {
        const entries = serializer_1.QuerySerializer.serializeEffectiveDatesParams(params);
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _EffectiveDatesService_client, "f"));
        return runtime.execute("/effective-dates", qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyEffectiveDateHttpError)(decoded);
        });
    }
}
exports.EffectiveDatesService = EffectiveDatesService;
_EffectiveDatesService_client = new WeakMap();
//# sourceMappingURL=effective_dates.js.map