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
import type { AgencyListParams, AgencyFindParams, AgencyFindManyParams, AgencySuggestionsParams, AgencyField, JsonpCallbackParams } from "../request/types";
import type { AgencyIndexItem, AgencyProjection, JsonpText } from "./models";
export declare class AgenciesService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * 1. List all agencies.
     * Path: /agencies
     * Note: Always augmented with json_url on each agency index item.
     */
    list<K extends AgencyField = AgencyField>(params?: AgencyListParams): Promise<AgencyIndexItem<K>[]>;
    /**
     * 2. Single agency lookup by numeric ID or slug.
     * Path: /agencies/{idOrSlug}
     * Throws FederalRegisterAgencyNotFoundError on 404 { error: 404 }.
     */
    find<K extends AgencyField = AgencyField>(params: AgencyFindParams): Promise<AgencyProjection<K>>;
    /**
     * 3. Multiple agency lookup by comma-separated numeric IDs.
     * Path: /agencies/{ids}
     * Upstream returns plain AgencyProjection<K>[] omitting missing IDs.
     * Does NOT return a MultiLookupEnvelope.
     */
    findMany<K extends AgencyField = AgencyField>(params: AgencyFindManyParams): Promise<AgencyProjection<K>[]>;
    /**
     * 4. Agency suggestions by term.
     * Path: /agencies/suggestions
     * Returns AgencyProjection<K>[].
     */
    suggestions<K extends AgencyField = AgencyField>(params: AgencySuggestionsParams): Promise<AgencyProjection<K>[]>;
    /**
     * List all agencies JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-001).
     */
    listJsonp(params: (AgencyListParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Single agency lookup JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-002).
     */
    findJsonp(params: AgencyFindParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Multiple agency lookup JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-004).
     */
    findManyJsonp(params: AgencyFindManyParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Agency suggestions JSONP format companion (FR-PROTO-003 companion to FR-AGENCY-005).
     */
    suggestionsJsonp(params: AgencySuggestionsParams & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=agencies.d.ts.map