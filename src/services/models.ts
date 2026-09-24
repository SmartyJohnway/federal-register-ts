/**
 * R0-02 / R0-07D / R2-04 Canonical Response Models & Envelopes
 *
 * Implements the frozen response models for:
 * - Documents (search item, show, multi-lookup, autocomplete, search details)
 * - Public Inspection (search item, show, issue-documents envelope, search details)
 * - Agencies (projection, index item, suggestions)
 *
 * References:
 * - R0-02C_Document_Family_Field_Baseline_2026-09-09.md
 * - R0-02D_Public_Inspection_Agency_Field_Baseline_2026-09-09.md
 * - R0-02E_Search_Facet_Reference_Models_2026-09-10.md
 * - R0-07D_Response_Error_Format_Navigation_Contract_2026-09-12.md
 */

import type {
  DocumentField,
  PublicInspectionField,
  AgencyField,
  TopicField,
  IsoDateString,
} from "../request/types";
import type { MultiLookupNotFoundErrors } from "../core/errors";

// ---------------------------------------------------------------------------
// 1. Search Result Envelopes (R0-07D § 3.2)
// ---------------------------------------------------------------------------

export interface SearchMetadataEnvelope {
  readonly count: number;
  readonly description: string;
  readonly is_neural?: boolean;
}

export interface NonEmptySearchResultEnvelope<T> extends SearchMetadataEnvelope {
  readonly total_pages: number;
  readonly next_page_url?: string;
  readonly previous_page_url?: string;
  readonly results: readonly T[];
}

export type SearchResultEnvelope<T> =
  | SearchMetadataEnvelope
  | NonEmptySearchResultEnvelope<T>;

// ---------------------------------------------------------------------------
// 2. Multi-Lookup Partial Success Envelope (R0-07D § 3.4)
// ---------------------------------------------------------------------------

export interface MultiLookupEnvelope<T> {
  readonly count: number;
  readonly results: readonly T[];
  readonly errors?: MultiLookupNotFoundErrors;
}

// ---------------------------------------------------------------------------
// 3. Public Inspection Issue Documents Envelope (R0-07D § 3.3)
// ---------------------------------------------------------------------------

export interface ExistingPublicInspectionIssueDocumentsEnvelope<T> {
  readonly count: number;
  readonly results: readonly T[];
  readonly special_filings_updated_at: string | null;
  readonly regular_filings_updated_at: string | null;
}

export interface MissingPublicInspectionIssueDocumentsEnvelope {
  readonly count: 0;
  readonly results: readonly [];
}

export type PublicInspectionIssueDocumentsEnvelope<T> =
  | ExistingPublicInspectionIssueDocumentsEnvelope<T>
  | MissingPublicInspectionIssueDocumentsEnvelope;

// ---------------------------------------------------------------------------
// 4. Nested Models (R0-02C / R0-02D)
// ---------------------------------------------------------------------------

export interface ResolvedAgencyReference {
  readonly raw_name: string;
  readonly name: string;
  readonly id: number;
  readonly url: string;
  readonly json_url: string;
  readonly parent_id: number | null;
  readonly slug: string;
}

export interface UnresolvedAgencyReference {
  readonly raw_name: string;
}

export type AgencyReference = ResolvedAgencyReference | UnresolvedAgencyReference;

export interface DocumentCfrReference {
  readonly title: number;
  readonly part: number | null;
  readonly chapter: number | null;
  readonly citation_url: string | null;
}

export interface DocumentPresidentRef {
  readonly name: string;
  readonly identifier: string;
}

export interface PageViewStats {
  readonly count: number;
  readonly last_updated: string | null;
}

export interface ImageVariantMetadata {
  readonly content_type: string | null;
  readonly height: number | null;
  readonly identifier: string;
  readonly sha: string | null;
  readonly size: number | null;
  readonly url: string;
  readonly width: number | null;
}

export type DocumentImageMap = Record<string, Record<string, string>>;
export type DocumentImagesMetadata = Record<string, Record<string, ImageVariantMetadata>>;

