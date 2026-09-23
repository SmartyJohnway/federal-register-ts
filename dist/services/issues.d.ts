/**
 * R0-07B / R2-06 Issues Service
 *
 * Implements:
 * 1. fr.issues.find(params: IssueFindParams): Promise<IssueToc>
 *    Path: /issues/{YYYY-MM-DD}.json
 * 2. fr.issues.current(): Promise<IssueToc>
 *    Path: /issues/current.json
 */
import type { FederalRegisterClient } from "../core/client";
import type { IssueFindParams, JsonpCallbackParams } from "../request/types";
import type { IssueToc, JsonpText } from "./models";
export declare class IssuesService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Find issue table of contents by publication date (FR-ISSUE-001).
     * Path: /issues/{YYYY-MM-DD}.json
     */
    find(params: IssueFindParams): Promise<IssueToc>;
    /**
     * Get current issue table of contents (FR-ISSUE-002).
     * Path: /issues/current.json
     */
    current(): Promise<IssueToc>;
    /**
     * Find issue TOC JSONP format companion (FR-PROTO-003 companion to FR-ISSUE-001).
     */
    findJsonp(params: IssueFindParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Current issue TOC JSONP format companion (FR-PROTO-003 companion to FR-ISSUE-002).
     */
    currentJsonp(params: JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=issues.d.ts.map