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

import {
  DocumentField,
  PublicInspectionField,
  AgencyField,
  TopicField,
  DocumentOrder,
  DocumentOrderInput,
  DocumentTypeCode,
  SearchTypeId,
  DateCondition,
  CfrCondition,
  NearCondition,
  NonEmptyReadonlyArray,
} from "./types";

export class RequestValidationError extends Error {
  constructor(message: string, public readonly field?: string, public readonly value?: any) {
    super(message);
    this.name = "RequestValidationError";
  }
}

// 53-field Document projection allowlist
export const DOCUMENT_FIELDS: ReadonlySet<string> = new Set<DocumentField>([
  "abstract",
  "action",
  "agencies",
  "agency_names",
  "body_html_url",
  "cfr_references",
  "citation",
  "comment_url",
  "comments_close_on",
  "correction_of",
  "corrections",
  "dates",
  "disposition_notes",
  "docket_id",
  "docket_ids",
  "dockets",
  "document_number",
  "effective_on",
  "end_page",
  "excerpts",
  "executive_order_notes",
  "executive_order_number",
  "explanation",
  "full_text_xml_url",
  "html_url",
  "images",
  "images_metadata",
  "json_url",
  "mods_url",
  "not_received_for_publication",
  "page_length",
  "page_views",
  "pdf_url",
  "president",
  "presidential_document_number",
  "proclamation_number",
  "public_inspection_pdf_url",
  "publication_date",
  "raw_text_url",
  "regulation_id_number_info",
  "regulation_id_numbers",
  "regulations_dot_gov_info",
  "regulations_dot_gov_url",
  "significant",
  "signing_date",
  "start_page",
  "subtype",
  "title",
  "toc_doc",
  "toc_subject",
  "topics",
  "type",
  "volume",
]);

// 27-field Public Inspection projection allowlist
export const PUBLIC_INSPECTION_FIELDS: ReadonlySet<string> = new Set<PublicInspectionField>([
  "agencies",
  "agency_letters",
  "agency_names",
  "docket_numbers",
  "document_number",
  "editorial_note",
  "excerpts",
  "filed_at",
  "filing_type",
  "html_url",
  "json_url",
  "last_public_inspection_issue",
  "num_pages",
  "page_views",
  "pdf_file_name",
  "pdf_file_size",
  "pdf_updated_at",
  "pdf_url",
  "publication_date",
  "raw_text_url",
  "subject_1",
  "subject_2",
  "subject_3",
  "title",
  "toc_doc",
  "toc_subject",
  "type",
]);

// 12-field Agency projection allowlist (json_url is index-only augmentation, not selectable)
export const AGENCY_FIELDS: ReadonlySet<string> = new Set<AgencyField>([
  "id",
  "parent_id",
  "child_ids",
  "child_slugs",
  "name",
  "short_name",
  "slug",
  "url",
  "agency_url",
  "description",
  "recent_articles_url",
  "logo",
]);

// 3-field Topic projection allowlist
export const TOPIC_FIELDS: ReadonlySet<string> = new Set<TopicField>([
  "name",
  "slug",
  "url",
]);

export const CANONICAL_ORDERS: ReadonlySet<string> = new Set<DocumentOrder>([
  "relevance",
  "newest",
  "oldest",
  "executive_order_number",
  "proclamation_number",
  "id",
]);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateIsoDateString(val: any, fieldName: string): string {
  if (typeof val !== "string" || !ISO_DATE_REGEX.test(val)) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be a valid ISO date string in YYYY-MM-DD format. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  const [yearStr, monthStr, dayStr] = val.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (month < 1 || month > 12) {
    throw new RequestValidationError(
      `Field '${fieldName}' contains invalid date components: ${val}`,
      fieldName,
      val
    );
  }
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (day < 1 || day > daysInMonth[month - 1]) {
    throw new RequestValidationError(
      `Field '${fieldName}' contains invalid calendar date: ${val}`,
      fieldName,
      val
    );
  }
  return val;
}