export interface AgencyLogo {
  readonly thumb_url: string;
  readonly small_url: string;
  readonly medium_url: string;
}

export interface AgencyLetterRef {
  readonly title: string;
  readonly url: string;
}

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type JsonObject = { readonly [key: string]: JsonValue };

export interface RegulatoryPlanInfo {
  readonly xml_url: string;
  readonly issue: string | null;
  readonly title: string | null;
  readonly priority_category: string | null;
  readonly html_url: string;
}

export type RegulationIdNumberInfo = Record<string, RegulatoryPlanInfo | null>;

export interface RegulationsGovSupportingDocument {
  readonly title: string | null;
  readonly document_id: string;
}

export interface RegulationsGovCommentDocument {
  readonly allow_late_comments: boolean | null;
  readonly comment_count: number | null;
  readonly comment_end_date: IsoDateString | null;
  readonly comment_start_date: IsoDateString | null;
  readonly comment_url: string | null;
  readonly id: string;
  readonly regulations_dot_gov_open_for_comment: boolean | null;
  readonly updated_at: string | null;
}

export interface RegulatoryPlanRef {
  readonly html_url: string;
  readonly title: string | null;
}

export interface RegulationsGovDocket {
  readonly agency_name: string | null;
  readonly id: string;
  readonly title: string | null;
  readonly supporting_documents: readonly RegulationsGovSupportingDocument[];
  readonly supporting_documents_count: number | null;
  readonly documents: readonly RegulationsGovCommentDocument[];
}

export interface RegulationsGovInfo {
  readonly document_id?: string;
  readonly comments_count?: number;
  readonly agency_id?: string;
  readonly checked_regulationsdotgov_at?: string;
  readonly docket_id?: string;
  readonly regulation_id_number?: string | null;
  readonly title?: string | null;
  readonly comments_url?: string;
  readonly supporting_documents_count?: number | null;
  readonly supporting_documents?: readonly RegulationsGovSupportingDocument[];
  readonly regulatory_plan?: RegulatoryPlanRef;
  readonly dockets?: readonly RegulationsGovDocket[];
}

// ---------------------------------------------------------------------------
// 5. Search Details Models (R0-02E § 3, § 4)
// ---------------------------------------------------------------------------

export interface SearchFilterEntry {
  readonly name: string;
  readonly value: JsonValue;
  readonly label: string;
}

export type SearchFilterMap = Record<string, SearchFilterEntry | readonly SearchFilterEntry[]>;

export interface SearchRefinementSuggestion {
  readonly count: number;
  readonly search_conditions: JsonObject;
  readonly search_summary: string;
}

export interface AgencySearchSuggestion {
  readonly agency_short_name: string | null;
  readonly agency_slug: string;
  readonly agency_name: string;
}

export interface IssueSearchSuggestion {
  readonly date: IsoDateString;
}

export interface PublicInspectionSearchSuggestion {
  readonly count: number;
}

export interface FrCitationSuggestion {
  readonly document_numbers: readonly string[];
  readonly volume?: number;
  readonly page?: number;
}

export interface CfrCitationSuggestion {
  readonly title: string;
  readonly part: string;
  readonly section: string | null;
}

export interface DocumentNumberSuggestion {
  readonly document_number: string;
}

export interface ExplanatorySuggestion {
  readonly link_url: string;
  readonly text: string;
  readonly citation?: string;
}

export interface DocumentSearchSuggestions {
  readonly explanatory?: ExplanatorySuggestion;
  readonly search_refinement?: SearchRefinementSuggestion;
  readonly agency?: AgencySearchSuggestion;
  readonly issue?: IssueSearchSuggestion;
  readonly public_inspection?: PublicInspectionSearchSuggestion;
  readonly citation?: FrCitationSuggestion;
  readonly cfr?: CfrCitationSuggestion;
  readonly document_number?: DocumentNumberSuggestion;
}

export interface DocumentSearchDetails {
  readonly suggestions: DocumentSearchSuggestions;
  readonly filters: SearchFilterMap;
}

export interface PublicInspectionSearchDetails {
  readonly suggestions: Record<string, never>;
  readonly filters: SearchFilterMap;
}

