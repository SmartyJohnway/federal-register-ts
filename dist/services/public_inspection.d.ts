/**
 * R0-07B / R2-04 Public Inspection Service
 *
 * Implements the 6 frozen core JSON Public Inspection operations:
 * 1. fr.publicInspection.search(params?: PublicInspectionSearchParams): Promise<SearchResultEnvelope<PublicInspectionSearchItem<K>>>
 * 2. fr.publicInspection.availableOn(params: PublicInspectionAvailableOnParams): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>
 * 3. fr.publicInspection.current(params?: PublicInspectionCurrentParams): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>
 * 4. fr.publicInspection.find(params: PublicInspectionFindParams): Promise<PublicInspectionShow<K>>
 * 5. fr.publicInspection.findMany(params: PublicInspectionFindManyParams): Promise<MultiLookupEnvelope<PublicInspectionShow<K>>>
 * 6. fr.publicInspection.searchDetails(params?: PublicInspectionSearchDetailsParams): Promise<PublicInspectionSearchDetails>
 */
import type { FederalRegisterClient } from "../core/client";
import type { PublicInspectionSearchParams, PublicInspectionAvailableOnParams, PublicInspectionCurrentParams, PublicInspectionFindParams, PublicInspectionFindManyParams, PublicInspectionSearchDetailsParams, PublicInspectionCurrentCsvParams, PublicInspectionSearchCsvParams, PublicInspectionSearchRssParams, PublicInspectionField, JsonpCallbackParams } from "../request/types";
import type { SearchResultEnvelope, PublicInspectionSearchItem, PublicInspectionIssueDocumentsEnvelope, PublicInspectionIssueItem, PublicInspectionShow, MultiLookupEnvelope, PublicInspectionSearchDetails, PublicInspectionShowDefaultField, PublicInspectionCsvText, PublicInspectionRssXmlText, JsonpText } from "./models";
import { PublicInspectionFacetsService, PublicInspectionIssuesService } from "./facets";
export declare class PublicInspectionService {
    #private;
    /**
     * Public Inspection Document Facets sub-namespace (fr.publicInspection.facets.*)
     */
    readonly facets: PublicInspectionFacetsService;
    /**
     * Public Inspection Issues presenter (fr.publicInspection.issues.*)
     */
    readonly issues: PublicInspectionIssuesService;
    constructor(client: FederalRegisterClient);
    /**
     * 1. Public Inspection search with structured conditions and full-text search.
     * Path: /public-inspection-documents
     */
    search<K extends PublicInspectionField = PublicInspectionField>(params?: PublicInspectionSearchParams): Promise<SearchResultEnvelope<PublicInspectionSearchItem<K>>>;
    /**
     * 2. Available-on exact issue-date retrieval.
     * Path: /public-inspection-documents?conditions[available_on]=YYYY-MM-DD
     * Returns PublicInspectionIssueDocumentsEnvelope.
     */
    availableOn<K extends PublicInspectionField = PublicInspectionField>(params: PublicInspectionAvailableOnParams): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>;
    /**
     * 3. Current Public Inspection documents.
     * Path: /public-inspection-documents/current
     * Returns PublicInspectionIssueDocumentsEnvelope.
     */
    current<K extends PublicInspectionField = PublicInspectionField>(params?: PublicInspectionCurrentParams): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>;
    /**
     * 4. Single Public Inspection document lookup by document number.
     * Path: /public-inspection-documents/{documentNumber}
     */
    find<K extends PublicInspectionField = PublicInspectionShowDefaultField>(params: PublicInspectionFindParams): Promise<PublicInspectionShow<K>>;
    /**
     * 5. Multiple Public Inspection document lookup by comma-separated numbers.
     * Path: /public-inspection-documents/{documentNumbers}
     * Returns MultiLookupEnvelope. Partial success with not_found errors is resolved, NOT thrown.
     */
    findMany<K extends PublicInspectionField = PublicInspectionShowDefaultField>(params: PublicInspectionFindManyParams): Promise<MultiLookupEnvelope<PublicInspectionShow<K>>>;
    /**
     * 6. Public Inspection search details.
     * Path: /public-inspection-documents/search-details
     */
    searchDetails(params?: PublicInspectionSearchDetailsParams): Promise<PublicInspectionSearchDetails>;
    /**
     * 7. Public Inspection current CSV export (FR-PI-004).
     * Path: /public-inspection-documents/current.csv
     */
    currentCsv(params?: PublicInspectionCurrentCsvParams): Promise<PublicInspectionCsvText>;
    /**
     * 8. Public Inspection search CSV export (FR-PI-007).
     * Path: /public-inspection-documents.csv
     */
    searchCsv(params?: PublicInspectionSearchCsvParams): Promise<PublicInspectionCsvText>;
    /**
     * 9. Public Inspection search RSS feed (FR-PI-008).
     * Path: /public-inspection-documents.rss
     */
    searchRss(params?: PublicInspectionSearchRssParams): Promise<PublicInspectionRssXmlText>;
    /**
     * Public inspection search JSONP format companion (FR-PROTO-003 companion to FR-PI-001).
     */
    searchJsonp(params: (PublicInspectionSearchParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Available on date JSONP format companion (FR-PROTO-003 companion to FR-PI-002).
     */
    availableOnJsonp(params: PublicInspectionAvailableOnParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Current public inspection JSONP format companion (FR-PROTO-003 companion to FR-PI-003).
     */
    currentJsonp(params: (PublicInspectionCurrentParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Single public inspection document lookup JSONP format companion (FR-PROTO-003 companion to FR-PI-005).
     */
    findJsonp(params: PublicInspectionFindParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Multiple public inspection document lookup JSONP format companion (FR-PROTO-003 companion to FR-PI-006).
     */
    findManyJsonp(params: PublicInspectionFindManyParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Public inspection search details JSONP format companion (FR-PROTO-003 companion to FR-PI-009).
     */
    searchDetailsJsonp(params: (PublicInspectionSearchDetailsParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=public_inspection.d.ts.map