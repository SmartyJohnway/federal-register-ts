/**
 * R0-07C Core Public Request Types and Allowlist Definitions
 *
 * Implements the frozen request/query specifications defined in:
 * - R0-07C_Typed_Request_Query_Contract_2026-09-12.md
 * - r0-07c_request_type_registry.json
 */

/**
 * 4.1 NoParams
 * Registry marker for public methods that take no API parameter object.
 */
export type NoParams = undefined;

/**
 * 4.2 NonEmptyReadonlyArray
 * Used for path-level multi-lookup inputs that must contain at least one identifier.
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

/**
 * 4.3 IsoDateString
 * YYYY-MM-DD semantic string; runtime validation required at SDK boundary.
 */
export type IsoDateString = string;

/**
 * 4.4 PositiveInteger
 * Finite integer > 0; runtime validation required.
 */
export type PositiveInteger = number;

/**
 * 4.5 PageNumber
 * Canonical SDK accepts integers 1..50.
 */
export type PageNumber = number;

/**
 * 4.6 PerPage
 * Canonical SDK accepts integers 2..2000.
 */
export type PerPage = number;

/**
 * 4.7 ExecutiveOrderCsvPerPage
 * Canonical SDK accepts integers 2..10000 only in ExecutiveOrderCsvSearchParams.
 */
export type ExecutiveOrderCsvPerPage = number;

/**
 * 4.8 DocumentNumber
 * Opaque document-number identity string.
 */
export type DocumentNumber = string;

/**
 * 4.9 FederalRegisterCitation
 * Canonical citation input for citation lookup.
 */
export interface FederalRegisterCitation {
  volume: PositiveInteger;
  page: PositiveInteger;
}

/**
 * 4.10 BooleanQuery
 * Serializer emits canonical scalar 1/0 for boolean filter fields.
 */
export type BooleanQuery = boolean;

/**
 * 4.11 DateCondition
 * Canonical core chooses exactly one upstream selector mode per date field.
 * Disjoint union: exact date (is), year, or inclusive range (gte and/or lte).
 */
export type DateCondition =
  | { is: IsoDateString; year?: never; gte?: never; lte?: never }
  | { year: number; is?: never; gte?: never; lte?: never }
  | { gte: IsoDateString; lte?: IsoDateString; is?: never; year?: never }
  | { gte?: IsoDateString; lte: IsoDateString; is?: never; year?: never };

/**
 * 4.12 CfrCondition
 * title is integer 1..50. part is integer or source-supported inclusive range text (e.g. "1-50").
 */
export interface CfrCondition {
  title: number;
  part?: number | `${number}-${number}`;
}

/**
 * 4.13 NearCondition
 * within is integer miles 1..200; omitted uses upstream default 25. Location non-blank.
 */
export interface NearCondition {
  location: string;
  within?: number;
}

/**
 * 4.14 DocumentTypeCode
 * Frozen current Document type filter values.
 */
export type DocumentTypeCode = "RULE" | "PRORULE" | "NOTICE" | "PRESDOCU";

/**
 * 4.15 DocumentOrder
 * Canonical scalar ordering keys.
 */
export type DocumentOrder =
  | "relevance"
  | "newest"
  | "oldest"
  | "executive_order_number"
  | "proclamation_number"
  | "id";

/**
 * 4.16 DocumentOrderInput
 * date is an explicit current compatibility alias normalized to newest.
 */
export type DocumentOrderInput = DocumentOrder | "date";

/**
 * 4.17 SearchTypeId
 *
 * 1: lexical + 365d decay (FR-SEARCHTYPE-001)
 * 2: lexical_optimized / no decay scoring (FR-SEARCHTYPE-002) [Public Inspection default]
 * 3: hybrid / Function min-score (FR-SEARCHTYPE-005)
 * 4: hybrid_knn_min_score (FR-SEARCHTYPE-006)
 * 5: lexical_optimized_with_decay / 365d decay (FR-SEARCHTYPE-003)
 * 6: lexical_optimized_with_expansive_decay / 1095d decay (FR-SEARCHTYPE-004) [Documents default]
 */
