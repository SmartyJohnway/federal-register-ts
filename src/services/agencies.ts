/**
 * R0-07B / R2-04 Agencies Service
 *
 * Implements the 4 frozen core JSON Agency operations:
 * 1. fr.agencies.list(params?: AgencyListParams): Promise<AgencyIndexItem<K>[]>
 * 2. fr.agencies.find(params: AgencyFindParams): Promise<AgencyProjection<K>>
 * 3. fr.agencies.findMany(params: AgencyFindManyParams): Promise<AgencyProjection<K>[]>
 * 4. fr.agencies.suggestions(params: AgencySuggestionsParams): Promise<AgencyProjection<K>[]>
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import {
  decodeJsonResponse,
  classifyAgencyHttpError,
  classifyGenericHttpError,
  type DecodedResponse,
} from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type {
  AgencyListParams,
  AgencyFindParams,
  AgencyFindManyParams,
  AgencySuggestionsParams,
  AgencyField,
  JsonpCallbackParams,
} from "../request/types";
import type {
  AgencyIndexItem,
  AgencyProjection,
  JsonpText,
} from "./models";

/**
 * Operation-aware agency find decoder using classifyAgencyHttpError.
 * HTTP 404 with { error: 404 } produces FederalRegisterAgencyNotFoundError.
 */
function agencyFindDecoder<T>(decoded: DecodedResponse): T {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decodeJsonResponse(decoded);
  }
  throw classifyAgencyHttpError(decoded);
}

/**
 * Agency multi-lookup decoder normalizing upstream single-item response to plain array.
 */
function decodeAgencyListResponse<T>(decoded: DecodedResponse): T[] {
  const parsed = decodeJsonResponse(decoded);
  if (Array.isArray(parsed)) {
    return parsed as T[];
  }
  if (parsed && typeof parsed === "object") {
    return [parsed as T];
  }
  return [];
}

export class AgenciesService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * 1. List all agencies.
   * Path: /agencies
   * Note: Always augmented with json_url on each agency index item.
   */
  async list<K extends AgencyField = AgencyField>(
    params?: AgencyListParams
  ): Promise<AgencyIndexItem<K>[]> {
    const entries = params ? QuerySerializer.serializeAgencyListParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<AgencyIndexItem<K>[]>(
      "/agencies",
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 2. Single agency lookup by numeric ID or slug.
   * Path: /agencies/{idOrSlug}
   * Throws FederalRegisterAgencyNotFoundError on 404 { error: 404 }.
   */
  async find<K extends AgencyField = AgencyField>(
    params: AgencyFindParams
  ): Promise<AgencyProjection<K>> {
    const { pathSegment, entries } = QuerySerializer.serializeAgencyFind(params);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedPath = encodeURIComponent(pathSegment);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<AgencyProjection<K>>(
      `/agencies/${encodedPath}`,
      qs,
      agencyFindDecoder
    );
  }

  /**
   * 3. Multiple agency lookup by comma-separated numeric IDs.
   * Path: /agencies/{ids}
   * Upstream returns plain AgencyProjection<K>[] omitting missing IDs.
   * Does NOT return a MultiLookupEnvelope.
   */
  async findMany<K extends AgencyField = AgencyField>(
    params: AgencyFindManyParams
  ): Promise<AgencyProjection<K>[]> {
    const { pathSegment, entries } = QuerySerializer.serializeAgencyFindMany(params);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedPath = pathSegment
      .split(",")
      .map((id) => encodeURIComponent(id))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<AgencyProjection<K>[]>(
      `/agencies/${encodedPath}`,
      qs,
      decodeAgencyListResponse
    );
  }

  /**
   * 4. Agency suggestions by term.
   * Path: /agencies/suggestions
   * Returns AgencyProjection<K>[].
   */
  async suggestions<K extends AgencyField = AgencyField>(
    params: AgencySuggestionsParams
  ): Promise<AgencyProjection<K>[]> {
    const entries = QuerySerializer.serializeAgencySuggestionsParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<AgencyProjection<K>[]>(
      "/agencies/suggestions",
      qs,
      decodeJsonResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Methods ---

  /**
   * List all agencies JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-001).
   */
  async listJsonp(params: (AgencyListParams | undefined) & JsonpCallbackParams): Promise<JsonpText> {
    const entries = params ? QuerySerializer.serializeAgencyListParams(params) : [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/agencies", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw classifyGenericHttpError(decoded);
    });
  }

  /**
   * Single agency lookup JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-002).
   */
  async findJsonp(params: AgencyFindParams & JsonpCallbackParams): Promise<JsonpText> {
    const { pathSegment, entries } = QuerySerializer.serializeAgencyFind(params);
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedId = encodeURIComponent(pathSegment);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(`/agencies/${encodedId}`, qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw classifyAgencyHttpError(decoded);
    });
  }

  /**
   * Multiple agency lookup JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-004).
   */
  async findManyJsonp(params: AgencyFindManyParams & JsonpCallbackParams): Promise<JsonpText> {
    const { pathSegment, entries } = QuerySerializer.serializeAgencyFindMany(params);
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const encodedPath = pathSegment
      .split(",")
      .map((id) => encodeURIComponent(id))
      .join(",");
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(`/agencies/${encodedPath}`, qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw classifyGenericHttpError(decoded);
    });
  }

  /**
   * Agency suggestions JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-005).
   */
  async suggestionsJsonp(params: AgencySuggestionsParams & JsonpCallbackParams): Promise<JsonpText> {
    const entries = QuerySerializer.serializeAgencySuggestionsParams(params);
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/agencies/suggestions", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw classifyGenericHttpError(decoded);
    });
  }
}
