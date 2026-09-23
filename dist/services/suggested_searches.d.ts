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
import type { SuggestedSearchSectionsParams, SuggestedSearchFindParams, JsonpCallbackParams } from "../request/types";
import type { SuggestedSearchIndexMap, SuggestedSearchDetail, JsonpText } from "./models";
export declare class SuggestedSearchesService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * List suggested searches grouped by section (FR-SUGGEST-001).
     * Path: /suggested_searches
     */
    list(): Promise<SuggestedSearchIndexMap>;
    /**
     * Filter suggested searches by sections (FR-SUGGEST-002).
     * Path: /suggested_searches?conditions[sections][]=...
     */
    listBySections(params: SuggestedSearchSectionsParams): Promise<SuggestedSearchIndexMap>;
    /**
     * Find suggested search by slug (FR-SUGGEST-003).
     * Path: /suggested_searches/{slug}
     */
    find(params: SuggestedSearchFindParams): Promise<SuggestedSearchDetail>;
    /**
     * List suggested searches JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-001).
     */
    listJsonp(params: JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Filter suggested searches by sections JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-002).
     */
    listBySectionsJsonp(params: SuggestedSearchSectionsParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Find suggested search by slug JSONP format companion (FR-PROTO-003 companion to FR-SUGGEST-003).
     */
    findJsonp(params: SuggestedSearchFindParams & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=suggested_searches.d.ts.map