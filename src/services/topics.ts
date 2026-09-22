/**
 * R0-07B / R2-06 Topics Service
 *
 * Implements:
 * 1. fr.topics.suggestions(params: TopicSuggestionsParams): Promise<readonly TopicProjection<K>[]>
 *    Path: /topics/suggestions
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type { TopicSuggestionsParams, TopicField, JsonpCallbackParams } from "../request/types";
import type { TopicProjection, JsonpText, TopicCatalogResponse } from "./models";

export class TopicsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Topic catalog (CAP-001).
   * Path: /topics.json
   */
  async list(): Promise<TopicCatalogResponse> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<TopicCatalogResponse>(
      "/topics.json",
      undefined,
      decodeJsonResponse
    );
  }

  /**
   * Topic suggestions (FR-TOPIC-001).
   * Path: /topics/suggestions
   */
  async suggestions<K extends TopicField = TopicField>(
    params: TopicSuggestionsParams
  ): Promise<readonly TopicProjection<K>[]> {
    const entries = QuerySerializer.serializeTopicSuggestionsParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<readonly TopicProjection<K>[]>(
      "/topics/suggestions",
      qs,
      decodeJsonResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Method ---

  /**
   * Topic suggestions JSONP format companion (FR-PROTO-003 companion to FR-TOPIC-001).
   */
  async suggestionsJsonp(
    params: TopicSuggestionsParams & JsonpCallbackParams
  ): Promise<JsonpText> {
    const entries = QuerySerializer.serializeTopicSuggestionsParams(params);
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/topics/suggestions", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw decodeJsonResponse(decoded);
    });
  }
}
