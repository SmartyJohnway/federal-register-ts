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
import { getInternalClientRuntime } from "../core/internal/runtime";
import {
  decodeJsonResponse,
  classifySearchHttpError,
  type DecodedResponse,
} from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type {
  PublicInspectionSearchParams,
  PublicInspectionAvailableOnParams,
  PublicInspectionCurrentParams,
  PublicInspectionFindParams,
  PublicInspectionFindManyParams,
  PublicInspectionSearchDetailsParams,
  PublicInspectionField,
} from "../request/types";
import type {
  SearchResultEnvelope,
  PublicInspectionSearchItem,
  PublicInspectionIssueDocumentsEnvelope,
  PublicInspectionIssueItem,
  PublicInspectionShow,
  MultiLookupEnvelope,
  PublicInspectionSearchDetails,
  PublicInspectionShowDefaultField,
} from "./models";
import {
  PublicInspectionFacetsService,
  PublicInspectionIssuesService,
} from "./facets";

/**
 * Operation-aware search decoder using classifySearchHttpError.
 */
function searchDecoder<T>(decoded: DecodedResponse): T {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decoded.parsedJson;
  }
  throw classifySearchHttpError(decoded);
}

export class PublicInspectionService {
  readonly #client: FederalRegisterClient;

  /**
   * Public Inspection Document Facets sub-namespace (fr.publicInspection.facets.*)
   */
  readonly facets: PublicInspectionFacetsService;

  /**
   * Public Inspection Issues presenter (fr.publicInspection.issues.*)
   */
  readonly issues: PublicInspectionIssuesService;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
    this.facets = new PublicInspectionFacetsService(client);
    this.issues = new PublicInspectionIssuesService(client);
  }


  /**
   * 1. Public Inspection search with structured conditions and full-text search.
   * Path: /public-inspection-documents
   */
  async search<K extends PublicInspectionField = PublicInspectionField>(
    params?: PublicInspectionSearchParams
  ): Promise<SearchResultEnvelope<PublicInspectionSearchItem<K>>> {
    const entries = params ? QuerySerializer.serializePublicInspectionSearchParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<SearchResultEnvelope<PublicInspectionSearchItem<K>>>(
      "/public-inspection-documents",
      qs,
      searchDecoder
    );
  }

  /**
   * 2. Available-on exact issue-date retrieval.
   * Path: /public-inspection-documents?conditions[available_on]=YYYY-MM-DD
   * Returns PublicInspectionIssueDocumentsEnvelope.
   */
  async availableOn<K extends PublicInspectionField = PublicInspectionField>(
    params: PublicInspectionAvailableOnParams
  ): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>> {
    const entries = QuerySerializer.serializePublicInspectionAvailableOnParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>(
      "/public-inspection-documents",
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 3. Current Public Inspection documents.
   * Path: /public-inspection-documents/current
   * Returns PublicInspectionIssueDocumentsEnvelope.
   */
  async current<K extends PublicInspectionField = PublicInspectionField>(
    params?: PublicInspectionCurrentParams
  ): Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>> {
    const entries = params ? QuerySerializer.serializePublicInspectionCurrentParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>(
      "/public-inspection-documents/current",
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 4. Single Public Inspection document lookup by document number.
   * Path: /public-inspection-documents/{documentNumber}
   */
  async find<K extends PublicInspectionField = PublicInspectionShowDefaultField>(
    params: PublicInspectionFindParams
  ): Promise<PublicInspectionShow<K>> {
    const entries = QuerySerializer.serializePublicInspectionFindQuery(params);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedDocNumber = encodeURIComponent(params.documentNumber);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionShow<K>>(
      `/public-inspection-documents/${encodedDocNumber}`,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 5. Multiple Public Inspection document lookup by comma-separated numbers.
   * Path: /public-inspection-documents/{documentNumbers}
   * Returns MultiLookupEnvelope. Partial success with not_found errors is resolved, NOT thrown.
   */
  async findMany<K extends PublicInspectionField = PublicInspectionShowDefaultField>(
    params: PublicInspectionFindManyParams
  ): Promise<MultiLookupEnvelope<PublicInspectionShow<K>>> {
    const { pathSegment, entries } = QuerySerializer.serializePublicInspectionFindMany(params);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedPathSegment = pathSegment
      .split(",")
      .map((d) => encodeURIComponent(d))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<MultiLookupEnvelope<PublicInspectionShow<K>>>(
      `/public-inspection-documents/${encodedPathSegment}`,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 6. Public Inspection search details.
   * Path: /public-inspection-documents/search-details
   */
  async searchDetails(
    params?: PublicInspectionSearchDetailsParams
  ): Promise<PublicInspectionSearchDetails> {
    const entries = params ? QuerySerializer.serializePublicInspectionSearchConditionsOnly(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PublicInspectionSearchDetails>(
      "/public-inspection-documents/search-details",
      qs,
      searchDecoder
    );
  }
}