export type SearchTypeId = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 4.18 ProjectionParams
 * Top-level repeated fields[] projection.
 */
export interface ProjectionParams<TField extends string> {
  fields?: readonly TField[];
}

/**
 * 4.19 DocumentField
 * Exact 53-field public Document allowlist.
 */
export type DocumentField =
  | "abstract"
  | "action"
  | "agencies"
  | "agency_names"
  | "body_html_url"
  | "cfr_references"
  | "citation"
  | "comment_url"
  | "comments_close_on"
  | "correction_of"
  | "corrections"
  | "dates"
  | "disposition_notes"
  | "docket_id"
  | "docket_ids"
  | "dockets"
  | "document_number"
  | "effective_on"
  | "end_page"
  | "excerpts"
  | "executive_order_notes"
  | "executive_order_number"
  | "explanation"
  | "full_text_xml_url"
  | "html_url"
  | "images"
  | "images_metadata"
  | "json_url"
  | "mods_url"
  | "not_received_for_publication"
  | "page_length"
  | "page_views"
  | "pdf_url"
  | "president"
  | "presidential_document_number"
  | "proclamation_number"
  | "public_inspection_pdf_url"
  | "publication_date"
  | "raw_text_url"
  | "regulation_id_number_info"
  | "regulation_id_numbers"
  | "regulations_dot_gov_info"
  | "regulations_dot_gov_url"
  | "significant"
  | "signing_date"
  | "start_page"
  | "subtype"
  | "title"
  | "toc_doc"
  | "toc_subject"
  | "topics"
  | "type"
  | "volume";

/**
 * 4.20 PublicInspectionField
 * Exact 27-field Public Inspection allowlist.
 */
export type PublicInspectionField =
  | "agencies"
  | "agency_letters"
  | "agency_names"
  | "docket_numbers"
  | "document_number"
  | "editorial_note"
  | "excerpts"
  | "filed_at"
  | "filing_type"
  | "html_url"
  | "json_url"
  | "last_public_inspection_issue"
  | "num_pages"
  | "page_views"
  | "pdf_file_name"
  | "pdf_file_size"
  | "pdf_updated_at"
  | "pdf_url"
  | "publication_date"
  | "raw_text_url"
  | "subject_1"
  | "subject_2"
  | "subject_3"
  | "title"
  | "toc_doc"
  | "toc_subject"
  | "type";

/**
 * 4.21 AgencyField
 * Exact 12 base Agency projection fields.
 */
export type AgencyField =
  | "id"
  | "parent_id"
  | "child_ids"
  | "child_slugs"
  | "name"
  | "short_name"
  | "slug"
  | "url"
  | "agency_url"
  | "description"
  | "recent_articles_url"
  | "logo";

/**
 * 4.22 TopicField
 * Exact 3-field Topic projection allowlist.
 */
export type TopicField = "name" | "slug" | "url";

/**
 * 4.23 DocumentSearchConditions
 * Frozen Document structured filters.
 */
export interface DocumentSearchConditions {
  term?: string;
  regulationIdNumber?: string;
  agencies?: readonly string[];
  agencyIds?: readonly PositiveInteger[];
  citingDocumentNumbers?: readonly DocumentNumber[];
  documentNumbers?: readonly DocumentNumber[];
  executiveOrderNumbers?: readonly string[];
  presidents?: readonly string[];
  sections?: readonly string[];
  sectionIds?: readonly PositiveInteger[];
  volume?: PositiveInteger;
  topics?: readonly string[];
  topicIds?: readonly PositiveInteger[];
  types?: readonly DocumentTypeCode[];
  noticeTypes?: readonly string[];
  noticeTypeIds?: readonly PositiveInteger[];
  presidentialDocumentTypes?: readonly string[];
  presidentialDocumentTypeIds?: readonly PositiveInteger[];
  smallEntities?: readonly string[];
  smallEntityIds?: readonly PositiveInteger[];
  docketId?: string;
  significant?: BooleanQuery;
  acceptingComments?: BooleanQuery;
  correction?: BooleanQuery;
  near?: NearCondition;
  publicationDate?: DateCondition;
  signingDate?: DateCondition;
  effectiveDate?: DateCondition;
  commentDate?: DateCondition;
  cfr?: CfrCondition;
  searchTypeId?: SearchTypeId;
}

