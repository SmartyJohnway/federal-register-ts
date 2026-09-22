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
  classifyGenericHttpError,
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
  DocumentFindCsvParams,
  DocumentSearchRssParams,
  DocumentSearchCsvParams,
  DocumentField,
  JsonpCallbackParams,
} from "../request/types";
import type {
  SearchResultEnvelope,
  DocumentSearchItem,
  DocumentShow,
  MultiLookupEnvelope,
  DocumentAutocompleteSuggestion,
  DocumentSearchDetails,
  DocumentSearchDefaultField,
  DocumentShowDefaultField,
  DocumentCsvText,
  DocumentRssXmlText,
  JsonpText,
} from "./models";
import { DocumentFacetsService } from "./facets";

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
 * Multi-lookup decoder normalizing upstream single-item response polymorphism.
 */
function decodeDocumentMultiLookupResponse<T>(decoded: DecodedResponse): MultiLookupEnvelope<T> {
  const parsed = decodeJsonResponse(decoded);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    if ("results" in parsed && Array.isArray(parsed.results)) {
      return parsed as MultiLookupEnvelope<T>;
    }
    if ("errors" in parsed && parsed.errors && typeof parsed.errors === "object") {
      return {
        count: typeof (parsed as any).count === "number" ? (parsed as any).count : 0,
        results: Array.isArray((parsed as any).results) ? (parsed as any).results : [],
        errors: (parsed as any).errors,
      } as MultiLookupEnvelope<T>;
    }
    return {
      count: 1,
      results: [parsed as T],
    };
  }
  return parsed as MultiLookupEnvelope<T>;
}

export class DocumentsService {
  readonly #client: FederalRegisterClient;