export interface DocumentAutocompleteSuggestion {
  readonly document_number: string;
  readonly search_term_completion: string;
  readonly entry_type: string;
}

// ---------------------------------------------------------------------------
// 6. Complete Document Field Map & Projections (53 fields)
// ---------------------------------------------------------------------------

export type DocumentTypeName =
  | "Rule"
  | "Proposed Rule"
  | "Notice"
  | "Presidential Document"
  | "Correction"
  | "Uncategorized Document"
  | "Sunshine Act Document";

export type PresidentialDocumentSubtype =
  | "Determination"
  | "Executive Order"
  | "Memorandum"
  | "Notice"
  | "Proclamation"
  | "Presidential Order"
  | "Other";

export interface DocumentFieldMap {
  abstract: string | null;
  action: string | null;
  agencies: readonly AgencyReference[];
  agency_names: readonly string[];
  body_html_url: string | null;
  cfr_references: readonly DocumentCfrReference[];
  citation: string;
  comment_url: string | null;
  comments_close_on: IsoDateString | null;
  correction_of: string | null;
  corrections: readonly string[];
  dates: string | null;
  disposition_notes: string | null;
  docket_id: string | null;
  docket_ids: readonly string[];
  dockets: readonly RegulationsGovDocket[] | readonly string[] | null;
  document_number: string;
  effective_on: IsoDateString | null;
  end_page: number;
  excerpts: string | null;
  executive_order_notes: string | null;
  executive_order_number: string | null;
  explanation: JsonObject | { readonly value: number } | string | null;
  full_text_xml_url: string | null;
  html_url: string;
  images: DocumentImageMap | null;
  images_metadata: DocumentImagesMetadata | null;
  json_url: string;
  mods_url: string | null;
  not_received_for_publication: boolean | null;
  page_length: number;
  page_views: PageViewStats;
  pdf_url: string | null;
  president: DocumentPresidentRef | null;
  presidential_document_number: string | null;
  proclamation_number: string | null;
  public_inspection_pdf_url: string | null;
  publication_date: IsoDateString;
  raw_text_url: string | null;
  regulation_id_number_info: RegulationIdNumberInfo | null;
  regulation_id_numbers: readonly string[];
  regulations_dot_gov_info: RegulationsGovInfo;
  regulations_dot_gov_url: string | null;
  significant: boolean | null;
  signing_date: IsoDateString | null;
  start_page: number;
  subtype: PresidentialDocumentSubtype | string | null;
  title: string;
  toc_doc: string | null;
  toc_subject: string | null;
  topics: readonly string[];
  type: DocumentTypeName | string;
  volume: number;
}

export type DocumentProjection<K extends DocumentField = DocumentField> = Pick<DocumentFieldMap, K>;

export type DocumentSearchDefaultField =
  | "title"
  | "type"
  | "abstract"
  | "document_number"
  | "html_url"
  | "pdf_url"
  | "public_inspection_pdf_url"
  | "publication_date"
  | "agencies"
  | "excerpts";

export type DocumentShowDefaultField = Exclude<
  DocumentField,
  "explanation" | "not_received_for_publication" | "page_views" | "regulation_id_number_info"
>;

export type DocumentSearchItem<K extends DocumentField = DocumentSearchDefaultField> = DocumentProjection<K>;
export type DocumentShow<K extends DocumentField = DocumentShowDefaultField> = DocumentProjection<K>;

// ---------------------------------------------------------------------------
// 7. Complete Public Inspection Field Map & Projections (27 fields)
// ---------------------------------------------------------------------------

export interface PublicInspectionFieldMap {
  agencies: readonly AgencyReference[];
  agency_letters: readonly AgencyLetterRef[];
  agency_names: readonly string[] | null;
  docket_numbers: readonly string[];
  document_number: string;
  editorial_note: string | null;
  excerpts: string | null;
  filed_at: string | null;
  filing_type: "special" | "regular";
  html_url: string;
  json_url: string;
  last_public_inspection_issue: IsoDateString | null;
  num_pages: number | null;
  page_views: PageViewStats | null;
  pdf_file_name: string | null;
  pdf_file_size: number | null;
  pdf_updated_at: string | null;
  pdf_url: string;
  publication_date: IsoDateString | null;
  raw_text_url: string;
  subject_1: string | null;
  subject_2: string | null;
  subject_3: string | null;
  title: string;
  toc_doc: string;
  toc_subject: string;
  type: string | null;
}

