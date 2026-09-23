"use strict";
/**
 * R0-07B / R2-06 Category Counts Service
 *
 * Implements:
 * 1. fr.categoryCounts.documentTypeCsv(): Promise<DocumentTypeCategoryCountCsvText>
 *    Path: /category_counts/document_type.csv
 * 2. fr.categoryCounts.pageCountCsv(): Promise<PageCountCategoryCountCsvText>
 *    Path: /category_counts/page_count.csv
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
var _CategoryCountsService_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryCountsService = void 0;
const runtime_1 = require("../core/internal/runtime");
const transport_1 = require("../core/transport");
class CategoryCountsService {
    constructor(client) {
        _CategoryCountsService_client.set(this, void 0);
        __classPrivateFieldSet(this, _CategoryCountsService_client, client, "f");
    }
    /**
     * Document-type category count raw CSV report (FR-CATCOUNT-001).
     * Path: /category_counts/document_type.csv
     */
    async documentTypeCsv() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _CategoryCountsService_client, "f"));
        return runtime.execute("/category_counts/document_type.csv", undefined, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
    /**
     * Page-count category count raw CSV report (FR-CATCOUNT-002).
     * Path: /category_counts/page_count.csv
     */
    async pageCountCsv() {
        const runtime = (0, runtime_1.getInternalClientRuntime)(__classPrivateFieldGet(this, _CategoryCountsService_client, "f"));
        return runtime.execute("/category_counts/page_count.csv", undefined, (decoded) => {
            if (decoded.status >= 200 && decoded.status < 300) {
                return decoded.rawText ?? "";
            }
            throw (0, transport_1.classifyGenericHttpError)(decoded);
        });
    }
}
exports.CategoryCountsService = CategoryCountsService;
_CategoryCountsService_client = new WeakMap();
//# sourceMappingURL=category_counts.js.map