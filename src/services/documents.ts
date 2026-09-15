/**
 * R0-07B / R2-04 Documents Service
 *
 * Implements the 7 frozen core JSON Document operations:
 * 1. fr.documents.search(params?: DocumentSearchParams): Promise<SearchResultEnvelope<DocumentSearchItem<K>>>
 * 2. fr.documents.find(params: DocumentFindParams): Promise<DocumentShow<K>>
 * 3. fr.documents.findMany(params: DocumentFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K>>>
 * 4. fr.documents.findByCitation(params: DocumentCitationFindParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>
 * 5. fr.documents.findManyByCitation(params: DocumentCitationFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>
 * 6. fr.documents.autocomplete(params: DocumentAutocompleteParams): Promise<DocumentAutocompleteSuggestion[]>
 * 7. fr.documents.searchDetails(params?: DocumentSearchDetailsParams): Promise<DocumentSearchDetails>
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
  DocumentSearchParams,
  DocumentFindParams,
  DocumentFindManyParams,
  DocumentCitationFindParams,
  DocumentCitationFindManyParams,
  DocumentAutocompleteParams,
  DocumentSearchDetailsParams,
  DocumentField,
} from "../request/types";
import type {
  SearchResultEnvelope,
  DocumentSearchItem,
  DocumentShow,
  MultiLookupEnvelope,
  DocumentAutocompleteSuggestion,
  DocumentSearchDetails,
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

export class DocumentsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * 1. Search documents with structured conditions and full-text search.
   * Path: /documents.json
   */
  async search<K extends DocumentField = DocumentField>(
    params?: DocumentSearchParams
  ): Promise<SearchResultEnvelope<DocumentSearchItem<K>>> {
    const entries = params ? QuerySerializer.serializeDocumentSearchParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<SearchResultEnvelope<DocumentSearchItem<K>>>(
      "/documents.json",
      qs,
      searchDecoder
    );
  }

  /**
   * 2. Single document lookup by document number.
   * Path: /documents/{documentNumber}.json
   */
  async find<K extends DocumentField = DocumentField>(
    params: DocumentFindParams
  ): Promise<DocumentShow<K>> {
    const entries = QuerySerializer.serializeDocumentFindQuery(params);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedDocNumber = encodeURIComponent(params.documentNumber);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentShow<K>>(
      `/documents/${encodedDocNumber}.json`,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 3. Multiple document lookup by comma-separated document numbers.
   * Path: /documents/{documentNumbers}.json
   * Returns MultiLookupEnvelope. Partial success with not_found errors is resolved, NOT thrown.
   */
  async findMany<K extends DocumentField = DocumentField>(
    params: DocumentFindManyParams
  ): Promise<MultiLookupEnvelope<DocumentShow<K>>> {
    const { pathSegment, entries } = QuerySerializer.serializeDocumentFindMany(params);
    const qs = QuerySerializer.toQueryString(entries);
    // Each document number is separated by comma, pathSegment preserves commas
    const encodedPathSegment = pathSegment
      .split(",")
      .map((d) => encodeURIComponent(d))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<MultiLookupEnvelope<DocumentShow<K>>>(
      `/documents/${encodedPathSegment}.json`,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 4. Single citation lookup.
   * Path: /documents/{volume}%20FR%20{page}.json
   * Upstream returns MultiLookupEnvelope for citation lookups.
   */
  async findByCitation<K extends DocumentField = DocumentField>(
    params: DocumentCitationFindParams
  ): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>> {
    const { volume, page, entries } = QuerySerializer.serializeDocumentCitationFind(params);
    const qs = QuerySerializer.toQueryString(entries);
    // Wire format observed in R0-05 LP-DOC-01: {volume}%20FR%20{page}.json
    const path = `/documents/${encodeURIComponent(`${volume} FR ${page}`)}.json`;
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<MultiLookupEnvelope<DocumentShow<K | "citation">>>(
      path,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 5. Multiple citation lookup.
   * Path: /documents/{citations}.json
   * Supports comma-separated volume/page or volume FR page citations.
   */
  async findManyByCitation<K extends DocumentField = DocumentField>(
    params: DocumentCitationFindManyParams
  ): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>> {
    const { pathSegment, entries } = QuerySerializer.serializeDocumentCitationFindMany(params);
    const qs = QuerySerializer.toQueryString(entries);
    // QuerySerializer produces e.g. "91/58007,99/99999"
    // Also encode each segment appropriately
    const encodedPathSegment = pathSegment
      .split(",")
      .map((seg) => encodeURIComponent(seg))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<MultiLookupEnvelope<DocumentShow<K | "citation">>>(
      `/documents/${encodedPathSegment}.json`,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 6. Document autocomplete suggestions.
   * Path: /documents/autocomplete-suggestions
   */
  async autocomplete(
    params: DocumentAutocompleteParams
  ): Promise<DocumentAutocompleteSuggestion[]> {
    const entries = QuerySerializer.serializeDocumentAutocompleteParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentAutocompleteSuggestion[]>(
      "/documents/autocomplete-suggestions",
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 7. Document search details.
   * Path: /documents/search-details
   */
  async searchDetails(
    params?: DocumentSearchDetailsParams
  ): Promise<DocumentSearchDetails> {
    const entries = params ? QuerySerializer.serializeDocumentSearchDetailsParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentSearchDetails>(
      "/documents/search-details",
      qs,
      decodeJsonResponse
    );
  }
}