export function validatePositiveInteger(val: any, fieldName: string): number {
  if (typeof val !== "number" || !Number.isInteger(val) || val <= 0) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be a positive integer (> 0). Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  return val;
}

export function validatePageNumber(val: any, fieldName = "page"): number {
  if (typeof val !== "number" || !Number.isInteger(val) || val < 1 || val > 50) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be an integer between 1 and 50. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  return val;
}

export function validatePerPage(val: any, fieldName = "perPage"): number {
  if (typeof val !== "number" || !Number.isInteger(val) || val < 2 || val > 2000) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be an integer between 2 and 2000. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  return val;
}

export function validateExecutiveOrderCsvPerPage(val: any, fieldName = "perPage"): number {
  if (typeof val !== "number" || !Number.isInteger(val) || val < 2 || val > 10000) {
    throw new RequestValidationError(
      `Field '${fieldName}' for Executive Order CSV search must be an integer between 2 and 10000. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  return val;
}

export function validateNonBlankString(val: any, fieldName: string): string {
  if (typeof val !== "string" || val.trim().length === 0) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be a non-blank string. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  return val;
}

export function validateSearchTypeId(val: any, fieldName = "searchTypeId"): SearchTypeId {
  if (typeof val !== "number" || ![1, 2, 3, 4, 5, 6].includes(val)) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be a valid SearchTypeId (1, 2, 3, 4, 5, or 6). Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  return val as SearchTypeId;
}

export function normalizeAndValidateOrder(val: any, fieldName = "order"): DocumentOrder {
  if (Array.isArray(val)) {
    throw new RequestValidationError(
      `Field '${fieldName}' is scalar and does not accept array forms. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  if (typeof val !== "string") {
    throw new RequestValidationError(
      `Field '${fieldName}' must be a scalar string. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  if (val === "date") {
    return "newest";
  }
  if (!CANONICAL_ORDERS.has(val as DocumentOrder)) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be one of ${Array.from(CANONICAL_ORDERS).join(", ")}, or compatibility alias 'date'. Received: ${JSON.stringify(val)}`,
      fieldName,
      val
    );
  }
  return val as DocumentOrder;
}

export function validateFields<T extends string>(
  fields: readonly any[] | any,
  allowlist: ReadonlySet<string>,
  resourceName: string
): readonly T[] {
  if (!Array.isArray(fields)) {
    throw new RequestValidationError(
      `Projection 'fields' for ${resourceName} must be an array, not a comma-separated string or scalar. Received: ${JSON.stringify(fields)}`,
      "fields",
      fields
    );
  }
  for (const f of fields) {
    if (f === null || f === undefined) {
      throw new RequestValidationError(
        `Projection 'fields' array contains null or undefined elements.`,
        "fields",
        fields
      );
    }
    if (typeof f !== "string" || !allowlist.has(f)) {
      throw new RequestValidationError(
        `Unknown field '${f}' for ${resourceName} projection. Must be one of allowlist.`,
        "fields",
        f
      );
    }
  }
  return fields as readonly T[];
}

export function validateDateCondition(cond: any, fieldName: string): DateCondition {
  if (typeof cond !== "object" || cond === null || Array.isArray(cond)) {
    throw new RequestValidationError(
      `Date condition for '${fieldName}' must be a structured object. Received: ${JSON.stringify(cond)}`,
      fieldName,
      cond
    );
  }
  const hasIs = cond.is !== undefined;
  const hasYear = cond.year !== undefined;
  const hasGte = cond.gte !== undefined;
  const hasLte = cond.lte !== undefined;

  let activeModes = 0;
  if (hasIs) activeModes++;
  if (hasYear) activeModes++;
  if (hasGte || hasLte) activeModes++;

  if (activeModes !== 1) {
    throw new RequestValidationError(
      `Date condition for '${fieldName}' must specify exactly one selector mode: 'is', 'year', or 'gte'/'lte' range. Conflicting modes specified: ${JSON.stringify(cond)}`,
      fieldName,
      cond
    );
  }

  if (hasIs) {
    validateIsoDateString(cond.is, `${fieldName}.is`);
  } else if (hasYear) {
    if (typeof cond.year !== "number" || !Number.isInteger(cond.year) || cond.year < 1700 || cond.year > 2200) {
      throw new RequestValidationError(
        `Date condition '${fieldName}.year' must be a valid 4-digit integer year. Received: ${JSON.stringify(cond.year)}`,
        `${fieldName}.year`,
        cond.year
      );
    }
  } else {
    if (hasGte) validateIsoDateString(cond.gte, `${fieldName}.gte`);
    if (hasLte) validateIsoDateString(cond.lte, `${fieldName}.lte`);
    if (hasGte && hasLte && cond.gte > cond.lte) {
      throw new RequestValidationError(
        `Date range for '${fieldName}' has gte (${cond.gte}) greater than lte (${cond.lte}).`,
        fieldName,
        cond
      );
    }
  }
  return cond as DateCondition;
}

export function validateCfrCondition(cond: any, fieldName = "cfr"): CfrCondition {
  if (typeof cond !== "object" || cond === null || Array.isArray(cond)) {
    throw new RequestValidationError(
      `CfrCondition for '${fieldName}' must be an object. Received: ${JSON.stringify(cond)}`,
      fieldName,
      cond
    );
  }
  if (cond.title === undefined || typeof cond.title !== "number" || !Number.isInteger(cond.title) || cond.title < 1 || cond.title > 50) {
    throw new RequestValidationError(
      `CFR title must be an integer between 1 and 50. Received: ${JSON.stringify(cond.title)}`,
      `${fieldName}.title`,
      cond.title
    );
  }
  if (cond.part !== undefined) {
    if (typeof cond.part === "number") {
      if (!Number.isInteger(cond.part) || cond.part < 0) {
        throw new RequestValidationError(
          `CFR part must be a non-negative integer. Received: ${JSON.stringify(cond.part)}`,
          `${fieldName}.part`,
          cond.part
        );
      }
    } else if (typeof cond.part === "string") {
      const rangeMatch = /^(\d+)-(\d+)$/.exec(cond.part);
      if (!rangeMatch) {
        throw new RequestValidationError(
          `CFR part range must be formatted as '<start>-<end>'. Received: ${JSON.stringify(cond.part)}`,
          `${fieldName}.part`,
          cond.part
        );
      }
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (start > end) {
        throw new RequestValidationError(
          `CFR part range start (${start}) cannot exceed end (${end}).`,
          `${fieldName}.part`,
          cond.part
        );
      }
    } else {
      throw new RequestValidationError(
        `CFR part must be an integer or range string. Received: ${JSON.stringify(cond.part)}`,
        `${fieldName}.part`,
        cond.part
      );
    }
  }
  return cond as CfrCondition;
}

export function validateNearCondition(cond: any, fieldName = "near"): NearCondition {
  if (typeof cond !== "object" || cond === null || Array.isArray(cond)) {
    throw new RequestValidationError(
      `NearCondition for '${fieldName}' must be an object. Received: ${JSON.stringify(cond)}`,
      fieldName,
      cond
    );
  }
  validateNonBlankString(cond.location, `${fieldName}.location`);
  if (cond.within !== undefined) {
    if (typeof cond.within !== "number" || !Number.isInteger(cond.within) || cond.within < 1 || cond.within > 200) {
      throw new RequestValidationError(
        `NearCondition 'within' must be an integer between 1 and 200 miles. Received: ${JSON.stringify(cond.within)}`,
        `${fieldName}.within`,
        cond.within
      );
    }
  }
  return cond as NearCondition;
}

export function validateEffectiveDatesRange(startDate: any, endDate: any): void {
  validateIsoDateString(startDate, "startDate");
  validateIsoDateString(endDate, "endDate");
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 120) {
    throw new RequestValidationError(
      `EffectiveDates range (${startDate} to ${endDate}) spans ${diffDays} days, exceeding the 120-day maximum supported range.`,
      "effectiveDates",
      { startDate, endDate, diffDays }
    );
  }
}

export function validateNonEmptyArray<T>(arr: any, fieldName: string): NonEmptyReadonlyArray<T> {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be a non-empty array. Received: ${JSON.stringify(arr)}`,
      fieldName,
      arr
    );
  }
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === null || arr[i] === undefined) {
      throw new RequestValidationError(
        `Array '${fieldName}' contains nullish entry at index ${i}.`,
        fieldName,
        arr
      );
    }
  }
  return arr as unknown as NonEmptyReadonlyArray<T>;
}

const JSONP_CALLBACK_REGEX = /^[A-Za-z0-9_.]+$/;

export function validateJsonpCallback(callback: any, fieldName: string = "callback"): string {
  if (typeof callback !== "string" || !JSONP_CALLBACK_REGEX.test(callback)) {
    throw new RequestValidationError(
      `JSONP callback must be a non-empty string matching /^[A-Za-z0-9_.]+$/. Received: ${JSON.stringify(callback)}`,
      fieldName,
      callback
    );
  }
  return callback;
}

export const DOCUMENT_TYPE_CODES: ReadonlySet<string> = new Set<DocumentTypeCode>([
  "RULE",
  "PRORULE",
  "NOTICE",
  "PRESDOCU",
]);

export function validateDocumentTypeCodes(types: any, fieldName = "types"): readonly DocumentTypeCode[] {
  if (!Array.isArray(types)) {
    throw new RequestValidationError(
      `Field '${fieldName}' must be an array of DocumentTypeCode values. Received: ${JSON.stringify(types)}`,
      fieldName,
      types
    );
  }
  for (let i = 0; i < types.length; i++) {
    const item = types[i];
    if (typeof item !== "string" || !DOCUMENT_TYPE_CODES.has(item as DocumentTypeCode)) {
      throw new RequestValidationError(
        `Invalid DocumentTypeCode '${item}' at index ${i} for '${fieldName}'. Allowed values: ${Array.from(DOCUMENT_TYPE_CODES).join(", ")}.`,
        fieldName,
        item
      );
    }
  }
  return types as readonly DocumentTypeCode[];
}

export function validateRequiredParams(params: any, contextName: string): void {
  if (params === undefined || params === null || typeof params !== "object" || Array.isArray(params)) {
    throw new RequestValidationError(
      `Parameter object for ${contextName} is required and cannot be ${params === null ? "null" : typeof params}.`,
      "params",
      params
    );
  }
}

export function validateUnknownKeys(
  obj: any,
  allowedKeys: ReadonlySet<string>,
  contextName: string,
  allowCallback = false
): void {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return;
  }
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.has(key)) {
      if (allowCallback && key === "callback") {
        continue;
      }
      throw new RequestValidationError(
        `Unknown parameter '${key}' for ${contextName}. Allowed parameters: ${Array.from(allowedKeys).join(", ")}.`,
        key,
        obj[key]
      );
    }
  }
}

export const DOCUMENT_SEARCH_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "page",
  "perPage",
  "order",
  "fields",
  "conditions",
  "metadataOnly",
  "includePre1994Docs",
]);

export const DOCUMENT_SEARCH_CONDITIONS_KEYS: ReadonlySet<string> = new Set([
  "term",
  "regulationIdNumber",
  "agencies",
  "agencyIds",
  "citingDocumentNumbers",
  "documentNumbers",
  "executiveOrderNumbers",
  "presidents",
  "sections",
  "sectionIds",
  "volume",
  "topics",
  "topicIds",
  "types",
  "noticeTypes",
  "noticeTypeIds",
  "presidentialDocumentTypes",
  "presidentialDocumentTypeIds",
  "smallEntities",
  "smallEntityIds",
  "docketId",
  "significant",
  "acceptingComments",
  "correction",
  "near",
  "publicationDate",
  "signingDate",
  "effectiveDate",
  "commentDate",
  "cfr",
  "searchTypeId",
]);

export const EXECUTIVE_ORDER_CSV_SEARCH_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "page",
  "perPage",
  "order",
  "fields",
  "conditions",
  "includePre1994Docs",
]);

export const EXECUTIVE_ORDER_CSV_CONDITIONS_KEYS: ReadonlySet<string> = new Set([
  "term",
  "regulationIdNumber",
  "agencies",
  "agencyIds",
  "citingDocumentNumbers",
  "documentNumbers",
  "executiveOrderNumbers",
  "presidents",
  "sections",
  "sectionIds",
  "volume",
  "topics",
  "topicIds",
  "types",
  "noticeTypes",
  "noticeTypeIds",
  "presidentialDocumentType",
  "smallEntities",
  "smallEntityIds",
  "docketId",
  "significant",
  "acceptingComments",
  "correction",
  "near",
  "publicationDate",
  "signingDate",
  "effectiveDate",
  "commentDate",
  "cfr",
  "searchTypeId",
]);

export const DOCUMENT_SEARCH_RSS_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "conditions",
  "includePre1994Docs",
]);

export const DOCUMENT_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "documentNumber",
  "publicationDate",
  "fields",
]);

export const DOCUMENT_FIND_MANY_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "documentNumbers",
  "fields",
]);

export const DOCUMENT_CITATION_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "citation",
  "fields",
]);

export const DOCUMENT_CITATION_FIND_MANY_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "citations",
  "fields",
]);

export const DOCUMENT_FIND_CSV_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "documentNumbers",
  "fields",
]);

export const DOCUMENT_AUTOCOMPLETE_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "term",
]);

export const DOCUMENT_SEARCH_DETAILS_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "conditions",
  "omitSpellingSuggestions",
]);

export const DOCUMENT_FACET_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "conditions",
]);

export const PUBLIC_INSPECTION_SEARCH_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "page",
  "perPage",
  "fields",
  "conditions",
  "metadataOnly",
]);

export const PUBLIC_INSPECTION_SEARCH_CONDITIONS_KEYS: ReadonlySet<string> = new Set([
  "term",
  "agencies",
  "agencyIds",
  "types",
  "docketId",
  "documentNumbers",
  "specialFiling",
  "filedAt",
  "searchTypeId",
]);

export const PUBLIC_INSPECTION_AVAILABLE_ON_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "availableOn",
  "fields",
]);

export const PUBLIC_INSPECTION_CURRENT_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "fields",
]);

export const PUBLIC_INSPECTION_CURRENT_CSV_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "fields",
]);

export const PUBLIC_INSPECTION_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "documentNumber",
  "fields",
]);

export const PUBLIC_INSPECTION_FIND_MANY_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "documentNumbers",
  "fields",
]);

export const PUBLIC_INSPECTION_SEARCH_CSV_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "fields",
  "conditions",
]);

export const PUBLIC_INSPECTION_SEARCH_RSS_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "conditions",
]);

export const PUBLIC_INSPECTION_SEARCH_DETAILS_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "conditions",
]);

export const PUBLIC_INSPECTION_FACET_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "conditions",
]);

export const PUBLIC_INSPECTION_ISSUE_DAILY_FACET_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "publicationDate",
]);

export const PUBLIC_INSPECTION_ISSUE_TYPE_FACET_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "publicationDate",
]);

export const AGENCY_LIST_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "fields",
]);

export const AGENCY_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "idOrSlug",
  "fields",
]);

export const AGENCY_FIND_MANY_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "ids",
  "fields",
]);

export const AGENCY_SUGGESTIONS_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "term",
  "fields",
]);

export const TOPIC_SUGGESTIONS_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "term",
  "fields",
]);

export const SUGGESTED_SEARCH_SECTIONS_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "sections",
]);

export const SUGGESTED_SEARCH_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "slug",
]);

export const EFFECTIVE_DATES_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "startDate",
  "endDate",
]);

export const ISSUE_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "publicationDate",
]);

export const IMAGE_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "identifier",
]);

export const SITE_NOTIFICATION_FIND_PARAMS_KEYS: ReadonlySet<string> = new Set([
  "identifier",
]);