/**
 * 4.24 DocumentSearchParams
 * Canonical JSON Document search request.
 */
export interface DocumentSearchParams {
  page?: PageNumber;
  perPage?: PerPage;
  order?: DocumentOrderInput;
  fields?: readonly DocumentField[];
  conditions?: DocumentSearchConditions;
  metadataOnly?: true;
  includePre1994Docs?: true;
}

/**
 * 4.25 ExecutiveOrderCsvSearchParams
 * Operation-specific scalar compatibility branch.
 */
export interface ExecutiveOrderCsvSearchParams {
  page?: PageNumber;
  perPage?: ExecutiveOrderCsvPerPage;
  order?: DocumentOrderInput;
  fields?: readonly DocumentField[];
  conditions: Omit<
    DocumentSearchConditions,
    "presidentialDocumentTypes" | "presidentialDocumentTypeIds"
  > & {
    presidentialDocumentType: "executive_order";
  };
  includePre1994Docs?: true;
}

/**
 * 4.26 DocumentSearchCsvParams
 */
export type DocumentSearchCsvParams =
  | Omit<DocumentSearchParams, "metadataOnly">
  | ExecutiveOrderCsvSearchParams;

/**
 * 4.27 DocumentSearchRssParams
 */
export interface DocumentSearchRssParams {
  conditions?: DocumentSearchConditions;
  includePre1994Docs?: true;
}

/**
 * 4.28 DocumentFindParams
 */
export interface DocumentFindParams {
  documentNumber: DocumentNumber;
  publicationDate?: IsoDateString;
  fields?: readonly DocumentField[];
}

/**
 * 4.29 DocumentFindManyParams
 */
export interface DocumentFindManyParams {
  documentNumbers: NonEmptyReadonlyArray<DocumentNumber>;
  fields?: readonly DocumentField[];
}

/**
 * 4.30 DocumentCitationFindParams
 */
export interface DocumentCitationFindParams {
  citation: FederalRegisterCitation;
  fields?: readonly DocumentField[];
}

/**
 * 4.31 DocumentCitationFindManyParams
 */
export interface DocumentCitationFindManyParams {
  citations: NonEmptyReadonlyArray<FederalRegisterCitation>;
  fields?: readonly DocumentField[];
}

/**
 * 4.32 DocumentFindCsvParams
 */
export interface DocumentFindCsvParams {
  documentNumbers: NonEmptyReadonlyArray<DocumentNumber>;
  fields?: readonly DocumentField[];
}

/**
 * 4.33 DocumentAutocompleteParams
 */
export interface DocumentAutocompleteParams {
  term: string;
}

/**
 * 4.34 DocumentSearchDetailsParams
 */
export interface DocumentSearchDetailsParams {
  conditions?: DocumentSearchConditions;
  omitSpellingSuggestions?: boolean;
}

/**
 * 4.35 DocumentFacetParams
 */
export interface DocumentFacetParams {
  conditions?: DocumentSearchConditions;
}

/**
 * 4.36 PublicInspectionSearchConditions
 */
export interface PublicInspectionSearchConditions {
  term?: string;
  agencies?: readonly string[];
  agencyIds?: readonly PositiveInteger[];
  types?: readonly string[];
  docketId?: string;
  documentNumbers?: readonly DocumentNumber[];
  specialFiling?: BooleanQuery;
  filedAt?: DateCondition;
  searchTypeId?: SearchTypeId;
}

/**
 * 4.37 PublicInspectionSearchParams
 */
export interface PublicInspectionSearchParams {
  page?: PageNumber;
  perPage?: PerPage;
  fields?: readonly PublicInspectionField[];
  conditions?: PublicInspectionSearchConditions;
  metadataOnly?: true;
}

/**
 * 4.38 PublicInspectionAvailableOnParams
 * Operation dispatch: availableOn serializes to conditions[available_on].
 */