  /**
   * Document Facets sub-namespace (fr.documents.facets.*)
   */
  readonly facets: DocumentFacetsService;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
    this.facets = new DocumentFacetsService(client);
  }

  /**
   * 1. Search documents with structured conditions and full-text search.
   * Path: /documents
   */
  async search<K extends DocumentField = DocumentSearchDefaultField>(
    params?: DocumentSearchParams
  ): Promise<SearchResultEnvelope<DocumentSearchItem<K>>> {
    const entries = params ? QuerySerializer.serializeDocumentSearchParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<SearchResultEnvelope<DocumentSearchItem<K>>>(
      "/documents",
      qs,
      searchDecoder
    );
  }

  /**
   * 2. Single document lookup by document number.
   * Path: /documents/{documentNumber}
   */
  async find<K extends DocumentField = DocumentShowDefaultField>(
    params: DocumentFindParams
  ): Promise<DocumentShow<K>> {
    const entries = QuerySerializer.serializeDocumentFindQuery(params);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedDocNumber = encodeURIComponent(params.documentNumber);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentShow<K>>(
      `/documents/${encodedDocNumber}`,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 3. Multiple document lookup by comma-separated document numbers.
   * Path: /documents/{documentNumbers}
   * Returns MultiLookupEnvelope. Partial success with not_found errors is resolved, NOT thrown.
   */
  async findMany<K extends DocumentField = DocumentShowDefaultField>(
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
      `/documents/${encodedPathSegment}`,
      qs,
      decodeDocumentMultiLookupResponse
    );
  }

  /**
   * 4. Single citation lookup.
   * Path: /documents/{volume}%20FR%20{page}
   * Upstream returns MultiLookupEnvelope for citation lookups.
   */
  async findByCitation<K extends DocumentField = DocumentShowDefaultField>(
    params: DocumentCitationFindParams
  ): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>> {
    const { volume, page, entries } = QuerySerializer.serializeDocumentCitationFind(params);
    const qs = QuerySerializer.toQueryString(entries);
    // Wire format: /documents/{volume}%20FR%20{page}
    const path = `/documents/${encodeURIComponent(`${volume} FR ${page}`)}`;
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<MultiLookupEnvelope<DocumentShow<K | "citation">>>(
      path,
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 5. Multiple citation lookup.
   * Path: /documents/{citations}
   * Wire format: comma-separated {volume}%20FR%20{page} citations
   */
  async findManyByCitation<K extends DocumentField = DocumentShowDefaultField>(
    params: DocumentCitationFindManyParams
  ): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>> {
    const { entries } = QuerySerializer.serializeDocumentCitationFindMany(params);
    const qs = QuerySerializer.toQueryString(entries);
    const pathSegment = params.citations
      .map((c) => encodeURIComponent(`${c.volume} FR ${c.page}`))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<MultiLookupEnvelope<DocumentShow<K | "citation">>>(
      `/documents/${pathSegment}`,
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
      searchDecoder
    );
  }

  /**
   * 8. Document show CSV export (FR-DOC-007).
   * Path: /documents/{ids}.csv
   */
  async findCsv(params: DocumentFindCsvParams): Promise<DocumentCsvText> {
    const { pathSegment, entries } = QuerySerializer.serializeDocumentFindCsv(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentCsvText>(
      `/documents/${pathSegment}.csv`,
      qs,
      (decoded) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifyGenericHttpError(decoded);
      }
    );
  }

  /**
   * 9. Document search RSS feed (FR-DOC-008).
   * Path: /documents.rss
   */
  async searchRss(params?: DocumentSearchRssParams): Promise<DocumentRssXmlText> {
    const entries = params ? QuerySerializer.serializeDocumentSearchRssParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentRssXmlText>(
      "/documents.rss",
      qs,
      (decoded) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifySearchHttpError(decoded);
      }
    );
  }

  /**
   * 10. Document search CSV export (FR-DOC-009).
   * Path: /documents.csv
   */
  async searchCsv(params?: DocumentSearchCsvParams): Promise<DocumentCsvText> {
    const entries = params ? QuerySerializer.serializeDocumentSearchCsvParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentCsvText>(
      "/documents.csv",
      qs,
      (decoded) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifySearchHttpError(decoded);
      }
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Methods ---

  /**
   * Document search JSONP format companion (FR-PROTO-003 companion to FR-DOC-001).
   */
  async searchJsonp(params: (DocumentSearchParams | undefined) & JsonpCallbackParams): Promise<JsonpText> {
    const entries = params ? QuerySerializer.serializeDocumentSearchParams(params) : [];
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/documents", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText ?? "";
      }
      throw classifySearchHttpError(decoded);
    });
  }

  /**
   * Single document lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-002).
   */
  async findJsonp(params: DocumentFindParams & JsonpCallbackParams): Promise<JsonpText> {
    const entries = QuerySerializer.serializeDocumentFindQuery(params);
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedDocNumber = encodeURIComponent(params.documentNumber);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(`/documents/${encodedDocNumber}`, qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText ?? "";
      }
      throw classifyGenericHttpError(decoded);
    });
  }

  /**
   * Multiple document lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-003).
   */
  async findManyJsonp(params: DocumentFindManyParams & JsonpCallbackParams): Promise<JsonpText> {
    const { pathSegment, entries } = QuerySerializer.serializeDocumentFindMany(params);
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedPathSegment = pathSegment
      .split(",")
      .map((d) => encodeURIComponent(d))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(`/documents/${encodedPathSegment}`, qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText ?? "";
      }
      throw classifyGenericHttpError(decoded);
    });
  }

  /**
   * Single citation lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-004).
   */
  async findByCitationJsonp(params: DocumentCitationFindParams & JsonpCallbackParams): Promise<JsonpText> {
    const { volume, page, entries } = QuerySerializer.serializeDocumentCitationFind(params);
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const path = `/documents/${encodeURIComponent(`${volume} FR ${page}`)}`;
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(path, qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText ?? "";
      }
      throw classifyGenericHttpError(decoded);
    });
  }

  /**
   * Multiple citation lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-005).
   */
  async findManyByCitationJsonp(params: DocumentCitationFindManyParams & JsonpCallbackParams): Promise<JsonpText> {
    const { entries } = QuerySerializer.serializeDocumentCitationFindMany(params);
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const pathSegment = params.citations
      .map((c) => encodeURIComponent(`${c.volume} FR ${c.page}`))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(`/documents/${pathSegment}`, qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText ?? "";
      }
      throw classifyGenericHttpError(decoded);
    });
  }

  /**
   * Document autocomplete JSONP format companion (FR-PROTO-003 companion to FR-DOC-010).
   */
  async autocompleteJsonp(params: DocumentAutocompleteParams & JsonpCallbackParams): Promise<JsonpText> {
    const entries = QuerySerializer.serializeDocumentAutocompleteParams(params);
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/documents/autocomplete-suggestions", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText ?? "";
      }
      throw classifyGenericHttpError(decoded);
    });
  }

  /**
   * Document search details JSONP format companion (FR-PROTO-003 companion to FR-DOC-011).
   */
  async searchDetailsJsonp(params: (DocumentSearchDetailsParams | undefined) & JsonpCallbackParams): Promise<JsonpText> {
    const entries = params ? QuerySerializer.serializeDocumentSearchDetailsParams(params) : [];
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/documents/search-details", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText ?? "";
      }
      throw classifySearchHttpError(decoded);
    });
  }
}

