/**
 * R0-07B / R2-06 Holidays Service
 *
 * Implements:
 * 1. fr.holidays.list(): Promise<HolidayMap>
 *    Path: /holidays
 */
import type { FederalRegisterClient } from "../core/client";
import type { JsonpCallbackParams } from "../request/types";
import type { HolidayMap, JsonpText } from "./models";
export declare class HolidaysService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * List Federal Register holidays (FR-HOLIDAY-001).
     * Path: /holidays
     */
    list(): Promise<HolidayMap>;
    /**
     * List Federal Register holidays JSONP format companion (FR-PROTO-003 companion to FR-HOLIDAY-001).
     */
    listJsonp(params: JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=holidays.d.ts.map