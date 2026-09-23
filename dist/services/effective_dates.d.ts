/**
 * R0-07B / R2-06 Effective Dates Service
 *
 * Implements:
 * 1. fr.effectiveDates.calculate(params: EffectiveDatesParams): Promise<EffectiveDateMap>
 *    Path: /effective-dates?start_date=...&end_date=...
 */
import type { FederalRegisterClient } from "../core/client";
import type { EffectiveDatesParams, JsonpCallbackParams } from "../request/types";
import type { EffectiveDateMap, JsonpText } from "./models";
export declare class EffectiveDatesService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Calculate effective-date calendar (FR-EFFDATE-001).
     * Path: /effective-dates?start_date=...&end_date=...
     */
    calculate(params: EffectiveDatesParams): Promise<EffectiveDateMap>;
    /**
     * Calculate effective-date calendar JSONP format companion (FR-PROTO-003 companion to FR-EFFDATE-001).
     */
    calculateJsonp(params: EffectiveDatesParams & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=effective_dates.d.ts.map