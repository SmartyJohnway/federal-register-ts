/**
 * R0-07B / R2-05 Facets & Aggregations Service Namespaces
 *
 * Implements the 15 frozen JSON Facet & Aggregation operations across 3 capability families:
 * 1. fr.documents.facets.* (10 Document facets)
 *    - agency: GET /documents/facets/agency -> DocumentAgencyFacetMap
 *    - topic: GET /documents/facets/topic -> DocumentTopicFacetMap
 *    - section: GET /documents/facets/section -> DocumentSectionFacetMap
 *    - type: GET /documents/facets/type -> DocumentTypeFacetMap
 *    - subtype: GET /documents/facets/subtype -> DocumentSubtypeFacetMap
 *    - daily: GET /documents/facets/daily -> DocumentDailyFacetMap
 *    - weekly: GET /documents/facets/weekly -> DocumentWeeklyFacetMap
 *    - monthly: GET /documents/facets/monthly -> DocumentMonthlyFacetMap
 *    - quarterly: GET /documents/facets/quarterly -> DocumentQuarterlyFacetMap
 *    - yearly: GET /documents/facets/yearly -> DocumentYearlyFacetMap
 *
 * 2. fr.publicInspection.facets.* (3 Public Inspection Document facets)
 *    - type: GET /public-inspection-documents/facets/type -> PublicInspectionTypeFacetMap
 *    - agency: GET /public-inspection-documents/facets/agency -> PublicInspectionAgencyIdFacetMap
 *    - agencies: GET /public-inspection-documents/facets/agencies -> PublicInspectionAgencySlugFacetMap
 *
 * 3. fr.publicInspection.issues.facets.* (2 Public Inspection Issue facets)
 *    - daily: GET /public-inspection-issues/facets/daily -> PublicInspectionIssueDailyFacetMap
 *    - type: GET /public-inspection-issues/facets/type -> PublicInspectionIssueTypeFacetMap
 */
import type { FederalRegisterClient } from "../core/client";
import type { DocumentFacetParams, PublicInspectionFacetParams, PublicInspectionIssueDailyFacetParams, PublicInspectionIssueTypeFacetParams, JsonpCallbackParams } from "../request/types";
import type { DocumentAgencyFacetMap, DocumentTopicFacetMap, DocumentSectionFacetMap, DocumentTypeFacetMap, DocumentSubtypeFacetMap, DocumentDailyFacetMap, DocumentWeeklyFacetMap, DocumentMonthlyFacetMap, DocumentQuarterlyFacetMap, DocumentYearlyFacetMap, PublicInspectionTypeFacetMap, PublicInspectionAgencyIdFacetMap, PublicInspectionAgencySlugFacetMap, PublicInspectionIssueDailyFacetMap, PublicInspectionIssueTypeFacetMap, JsonpText } from "./models";
/**
 * Service namespace for Document facets (fr.documents.facets.*)
 */
export declare class DocumentFacetsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * 1. Document agency facet.
     * Path: /documents/facets/agency
     */
    agency(params?: DocumentFacetParams): Promise<DocumentAgencyFacetMap>;
    /**
     * 2. Document topic facet.
     * Path: /documents/facets/topic
     */
    topic(params?: DocumentFacetParams): Promise<DocumentTopicFacetMap>;
    /**
     * 3. Document section facet.
     * Path: /documents/facets/section
     */
    section(params?: DocumentFacetParams): Promise<DocumentSectionFacetMap>;
    /**
     * 4. Document type facet.
     * Path: /documents/facets/type
     */
    type(params?: DocumentFacetParams): Promise<DocumentTypeFacetMap>;
    /**
     * 5. Document subtype facet.
     * Path: /documents/facets/subtype
     */
    subtype(params?: DocumentFacetParams): Promise<DocumentSubtypeFacetMap>;
    /**
     * 6. Document daily date facet.
     * Path: /documents/facets/daily
     */
    daily(params?: DocumentFacetParams): Promise<DocumentDailyFacetMap>;
    /**
     * 7. Document weekly date facet.
     * Path: /documents/facets/weekly
     */
    weekly(params?: DocumentFacetParams): Promise<DocumentWeeklyFacetMap>;
    /**
     * 8. Document monthly date facet.
     * Path: /documents/facets/monthly
     */
    monthly(params?: DocumentFacetParams): Promise<DocumentMonthlyFacetMap>;
    /**
     * 9. Document quarterly date facet.
     * Path: /documents/facets/quarterly
     */
    quarterly(params?: DocumentFacetParams): Promise<DocumentQuarterlyFacetMap>;
    /**
     * 10. Document yearly date facet.
     * Path: /documents/facets/yearly
     */
    yearly(params?: DocumentFacetParams): Promise<DocumentYearlyFacetMap>;
    agencyJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    topicJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    sectionJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    typeJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    subtypeJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    dailyJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    weeklyJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    monthlyJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    quarterlyJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    yearlyJsonp(params: (DocumentFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
}
/**
 * Service namespace for Public Inspection document facets (fr.publicInspection.facets.*)
 */
export declare class PublicInspectionFacetsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * 1. Public Inspection type facet.
     * Path: /public-inspection-documents/facets/type
     */
    type(params?: PublicInspectionFacetParams): Promise<PublicInspectionTypeFacetMap>;
    /**
     * 2. Public Inspection agency facet (keyed by Agency ID).
     * Path: /public-inspection-documents/facets/agency
     */
    agency(params?: PublicInspectionFacetParams): Promise<PublicInspectionAgencyIdFacetMap>;
    /**
     * 3. Public Inspection agencies facet (keyed by Agency slug).
     * Path: /public-inspection-documents/facets/agencies
     */
    agencies(params?: PublicInspectionFacetParams): Promise<PublicInspectionAgencySlugFacetMap>;
    typeJsonp(params: (PublicInspectionFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    agencyJsonp(params: (PublicInspectionFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    agenciesJsonp(params: (PublicInspectionFacetParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
}
/**
 * Service namespace for Public Inspection Issue facets (fr.publicInspection.issues.facets.*)
 */
export declare class PublicInspectionIssueFacetsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * 1. Daily Public Inspection Issue facet.
     * Path: /public-inspection-issues/facets/daily
     * Requires: publicationDate.gte
     * Uses decodePublicInspectionIssueFacetResponse for HTTP 200 { status: 400, error: string } quirk.
     */
    daily(params: PublicInspectionIssueDailyFacetParams): Promise<PublicInspectionIssueDailyFacetMap>;
    /**
     * 2. Type Public Inspection Issue facet.
     * Path: /public-inspection-issues/facets/type
     * Requires: publicationDate.is
     * Uses decodePublicInspectionIssueFacetResponse for HTTP 200 { status: 400, error: string } quirk.
     */
    type(params: PublicInspectionIssueTypeFacetParams): Promise<PublicInspectionIssueTypeFacetMap>;
    dailyJsonp(params: PublicInspectionIssueDailyFacetParams & JsonpCallbackParams): Promise<JsonpText>;
    typeJsonp(params: PublicInspectionIssueTypeFacetParams & JsonpCallbackParams): Promise<JsonpText>;
}
/**
 * Nested presenter for Public Inspection Issues (fr.publicInspection.issues.*)
 */
export declare class PublicInspectionIssuesService {
    #private;
    /**
     * Public Inspection Issue Facets sub-namespace (fr.publicInspection.issues.facets.*)
     */
    readonly facets: PublicInspectionIssueFacetsService;
    constructor(client: FederalRegisterClient);
}
//# sourceMappingURL=facets.d.ts.map