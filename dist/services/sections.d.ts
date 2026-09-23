/**
 * R0-07B / R2-06 Sections Service
 *
 * Implements:
 * 1. fr.sections.list(): Promise<SectionMap>
 *    Path: /sections
 */
import type { FederalRegisterClient } from "../core/client";
import type { JsonpCallbackParams } from "../request/types";
import type { SectionMap, JsonpText } from "./models";
export declare class SectionsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * List Federal Register sections (FR-SECTION-001).
     * Path: /sections
     */
    list(): Promise<SectionMap>;
    /**
     * List Federal Register sections JSONP format companion (FR-PROTO-003 companion to FR-SECTION-001).
     */
    listJsonp(params: JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=sections.d.ts.map