export interface PublicInspectionAvailableOnParams {
  availableOn: IsoDateString;
  fields?: readonly PublicInspectionField[];
}

/**
 * 4.39 PublicInspectionCurrentParams
 */
export interface PublicInspectionCurrentParams {
  fields?: readonly PublicInspectionField[];
}

/**
 * 4.40 PublicInspectionCurrentCsvParams
 */
export interface PublicInspectionCurrentCsvParams {
  fields?: readonly PublicInspectionField[];
}

/**
 * 4.41 PublicInspectionFindParams
 */
export interface PublicInspectionFindParams {
  documentNumber: DocumentNumber;
  fields?: readonly PublicInspectionField[];
}

/**
 * 4.42 PublicInspectionFindManyParams
 */
export interface PublicInspectionFindManyParams {
  documentNumbers: NonEmptyReadonlyArray<DocumentNumber>;
  fields?: readonly PublicInspectionField[];
}

/**
 * 4.43 PublicInspectionSearchCsvParams
 */
export interface PublicInspectionSearchCsvParams {
  fields?: readonly PublicInspectionField[];
  conditions?: PublicInspectionSearchConditions;
}

/**
 * 4.44 PublicInspectionSearchRssParams
 */
export interface PublicInspectionSearchRssParams {
  conditions?: PublicInspectionSearchConditions;
}

/**
 * 4.45 PublicInspectionSearchDetailsParams
 */
export interface PublicInspectionSearchDetailsParams {
  conditions?: PublicInspectionSearchConditions;
}

/**
 * 4.46 PublicInspectionFacetParams
 */
export interface PublicInspectionFacetParams {
  conditions?: PublicInspectionSearchConditions;
}

/**
 * 4.47 PublicInspectionIssueDailyFacetParams
 */
export interface PublicInspectionIssueDailyFacetParams {
  publicationDate: { gte: IsoDateString };
}

/**
 * 4.48 PublicInspectionIssueTypeFacetParams
 */
export interface PublicInspectionIssueTypeFacetParams {
  publicationDate: { is: IsoDateString };
}

/**
 * 4.49 AgencyListParams
 */
export interface AgencyListParams {
  fields?: readonly AgencyField[];
}

/**
 * 4.50 AgencyFindParams
 */
export interface AgencyFindParams {
  idOrSlug: PositiveInteger | string;
  fields?: readonly AgencyField[];
}

/**
 * 4.51 AgencyFindManyParams
 */
export interface AgencyFindManyParams {
  ids: NonEmptyReadonlyArray<PositiveInteger>;
  fields?: readonly AgencyField[];
}

/**
 * 4.52 AgencySuggestionsParams
 */
export interface AgencySuggestionsParams {
  term: string;
  fields?: readonly AgencyField[];
}

/**
 * 4.53 TopicSuggestionsParams
 */
export interface TopicSuggestionsParams {
  term: string;
  fields?: readonly TopicField[];
}

/**
 * 4.54 SuggestedSearchSectionsParams
 */
export interface SuggestedSearchSectionsParams {
  sections: readonly string[];
}

/**
 * 4.55 SuggestedSearchFindParams
 */
export interface SuggestedSearchFindParams {
  slug: string;
}

/**
 * 4.56 EffectiveDatesParams
 */
export interface EffectiveDatesParams {
  startDate: IsoDateString;
  endDate: IsoDateString;
}

/**
 * 4.57 IssueFindParams
 */
export interface IssueFindParams {
  publicationDate: IsoDateString;
}

/**
 * 4.58 ImageFindParams
 */
export interface ImageFindParams {
  identifier: string;
}

/**
 * 4.59 SiteNotificationFindParams
 */
export interface SiteNotificationFindParams {
  identifier: string;
}

/**
 * 4.60 JsonpCallback
 * Identifier conforming to /^[A-Za-z0-9_.]+$/ per FR-PROTO-003.
 */
export type JsonpCallback = string;

/**
 * 4.61 JsonpCallbackParams
 * Standard parameter mixin for JSONP companion methods.
 */
export interface JsonpCallbackParams {
  readonly callback: JsonpCallback;
}
