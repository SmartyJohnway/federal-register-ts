// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\src\index.ts

// Core Classes
export * from './client';
export * from './base';
export * from './utilities';
export * from './result_set';
export * from './facet_result_set';

// Main Adapters / Models
import { Document } from './document';
export { Document };
export { Agency } from './agency';
export { PublicInspectionDocument } from './public_inspection_document';
export { Section } from './section';
export { SuggestedSearch } from './suggested_search';
export { Topic } from './topic';
export { HighlightedDocument } from './highlighted_document';
export { DocumentSearchDetails } from './document_search_details';
export { PublicInspectionDocumentSearchDetails } from './public_inspection_document_search_details';

// Base Facet
export { Facet, DocumentFacet, PublicInspectionDocumentFacet, PublicInspectionIssueFacet } from './facet';

// Facet Implementations (with aliases for conflicts)
export { Agency as DocumentAgencyFacet } from './facets/document/agency';
export { Daily as DocumentDailyFacet } from './facets/document/daily';
export { Frequency as DocumentFrequencyFacet } from './facets/document/frequency';
export { Monthly as DocumentMonthlyFacet } from './facets/document/monthly';
export { Quarterly as DocumentQuarterlyFacet } from './facets/document/quarterly';
export { Section as DocumentSectionFacet } from './facets/document/section';
export { Topic as DocumentTopicFacet } from './facets/document/topic';
export { Type as DocumentTypeFacet } from './facets/document/type';
export { Weekly as DocumentWeeklyFacet } from './facets/document/weekly';
export { Yearly as DocumentYearlyFacet } from './facets/document/yearly';

export { Agencies as PublicInspectionDocumentAgenciesFacet } from './facets/public_inspection_document/agencies';
export { Agency as PublicInspectionDocumentAgencyFacet } from './facets/public_inspection_document/agency';
export { Type as PublicInspectionDocumentTypeFacet } from './facets/public_inspection_document/type';

export { Daily as PublicInspectionIssueDailyFacet } from './facets/public_inspection_issue/daily';
export { DailyFiling as PublicInspectionIssueDailyFiling } from './facets/public_inspection_issue/daily_filing';
export { Type as PublicInspectionIssueTypeFacet } from './facets/public_inspection_issue/type';
export { TypeFiling as PublicInspectionIssueTypeFiling } from './facets/public_inspection_issue/type_filing';

export { PresidentialDocumentType as PresidentialDocumentTypeFacet } from './facets/presidential_document_type';

// Aggregator
export * from './aggregator';

// Convenience Aliases (Matches README usage)
// Assuming Document.search is the intended implementation for searchDocuments
export const searchDocuments = Document.search;
export const findDocument = Document.find;

// R0-07C / R2-02 Request Core (Types and validation error only; serializer machinery is internal)
export * from './request/types';
export { RequestValidationError } from './request/validation';

// R0-07A/B/D / R2-03 Client, Configuration, and Error Core
export { FederalRegisterClient } from './core/client';
export type { FederalRegisterClientOptions } from './core/client';
export {
  FederalRegisterError,
  FederalRegisterHttpError,
  FederalRegisterStatusMessageError,
  FederalRegisterSearchValidationError,
  FederalRegisterAgencyNotFoundError,
  FederalRegisterEffectiveDateRangeError,
  FederalRegisterEmptyJsonError,
  FederalRegisterEmptyBodyError,
  FederalRegisterRawResponseError,
  PublicInspectionIssueConditionError,
} from './core/errors';
export type {
  BodyKind,
  ApiStatusMessageError,
  SearchValidationError,
  AgencyNotFoundError,
  EffectiveDateRangeError,
  EmptyJsonObject,
  MultiLookupNotFoundErrors,
  PublicInspectionIssueConditionErrorPayload,
} from './core/errors';

