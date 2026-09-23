"use strict";
/**
 * R0-07A / R2-03 / R2-04 Canonical FederalRegisterClient
 *
 * Implements the frozen Client contract defined in:
 * - R0-07A_Canonical_SDK_Architecture_and_Naming_Policy_2026-09-12.md
 * - R0-07B_Operation_Namespace_and_Export_Surface_2026-09-12.md
 * - R2-03 Public Client Configuration Contract Clarification v1.0
 * - R2-03_Internal_Transport_Architecture_Contract_Adjudication_Clarification_v1.0
 * - R2-04 Core Resource Families Authorization & Execution Contract
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _FederalRegisterClient_baseUrl, _FederalRegisterClient_fetch;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FederalRegisterClient = void 0;
const runtime_1 = require("./internal/runtime");
const documents_1 = require("../services/documents");
const public_inspection_1 = require("../services/public_inspection");
const agencies_1 = require("../services/agencies");
const topics_1 = require("../services/topics");
const sections_1 = require("../services/sections");
const suggested_searches_1 = require("../services/suggested_searches");
const holidays_1 = require("../services/holidays");
const effective_dates_1 = require("../services/effective_dates");
const issues_1 = require("../services/issues");
const images_1 = require("../services/images");
const category_counts_1 = require("../services/category_counts");
const site_notifications_1 = require("../services/site_notifications");
const documentation_1 = require("../services/documentation");
const clippings_1 = require("../services/clippings");
/**
 * Internal default base URL.
 * Retained internally; not exported publicly.
 */
const DEFAULT_BASE_URL = "https://www.federalregister.gov/api/v1";
const validation_1 = require("../request/validation");
function validateBaseUrl(url) {
    if (url === undefined) {
        return DEFAULT_BASE_URL;
    }
    if (typeof url !== "string") {
        throw new validation_1.RequestValidationError(`baseUrl option must be a valid http or https absolute URL string. Received: ${JSON.stringify(url)}`, "baseUrl", url);
    }
    const trimmed = url.trim();
    if (trimmed === "") {
        throw new validation_1.RequestValidationError(`baseUrl option cannot be empty or whitespace. Received: ${JSON.stringify(url)}`, "baseUrl", url);
    }
    let parsed;
    try {
        parsed = new URL(trimmed);
    }
    catch {
        throw new validation_1.RequestValidationError(`baseUrl option must be a valid absolute URL. Received: ${JSON.stringify(url)}`, "baseUrl", url);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new validation_1.RequestValidationError(`baseUrl protocol must be http: or https:. Received: ${parsed.protocol}`, "baseUrl", url);
    }
    if (parsed.search !== "" || parsed.hash !== "") {
        throw new validation_1.RequestValidationError(`baseUrl cannot contain query parameters or fragments. Received: ${JSON.stringify(url)}`, "baseUrl", url);
    }
    return trimmed.replace(/\/+$/, "");
}
function validateFetchFn(fetchFn) {
    if (fetchFn === undefined) {
        return globalThis.fetch;
    }
    if (typeof fetchFn !== "function") {
        throw new validation_1.RequestValidationError(`fetch option must be a function. Received: ${JSON.stringify(fetchFn)}`, "fetch", fetchFn);
    }
    return fetchFn;
}
class FederalRegisterClient {
    constructor(options) {
        _FederalRegisterClient_baseUrl.set(this, void 0);
        _FederalRegisterClient_fetch.set(this, void 0);
        if (options !== undefined && (typeof options !== "object" || options === null || Array.isArray(options))) {
            throw new validation_1.RequestValidationError(`FederalRegisterClient constructor options must be an object. Received: ${JSON.stringify(options)}`, "options", options);
        }
        const baseUrl = validateBaseUrl(options?.baseUrl);
        const fetchFn = validateFetchFn(options?.fetch);
        __classPrivateFieldSet(this, _FederalRegisterClient_baseUrl, baseUrl, "f");
        __classPrivateFieldSet(this, _FederalRegisterClient_fetch, fetchFn, "f");
        // Register this instance's transport in the internal runtime bridge.
        // The runtime closure captures baseUrl and fetchFn by value —
        // no process-global mutable state is involved.
        (0, runtime_1.initializeClientRuntime)(this, { baseUrl, fetch: fetchFn });
        // Initialize core resource service namespaces bound to this client instance
        this.documents = new documents_1.DocumentsService(this);
        this.publicInspection = new public_inspection_1.PublicInspectionService(this);
        this.agencies = new agencies_1.AgenciesService(this);
        this.topics = new topics_1.TopicsService(this);
        this.sections = new sections_1.SectionsService(this);
        this.suggestedSearches = new suggested_searches_1.SuggestedSearchesService(this);
        this.holidays = new holidays_1.HolidaysService(this);
        this.effectiveDates = new effective_dates_1.EffectiveDatesService(this);
        this.issues = new issues_1.IssuesService(this);
        this.images = new images_1.ImagesService(this);
        this.categoryCounts = new category_counts_1.CategoryCountsService(this);
        this.siteNotifications = new site_notifications_1.SiteNotificationsService(this);
        this.documentation = new documentation_1.DocumentationService(this);
        this.clippings = new clippings_1.ClippingsService(this);
    }
}
exports.FederalRegisterClient = FederalRegisterClient;
_FederalRegisterClient_baseUrl = new WeakMap(), _FederalRegisterClient_fetch = new WeakMap();
//# sourceMappingURL=client.js.map