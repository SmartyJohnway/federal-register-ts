"use strict";
/**
 * R0-07B / R2-06 Site Notifications Service
 *
 * Implements:
 * 1. fr.siteNotifications.find(params: SiteNotificationFindParams): Promise<ActiveSiteNotification | InactiveSiteNotification>
 *    Path: /site_notifications/{id}
 *
 * Tri-state response contract:
 * - Active: HTTP 200 + typed object -> ActiveSiteNotification
 * - Inactive: HTTP 200 + {} -> InactiveSiteNotification
 * - Missing: HTTP 404 + empty body -> throws FederalRegisterEmptyBodyError
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
var _SiteNotificationsService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteNotificationsService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
const serializer_1 = require("../request/serializer");
class SiteNotificationsService {
    constructor(client) {
        _SiteNotificationsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _SiteNotificationsService_client, client, "f");
    }
    /**
     * Site notification lookup by identifier (FR-SITENOTIF-001).
     * Path: /site_notifications/{id}
     */
    async find(params) {
        const identifier = serializer_1.QuerySerializer.serializeSiteNotificationFind(params);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SiteNotificationsService_client, "f"));
        return runtime.execute(`/site_notifications/${encodeURIComponent(identifier)}`, undefined, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                if (decoded.bodyKind === "json" &&
                    decoded.parsedJson &&
                    typeof decoded.parsedJson === "object") {
                    if (Object.keys(decoded.parsedJson).length === 0) {
                        return decoded.parsedJson;
                    }
                    return decoded.parsedJson;
                }
                return decoded.parsedJson;
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    // --- FR-PROTO-003 JSONP Sibling Method ---
    /**
     * Site notification lookup JSONP format companion (FR-PROTO-003 companion to FR-SITENOTIF-001).
     */
    async findJsonp(params) {
        const identifier = serializer_1.QuerySerializer.serializeSiteNotificationFind(params);
        const entries = [];
        serializer_1.QuerySerializer.serializeJsonpCallback(params?.callback, entries);
        const qs = serializer_1.QuerySerializer.toQueryString(entries);
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _SiteNotificationsService_client, "f"));
        return runtime.execute(`/site_notifications/${encodeURIComponent(identifier)}`, qs, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
}
exports.SiteNotificationsService = SiteNotificationsService;
_SiteNotificationsService_client = new WeakMap();
//# sourceMappingURL=site_notifications.js.map