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
  type DecodedResponse,
} from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type {
  AgencyListParams,
  AgencyFindParams,
  AgencyFindManyParams,
  AgencySuggestionsParams,
  AgencyField,
} from "../request/types";
import type {
  AgencyIndexItem,
  AgencyProjection,
} from "./models";

/**
 * Operation-aware agency find decoder using classifyAgencyHttpError.
 * HTTP 404 with { error: 404 } produces FederalRegisterAgencyNotFoundError.
 */
function agencyFindDecoder<T>(decoded: DecodedResponse): T {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decoded.parsedJson;
  }
  throw classifyAgencyHttpError(decoded);
}

export class AgenciesService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * 1. List all agencies.
   * Path: /agencies.json
   * Note: Always augmented with json_url on each agency index item.
   */
  async list<K extends AgencyField = AgencyField>(
    params?: AgencyListParams
  ): Promise<AgencyIndexItem<K>[]> {
    const entries = params ? QuerySerializer.serializeAgencyListParams(params) : [];
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<AgencyIndexItem<K>[]>(
      "/agencies.json",
      qs,
      decodeJsonResponse
    );
  }

  /**
   * 2. Single agency lookup by numeric ID or slug.
   * Path: /agencies/{idOrSlug}.json
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
      `/agencies/${encodedPath}.json`,
      qs,
      agencyFindDecoder
    );
  }

  /**
   * 3. Multiple agency lookup by comma-separated numeric IDs.
   * Path: /agencies/{ids}.json
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
      `/agencies/${encodedPath}.json`,
      qs,
      decodeJsonResponse
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
}
