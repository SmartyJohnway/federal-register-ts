/**
 * R0-07B / R2-06 Topics Service
 *
 * Implements:
 * 1. fr.topics.suggestions(params: TopicSuggestionsParams): Promise<readonly TopicProjection<K>[]>
 *    Path: /topics/suggestions
 */
import type { FederalRegisterClient } from "../core/client";
import type { TopicSuggestionsParams, TopicField, JsonpCallbackParams } from "../request/types";
import type { TopicProjection, JsonpText, TopicCatalogResponse } from "./models";
export declare class TopicsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Topic catalog (CAP-001).
     * Path: /topics.json
     */
    list(): Promise<TopicCatalogResponse>;
    /**
     * Topic suggestions (FR-TOPIC-001).
     * Path: /topics/suggestions
     */
    suggestions<K extends TopicField = TopicField>(params: TopicSuggestionsParams): Promise<readonly TopicProjection<K>[]>;
    /**
     * Topic suggestions JSONP format companion (FR-PROTO-003 companion to FR-TOPIC-001).
     */
    suggestionsJsonp(params: TopicSuggestionsParams & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=topics.d.ts.map