/**
 * R0-07B / R2-06 Images Service
 *
 * Implements:
 * 1. fr.images.find(params: ImageFindParams): Promise<ImageMetadataMap>
 *    Path: /images/{identifier}
 */
import type { FederalRegisterClient } from "../core/client";
import type { ImageFindParams, JsonpCallbackParams } from "../request/types";
import type { ImageMetadataMap, JsonpText } from "./models";
export declare class ImagesService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Find public image metadata by identifier (FR-IMAGE-001).
     * Path: /images/{identifier}
     * Note: Missing/non-public image returns HTTP 404 with {}, which throws FederalRegisterEmptyJsonError.
     */
    find(params: ImageFindParams): Promise<ImageMetadataMap>;
    /**
     * Find public image metadata JSONP format companion (FR-PROTO-003 companion to FR-IMAGE-001).
     */
    findJsonp(params: ImageFindParams & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=images.d.ts.map