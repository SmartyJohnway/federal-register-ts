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
import { getInternalClientRuntime } from "../core/internal/runtime";
import {
  decodeJsonResponse,
  classifySearchHttpError,
  decodePublicInspectionIssueFacetResponse,
  type DecodedResponse,
} from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type {
  DocumentFacetParams,
  PublicInspectionFacetParams,
  PublicInspectionIssueDailyFacetParams,
  PublicInspectionIssueTypeFacetParams,
} from "../request/types";
import type {
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
  PublicInspectionIssueDailyFacetMap,
  PublicInspectionIssueTypeFacetMap,
} from "./models";

/**
 * Operation-aware search decoder using classifySearchHttpError.
 */
function searchDecoder<T>(decoded: DecodedResponse): T {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decoded.parsedJson;
  }
  throw classifySearchHttpError(decoded);
}

/**
 * Service namespace for Document facets (fr.documents.facets.*)
 */
export class DocumentFacetsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * 1. Document agency facet.
   * Path: /documents/facets/agency
   */
  async agency(params?: DocumentFacetParams): Promise<DocumentAgencyFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentAgencyFacetMap>(
      "/documents/facets/agency",
      qs,
      searchDecoder
    );
  }

  /**
   * 2. Document topic facet.
   * Path: /documents/facets/topic
   */
  async topic(params?: DocumentFacetParams): Promise<DocumentTopicFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentTopicFacetMap>(
      "/documents/facets/topic",
      qs,
      searchDecoder
    );
  }

  /**
   * 3. Document section facet.
   * Path: /documents/facets/section
   */
  async section(params?: DocumentFacetParams): Promise<DocumentSectionFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentSectionFacetMap>(
      "/documents/facets/section",
      qs,
      searchDecoder
    );
  }

  /**
   * 4. Document type facet.
   * Path: /documents/facets/type
   */
  async type(params?: DocumentFacetParams): Promise<DocumentTypeFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentTypeFacetMap>(
      "/documents/facets/type",
      qs,
      searchDecoder
    );
  }

  /**
   * 5. Document subtype facet.
   * Path: /documents/facets/subtype
   */
  async subtype(params?: DocumentFacetParams): Promise<DocumentSubtypeFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentSubtypeFacetMap>(
      "/documents/facets/subtype",
      qs,
      searchDecoder
    );
  }

  /**
   * 6. Document daily date facet.
   * Path: /documents/facets/daily
   */
  async daily(params?: DocumentFacetParams): Promise<DocumentDailyFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentDailyFacetMap>(
      "/documents/facets/daily",
      qs,
      searchDecoder
    );
  }

  /**
   * 7. Document weekly date facet.
   * Path: /documents/facets/weekly
   */
  async weekly(params?: DocumentFacetParams): Promise<DocumentWeeklyFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentWeeklyFacetMap>(
      "/documents/facets/weekly",
      qs,
      searchDecoder
    );
  }

  /**
   * 8. Document monthly date facet.
   * Path: /documents/facets/monthly
   */
  async monthly(params?: DocumentFacetParams): Promise<DocumentMonthlyFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentMonthlyFacetMap>(
      "/documents/facets/monthly",
      qs,
      searchDecoder
    );
  }

  /**
   * 9. Document quarterly date facet.
   * Path: /documents/facets/quarterly
   */
  async quarterly(params?: DocumentFacetParams): Promise<DocumentQuarterlyFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentQuarterlyFacetMap>(
      "/documents/facets/quarterly",
      qs,
      searchDecoder
    );
  }

  /**
   * 10. Document yearly date facet.
   * Path: /documents/facets/yearly
   */
  async yearly(params?: DocumentFacetParams): Promise<DocumentYearlyFacetMap> {
    const entries = params ? QuerySerializer.serializeDocumentFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentYearlyFacetMap>(
      "/documents/facets/yearly",
      qs,
      searchDecoder
    );
  }
}

/**
 * Service namespace for Public Inspection document facets (fr.publicInspection.facets.*)
 */
export class PublicInspectionFacetsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * 1. Public Inspection type facet.
   * Path: /public-inspection-documents/facets/type
   */
  async type(params?: PublicInspectionFacetParams): Promise<PublicInspectionTypeFacetMap> {
    const entries = params ? QuerySerializer.serializePublicInspectionFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionTypeFacetMap>(
      "/public-inspection-documents/facets/type",
      qs,
      searchDecoder
    );
  }

  /**
   * 2. Public Inspection agency facet (keyed by Agency ID).
   * Path: /public-inspection-documents/facets/agency
   */
  async agency(params?: PublicInspectionFacetParams): Promise<PublicInspectionAgencyIdFacetMap> {
    const entries = params ? QuerySerializer.serializePublicInspectionFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionAgencyIdFacetMap>(
      "/public-inspection-documents/facets/agency",
      qs,
      searchDecoder
    );
  }

  /**
   * 3. Public Inspection agencies facet (keyed by Agency slug).
   * Path: /public-inspection-documents/facets/agencies
   */
  async agencies(params?: PublicInspectionFacetParams): Promise<PublicInspectionAgencySlugFacetMap> {
    const entries = params ? QuerySerializer.serializePublicInspectionFacetParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionAgencySlugFacetMap>(
      "/public-inspection-documents/facets/agencies",
      qs,
      searchDecoder
    );
  }
}

/**
 * Service namespace for Public Inspection Issue facets (fr.publicInspection.issues.facets.*)
 */
export class PublicInspectionIssueFacetsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * 1. Daily Public Inspection Issue facet.
   * Path: /public-inspection-issues/facets/daily
   * Requires: publicationDate.gte
   * Uses decodePublicInspectionIssueFacetResponse for HTTP 200 { status: 400, error: string } quirk.
   */
  async daily(
    params: PublicInspectionIssueDailyFacetParams
  ): Promise<PublicInspectionIssueDailyFacetMap> {
    const entries = QuerySerializer.serializePublicInspectionIssueDailyFacetParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionIssueDailyFacetMap>(
      "/public-inspection-issues/facets/daily",
      qs,
      decodePublicInspectionIssueFacetResponse
    );
  }

  /**
   * 2. Type Public Inspection Issue facet.
   * Path: /public-inspection-issues/facets/type
   * Requires: publicationDate.is
   * Uses decodePublicInspectionIssueFacetResponse for HTTP 200 { status: 400, error: string } quirk.
   */
  async type(
    params: PublicInspectionIssueTypeFacetParams
  ): Promise<PublicInspectionIssueTypeFacetMap> {
    const entries = QuerySerializer.serializePublicInspectionIssueTypeFacetParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionIssueTypeFacetMap>(
      "/public-inspection-issues/facets/type",
      qs,
      decodePublicInspectionIssueFacetResponse
    );
  }
}

/**
 * Nested presenter for Public Inspection Issues (fr.publicInspection.issues.*)
 */
export class PublicInspectionIssuesService {
  readonly #client: FederalRegisterClient;

  /**
   * Public Inspection Issue Facets sub-namespace (fr.publicInspection.issues.facets.*)
   */
  readonly facets: PublicInspectionIssueFacetsService;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
    this.facets = new PublicInspectionIssueFacetsService(client);
  }
}