// R0-07B / R2-04 Core Resource Service Types & Models
export type { DocumentsService } from './services/documents';
export type { PublicInspectionService } from './services/public_inspection';
export type { AgenciesService } from './services/agencies';
export type {
  JsonValue,
  JsonObject,
  RegulatoryPlanInfo,
  RegulationIdNumberInfo,
  RegulationsGovSupportingDocument,
  RegulationsGovCommentDocument,
  RegulatoryPlanRef,
  RegulationsGovDocket,
  RegulationsGovInfo,
  DocumentTypeName,
  PresidentialDocumentSubtype,
  ExplanatorySuggestion,
  SearchMetadataEnvelope,
  NonEmptySearchResultEnvelope,
  SearchResultEnvelope,
  MultiLookupEnvelope,
  ExistingPublicInspectionIssueDocumentsEnvelope,
  MissingPublicInspectionIssueDocumentsEnvelope,
  PublicInspectionIssueDocumentsEnvelope,
  ResolvedAgencyReference,
  UnresolvedAgencyReference,
  AgencyReference,
  DocumentCfrReference,
  DocumentPresidentRef,
  PageViewStats,
  ImageVariantMetadata,
  DocumentImageMap,
  DocumentImagesMetadata,
  AgencyLogo,
  AgencyLetterRef,
  SearchFilterEntry,
  SearchFilterMap,
  SearchRefinementSuggestion,
  AgencySearchSuggestion,
  IssueSearchSuggestion,
  PublicInspectionSearchSuggestion,
  FrCitationSuggestion,
  CfrCitationSuggestion,
  DocumentNumberSuggestion,
  DocumentSearchSuggestions,
  DocumentAutocompleteSuggestion,
  DocumentFieldMap,
  DocumentProjection,
  DocumentSearchDefaultField,
  DocumentShowDefaultField,
  DocumentSearchItem,
  DocumentShow,
  PublicInspectionFieldMap,
  PublicInspectionProjection,
  PublicInspectionSearchItem,
  PublicInspectionShowDefaultField,
  PublicInspectionShow,
  PublicInspectionIssueItem,
  AgencyFieldMap,
  AgencyProjection,
  AgencyIndexItem,
  FacetEntry,
  FieldFacetMap,
  DateFacetEntry,
  DateFacetMap,
  DocumentAgencyFacetMap,
  DocumentTopicFacetMap,
  DocumentSectionFacetMap,
  DocumentTypeFacetMap,
  DocumentSubtypeFacetMap,
  DocumentDailyFacetMap,
  DocumentWeeklyFacetMap,
  DocumentMonthlyFacetMap,
  DocumentQuarterlyFacetMap,
  DocumentYearlyFacetMap,
  PublicInspectionTypeFacetMap,
  PublicInspectionAgencyIdFacetMap,
  PublicInspectionAgencySlugFacetMap,
  PublicInspectionIssueDailyCounts,
  PublicInspectionIssueDailyBucket,
  PublicInspectionIssueDailyFacetMap,
  PublicInspectionIssueTypeEntry,
  PublicInspectionIssueTypeGroup,
  PublicInspectionIssueTypeBucket,
  PublicInspectionIssueTypeFacetMap,
} from './services/models';

// R0-07B / R2-05 Facet Service Types
export type {
  DocumentFacetsService,
  PublicInspectionFacetsService,
  PublicInspectionIssueFacetsService,
  PublicInspectionIssuesService,
} from './services/facets';

// R0-07B / R2-06 Remaining Capability Service Types & Models
export type { TopicsService } from './services/topics';
export type { SectionsService } from './services/sections';
export type { SuggestedSearchesService } from './services/suggested_searches';
export type { HolidaysService } from './services/holidays';
export type { EffectiveDatesService } from './services/effective_dates';
export type { IssuesService } from './services/issues';
export type { ImagesService } from './services/images';
export type { CategoryCountsService } from './services/category_counts';
export type { SiteNotificationsService } from './services/site_notifications';
export type { DocumentationService } from './services/documentation';
export type { ClippingsService } from './services/clippings';
export type {
  CsvText,
  DocumentCsvText,
  PublicInspectionCsvText,
  DocumentRssXmlText,
  PublicInspectionRssXmlText,
  CategoryCountCsvText,
  DocumentTypeCategoryCountCsvText,
  PageCountCategoryCountCsvText,
  JsonpText,
  TopicFieldMap,
  TopicProjection,
  SectionSummary,
  SectionMap,
  SuggestedSearchDetail,
  SuggestedSearchIndexItem,
  SuggestedSearchIndexMap,
  HolidayMap,
  EffectiveDateDelayKey,
  EffectiveDateOutcome,
  EffectiveDateSchedule,
  EffectiveDateMap,
  IssueTocDocument,
  IssueTocCategory,
  IssueTocSeeAlso,
  IssueTocAgency,
  IssueTocBase,
  IssueTocMeta,
  IssueTocNote,
  XmlIssueToc,
  LegacyIssueToc,
  IssueToc,
  ImageMetadataMap,
  ActiveSiteNotification,
  InactiveSiteNotification,
  FederalRegisterOpenApiDocument,
  WebClippingFolderRef,
  WebClipping,
  WebFolder,
  WebClippingsResponse,
} from './services/models';


