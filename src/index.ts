// Canonical Federal Register TypeScript SDK
// R0-07 / R2-07 Canonical Public Surface

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
  DocumentSearchDetails,
  PublicInspectionSearchDetails,
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
  Document,
  Agency,
  PublicInspectionDocument,
  Section,
  SuggestedSearch,
  Topic,
} from './services/models';



