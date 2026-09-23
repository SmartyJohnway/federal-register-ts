/**
 * R0-07B / R2-06 Suggested Searches Service
 *
 * Implements:
 * 1. fr.suggestedSearches.list(): Promise<SuggestedSearchIndexMap>
 *    Path: /suggested_searches
 * 2. fr.suggestedSearches.listBySections(params: SuggestedSearchSectionsParams): Promise<SuggestedSearchIndexMap>
 *    Path: /suggested_searches?conditions[sections][]=...
 * 3. fr.suggestedSearches.find(params: SuggestedSearchFindParams): Promise<SuggestedSearchDetail>
 *    Path: /suggested_searches/{slug}
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type {
  SuggestedSearchSectionsParams,
  SuggestedSearchFindParams,
  JsonpCallbackParams,
} from "../request/types";
import type {
  SuggestedSearchIndexMap,
  SuggestedSearchDetail,
  JsonpText,
} from "./models";

export class SuggestedSearchesService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * List suggested searches grouped by section (FR-SUGGEST-001).
   * Path: /suggested_searches
   */
  async list(): Promise<SuggestedSearchIndexMap> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<SuggestedSearchIndexMap>(
      "/suggested_searches",
      undefined,
      decodeJsonResponse
    );
  }

  /**
   * Filter suggested searches by sections (FR-SUGGEST-002).
   * Path: /suggested_searches?conditions[sections][]=...
   */
  async listBySections(
    params: SuggestedSearchSectionsParams
  ): Promise<SuggestedSearchIndexMap> {
    const entries = QuerySerializer.serializeSuggestedSearchSectionsParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<SuggestedSearchIndexMap>(
      "/suggested_searches",
      qs,
      decodeJsonResponse
    );
  }

  /**
   * Find suggested search by slug (FR-SUGGEST-003).
   * Path: /suggested_searches/{slug}
   */
  async find(params: SuggestedSearchFindParams): Promise<SuggestedSearchDetail> {
    const slug = QuerySerializer.serializeSuggestedSearchFind(params);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<SuggestedSearchDetail>(
      `/suggested_searches/${encodeURIComponent(slug)}`,
      undefined,
      decodeJsonResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Methods ---

  /**
   * List suggested searches JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-001).
   */
  async listJsonp(params: JsonpCallbackParams): Promise<JsonpText> {
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/suggested_searches", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw decodeJsonResponse(decoded);
    });
  }

  /**
   * Filter suggested searches by sections JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-002).
   */
  async listBySectionsJsonp(
    params: SuggestedSearchSectionsParams & JsonpCallbackParams
  ): Promise<JsonpText> {
    const entries = QuerySerializer.serializeSuggestedSearchSectionsParams(params);
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/suggested_searches", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw decodeJsonResponse(decoded);
    });
  }

  /**
   * Find suggested search by slug JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-003).
   */
  async findJsonp(
    params: SuggestedSearchFindParams & JsonpCallbackParams
  ): Promise<JsonpText> {
    const slug = QuerySerializer.serializeSuggestedSearchFind(params);
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(
      `/suggested_searches/${encodeURIComponent(slug)}`,
      qs,
      (decoded) => {
        if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
        throw decodeJsonResponse(decoded);
      }
    );
  }
}

