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
import type { TopicSuggestionsParams, TopicField } from "../request/types";
import type { TopicProjection } from "./models";

export class TopicsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
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
}
