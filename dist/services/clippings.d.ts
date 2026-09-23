/**
 * R0-07B / R2-06 Clippings Service
 *
 * Implements:
 * 1. fr.clippings.current(): Promise<WebClippingsResponse>
 *    Path: /clippings
 *
 * Notes:
 * Anonymous state frozen; authenticated state is AUTH_DEFERRED per R0-02F.
 */
import type { FederalRegisterClient } from "../core/client";
import type { WebClippingsResponse } from "./models";
export declare class ClippingsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Get current clippings and folders (FR-WEB-001).
     * Path: /clippings
     */
    current(): Promise<WebClippingsResponse>;
}
//# sourceMappingURL=clippings.d.ts.map