export type PublicInspectionProjection<K extends PublicInspectionField = PublicInspectionField> =
  Pick<PublicInspectionFieldMap, K>;

export type PublicInspectionSearchItem<K extends PublicInspectionField = PublicInspectionField> =
  PublicInspectionProjection<K>;

export type PublicInspectionShowDefaultField = Exclude<PublicInspectionField, "json_url" | "excerpts">;

export type PublicInspectionShow<K extends PublicInspectionField = PublicInspectionShowDefaultField> =
  PublicInspectionProjection<K>;

export type PublicInspectionIssueItem<K extends PublicInspectionField = PublicInspectionField> =
  PublicInspectionProjection<K>;

// ---------------------------------------------------------------------------
// 8. Agency Models & Projections (12 fields)
// ---------------------------------------------------------------------------

export interface AgencyFieldMap {
  id: number;
  parent_id: number | null;
  child_ids: readonly number[];
  child_slugs: readonly string[];
  name: string;
  short_name: string | null;
  slug: string;
  url: string;
  agency_url: string | null;
  description: string | null;
  recent_articles_url: string;
  logo: AgencyLogo | null;
}

export type AgencyProjection<K extends AgencyField = AgencyField> = Pick<AgencyFieldMap, K>;

export type AgencyIndexItem<K extends AgencyField = AgencyField> = AgencyProjection<K> & {
  readonly json_url: string;
};

// ---------------------------------------------------------------------------
// 9. Facet & Aggregation Models (R0-02E / R0-07D § 3.6 / R2-05)
// ---------------------------------------------------------------------------

export interface FacetEntry {
  readonly count: number;
  readonly name: string;
}

export type FieldFacetMap = Record<string, FacetEntry>;

export interface DateFacetEntry {
  readonly count: number;
  readonly name: string;
}

export type DateFacetMap = Record<string, DateFacetEntry>;

// Document Field Facets (5)
export type DocumentAgencyFacetMap = FieldFacetMap;
export type DocumentTopicFacetMap = FieldFacetMap;
export type DocumentSectionFacetMap = FieldFacetMap;
export type DocumentTypeFacetMap = FieldFacetMap;
export type DocumentSubtypeFacetMap = FieldFacetMap;

// Document Date Facets (5)
export type DocumentDailyFacetMap = DateFacetMap;
export type DocumentWeeklyFacetMap = DateFacetMap;
export type DocumentMonthlyFacetMap = DateFacetMap;
export type DocumentQuarterlyFacetMap = DateFacetMap;
export type DocumentYearlyFacetMap = DateFacetMap;

// Public Inspection Document Facets (3)
export type PublicInspectionTypeFacetMap = FieldFacetMap;
export type PublicInspectionAgencyIdFacetMap = Record<string /* Agency ID */, FacetEntry>;
export type PublicInspectionAgencySlugFacetMap = Record<string /* Agency slug */, FacetEntry>;

// Public Inspection Issue Facets (2)
export interface PublicInspectionIssueDailyCounts {
  readonly last_updated_at: string | null;
  readonly documents: number;
  readonly agencies: number;
}

export interface PublicInspectionIssueDailyBucket {
  readonly special_filings: PublicInspectionIssueDailyCounts;
  readonly regular_filings: PublicInspectionIssueDailyCounts;
}

export type PublicInspectionIssueDailyFacetMap =
  Record<IsoDateString, PublicInspectionIssueDailyBucket>;

export interface PublicInspectionIssueTypeEntry {
  readonly count: number;
  readonly name: string;
}

export type PublicInspectionIssueTypeGroup =
  Record<string, PublicInspectionIssueTypeEntry>;

