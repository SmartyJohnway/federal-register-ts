/**
 * R0-07C Runtime Request Validation and Rejection Rules
 *
 * Enforces:
 * - PositiveInteger, PageNumber (1..50), PerPage (2..2000), ExecutiveOrderCsvPerPage (2..10000)
 * - IsoDateString (YYYY-MM-DD)
 * - DateCondition exclusivity
 * - CfrCondition (title 1..50, part integer or range)
 * - NearCondition (non-blank location, within 1..200)
 * - SearchTypeId (1..6)
 * - Projection allowlists (DocumentField, PublicInspectionField, AgencyField, TopicField)
 * - DocumentOrderInput scalar and "date" normalization
 * - Non-blank path identifiers
 * - Non-empty readonly arrays for path lookups
 * - Null rejection, recursive undefined omission, empty array omission
 */
import { DocumentOrder, DocumentTypeCode, SearchTypeId, DateCondition, CfrCondition, NearCondition, NonEmptyReadonlyArray } from "./types";
export declare class RequestValidationError extends Error {
    readonly field?: string | undefined;
    readonly value?: any | undefined;
    constructor(message: string, field?: string | undefined, value?: any | undefined);
}
export declare const DOCUMENT_FIELDS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_FIELDS: ReadonlySet<string>;
export declare const AGENCY_FIELDS: ReadonlySet<string>;
export declare const TOPIC_FIELDS: ReadonlySet<string>;
export declare const CANONICAL_ORDERS: ReadonlySet<string>;
export declare function validateIsoDateString(val: any, fieldName: string): string;
export declare function validateBooleanQuery(val: any, fieldName: string): boolean;
export declare function validateTrueOnlyFlag(val: any, fieldName: string): boolean | undefined;
export declare function validateOrdinaryBoolean(val: any, fieldName: string): boolean;
export declare function validateStringArray(val: any, fieldName: string): string[] | undefined;
export declare function validatePositiveInteger(val: any, fieldName: string): number;
export declare function validatePageNumber(val: any, fieldName?: string): number;
export declare function validatePerPage(val: any, fieldName?: string): number;
export declare function validateExecutiveOrderCsvPerPage(val: any, fieldName?: string): number;
export declare function validateNonBlankString(val: any, fieldName: string): string;
export declare function validateSearchTypeId(val: any, fieldName?: string): SearchTypeId;
export declare function normalizeAndValidateOrder(val: any, fieldName?: string): DocumentOrder;
export declare function validateFields<T extends string>(fields: readonly any[] | any, allowlist: ReadonlySet<string>, resourceName: string): readonly T[];
export declare function validateDateCondition(cond: any, fieldName: string): DateCondition;
export declare function validateCfrCondition(cond: any, fieldName?: string): CfrCondition;
export declare function validateNearCondition(cond: any, fieldName?: string): NearCondition;
export declare function validateEffectiveDatesRange(startDate: any, endDate: any): void;
export declare function validateStrictBoolean(val: any, fieldName: string): boolean;
export declare function validateStringArrayFilter(arr: any, fieldName: string): readonly string[] | undefined;
export declare function validateClientOptions(options?: any, defaultBaseUrl?: string): {
    baseUrl: string;
    fetch: typeof globalThis.fetch;
};
export declare function validateNonEmptyArray<T>(arr: any, fieldName: string): NonEmptyReadonlyArray<T>;
export declare function validateJsonpCallback(callback: any, fieldName?: string): string;
export declare const DOCUMENT_TYPE_CODES: ReadonlySet<string>;
export declare function validateDocumentTypeCodes(types: any, fieldName?: string): readonly DocumentTypeCode[];
export declare function validateRequiredParams(params: any, contextName: string): void;
export declare function validateUnknownKeys(obj: any, allowedKeys: ReadonlySet<string>, contextName: string, allowCallback?: boolean): void;
export declare const DOCUMENT_SEARCH_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_SEARCH_CONDITIONS_KEYS: ReadonlySet<string>;
export declare const EXECUTIVE_ORDER_CSV_SEARCH_PARAMS_KEYS: ReadonlySet<string>;
export declare const EXECUTIVE_ORDER_CSV_CONDITIONS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_SEARCH_RSS_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_FIND_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_FIND_MANY_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_CITATION_FIND_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_CITATION_FIND_MANY_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_FIND_CSV_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_AUTOCOMPLETE_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_SEARCH_DETAILS_PARAMS_KEYS: ReadonlySet<string>;
export declare const DOCUMENT_FACET_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_SEARCH_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_SEARCH_CONDITIONS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_AVAILABLE_ON_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_CURRENT_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_CURRENT_CSV_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_FIND_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_FIND_MANY_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_SEARCH_CSV_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_SEARCH_RSS_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_SEARCH_DETAILS_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_FACET_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_ISSUE_DAILY_FACET_PARAMS_KEYS: ReadonlySet<string>;
export declare const PUBLIC_INSPECTION_ISSUE_TYPE_FACET_PARAMS_KEYS: ReadonlySet<string>;
export declare const AGENCY_LIST_PARAMS_KEYS: ReadonlySet<string>;
export declare const AGENCY_FIND_PARAMS_KEYS: ReadonlySet<string>;
export declare const AGENCY_FIND_MANY_PARAMS_KEYS: ReadonlySet<string>;
export declare const AGENCY_SUGGESTIONS_PARAMS_KEYS: ReadonlySet<string>;
export declare const TOPIC_SUGGESTIONS_PARAMS_KEYS: ReadonlySet<string>;
export declare const SUGGESTED_SEARCH_SECTIONS_PARAMS_KEYS: ReadonlySet<string>;
export declare const SUGGESTED_SEARCH_FIND_PARAMS_KEYS: ReadonlySet<string>;
export declare const EFFECTIVE_DATES_PARAMS_KEYS: ReadonlySet<string>;
export declare const ISSUE_FIND_PARAMS_KEYS: ReadonlySet<string>;
export declare const IMAGE_FIND_PARAMS_KEYS: ReadonlySet<string>;
export declare const SITE_NOTIFICATION_FIND_PARAMS_KEYS: ReadonlySet<string>;
//# sourceMappingURL=validation.d.ts.map