export interface PublicInspectionIssueTypeBucket {
  readonly special_filings: PublicInspectionIssueTypeGroup;
  readonly regular_filings: PublicInspectionIssueTypeGroup;
}

export type PublicInspectionIssueTypeFacetMap =
  Record<IsoDateString, PublicInspectionIssueTypeBucket>;

// ---------------------------------------------------------------------------
// 8. R2-06 Alternate Formats (CSV / RSS)
// ---------------------------------------------------------------------------

export type CsvText = string;
export type DocumentCsvText = CsvText;
export type PublicInspectionCsvText = CsvText;
export type CategoryCountCsvText = CsvText;
export type DocumentTypeCategoryCountCsvText = CsvText;
export type PageCountCategoryCountCsvText = CsvText;

export type RssXmlText = string;
export type DocumentRssXmlText = RssXmlText;
export type PublicInspectionRssXmlText = RssXmlText;

export type JsonpText = string;

// ---------------------------------------------------------------------------
// 9. Topics (R0-02E § 12)
// ---------------------------------------------------------------------------

export interface TopicFieldMap {
  readonly name: string;
  readonly slug: string;
  readonly url: string;
}

export type TopicProjection<K extends TopicField = TopicField> = Pick<
  TopicFieldMap,
  K
>;

/**
 * Reference link within a topic's see_also collection (CAP-001).
 */
export interface TopicCatalogSeeAlsoItem {
  readonly name: string;
  readonly slug: string;
}

/**
 * An individual topic item within the Federal Register topic catalog (CAP-001).
 * Both thesaurus and ad_hoc buckets conform to this structure.
 */
export interface TopicCatalogItem {
  readonly name: string;
  readonly slug: string;
  readonly see_also: readonly TopicCatalogSeeAlsoItem[];
  readonly cfr_references: readonly JsonValue[];
  readonly see: readonly JsonValue[];
}

/**
 * Counts metadata for the topic catalog (CAP-001).
 */
export interface TopicCatalogCountMeta {
  readonly thesaurus: number;
  readonly ad_hoc: number;
  readonly total: number;
}

/**
 * Metadata envelope for the topic catalog response (CAP-001).
 */
export interface TopicCatalogMeta {
  readonly count: TopicCatalogCountMeta;
}

/**
 * Results buckets for the topic catalog response (CAP-001).
 */
export interface TopicCatalogResults {
  readonly thesaurus: readonly TopicCatalogItem[];
  readonly ad_hoc: readonly TopicCatalogItem[];
}

/**
 * Full response envelope returned by GET /api/v1/topics.json (CAP-001).
 */
export interface TopicCatalogResponse {
  readonly meta: TopicCatalogMeta;
  readonly results: TopicCatalogResults;
}

// ---------------------------------------------------------------------------
// 10. Sections (R0-02E § 13)
// ---------------------------------------------------------------------------

export interface SectionSummary {
  readonly name: string;
}

export type SectionMap = Record<string, SectionSummary>;

// ---------------------------------------------------------------------------
// 11. Suggested Searches (R0-02E § 14 & § 15)
// ---------------------------------------------------------------------------

export interface SuggestedSearchDetail {
  readonly description: string;
  readonly slug: string;
  readonly search_conditions: JsonObject;
  readonly section: string;
  readonly title: string;
}

export interface SuggestedSearchIndexItem extends SuggestedSearchDetail {
  readonly documents_in_last_year: number;
  readonly documents_with_open_comment_periods: number;
  readonly position: number | null;
}

export type SuggestedSearchIndexMap = Record<
  string,
  readonly SuggestedSearchIndexItem[]
>;

// ---------------------------------------------------------------------------
// 12. Holidays (R0-02E § 16)
// ---------------------------------------------------------------------------

export type HolidayMap = Record<string, string>;

// ---------------------------------------------------------------------------
// 13. Effective Dates (R0-02F § 4)
// ---------------------------------------------------------------------------

export type EffectiveDateDelayKey =
  | "15"
  | "21"
  | "30"
  | "35"
  | "45"
  | "60"
  | "90";

export interface EffectiveDateOutcome {
  readonly date: IsoDateString;
  readonly delay_reasons: readonly string[];
}

export type EffectiveDateSchedule = Record<
  EffectiveDateDelayKey,
  EffectiveDateOutcome
>;

export type EffectiveDateMap = Record<string, EffectiveDateSchedule>;

// ---------------------------------------------------------------------------
// 14. Issues (R0-02F § 3)
// ---------------------------------------------------------------------------

export interface IssueTocDocument {
  readonly subject_1: string;
  readonly subject_2?: string;
  readonly subject_3?: string;
  readonly document_numbers: readonly string[];
}

export interface IssueTocCategory {
  readonly type: string;
  readonly documents: readonly IssueTocDocument[];
}

export interface IssueTocSeeAlso {
  readonly name: string;
  readonly slug: string;
}

export interface IssueTocAgency {
  readonly name: string;
  readonly slug: string;
  readonly see_also?: readonly IssueTocSeeAlso[];
  readonly document_categories: readonly IssueTocCategory[];
}

export interface IssueTocBase {
  readonly agencies: readonly IssueTocAgency[];
}

export interface IssueTocMeta {
  readonly publication_date: IsoDateString;
}

export interface IssueTocNote {
  readonly title: string;
  readonly text: string;
}

export interface XmlIssueToc extends IssueTocBase {
  readonly meta: IssueTocMeta;
  readonly note?: IssueTocNote;
}

export interface LegacyIssueToc extends IssueTocBase {
  readonly meta?: never;
  readonly note?: never;
}

export type IssueToc = XmlIssueToc | LegacyIssueToc;

// ---------------------------------------------------------------------------
// 15. Images (R0-02F § 2)
// ---------------------------------------------------------------------------

export type ImageMetadataMap = Record<string, ImageVariantMetadata>;

// ---------------------------------------------------------------------------
// 16. Site Notifications (R0-02F § 6)
// ---------------------------------------------------------------------------

export interface ActiveSiteNotification {
  readonly id: number;
  readonly identifier: string;
  readonly notification_type: string | null;
  readonly description: string | null;
  readonly active: true;
}

export type InactiveSiteNotification = Record<string, never>;

// ---------------------------------------------------------------------------
// 17. Documentation (R0-02F § 7)
// ---------------------------------------------------------------------------

export interface FederalRegisterOpenApiDocument {
  readonly openapi: "3.0.0";
  readonly info: {
    readonly title: string;
    readonly version: string;
    readonly [key: string]: JsonValue;
  };
  readonly servers: ReadonlyArray<{
    readonly url: string;
    readonly [key: string]: JsonValue;
  }>;
  readonly paths: Record<string, JsonObject>;
  readonly components: {
    readonly schemas: Record<string, JsonObject>;
    readonly [key: string]: JsonValue;
  };
  readonly [key: string]: JsonValue;
}

// ---------------------------------------------------------------------------
// 18. Web Clippings (R0-02F § 8)
// ---------------------------------------------------------------------------

export interface WebClippingFolderRef {
  readonly name: string;
  readonly slug: string;
}

export interface WebClipping {
  readonly document_number: string;
  readonly folder: WebClippingFolderRef | null;
}

export interface WebFolder {
  readonly name: string;
  readonly slug: string;
  readonly doc_count: number;
  readonly documents: readonly string[];
  readonly document_types: readonly string[];
}

export interface WebClippingsResponse {
  readonly clippings: readonly WebClipping[];
  readonly folders: readonly WebFolder[];
}

// ---------------------------------------------------------------------------
// 19. Canonical Domain Model Type Aliases
// ---------------------------------------------------------------------------

export type Document<K extends DocumentField = DocumentShowDefaultField> = DocumentShow<K>;
export type Agency<K extends AgencyField = AgencyField> = AgencyProjection<K>;
export type PublicInspectionDocument<K extends PublicInspectionField = PublicInspectionShowDefaultField> = PublicInspectionShow<K>;
export type Section = SectionSummary;
export type SuggestedSearch = SuggestedSearchDetail;
export type Topic<K extends TopicField = TopicField> = TopicProjection<K>;

