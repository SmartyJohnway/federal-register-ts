/**
 * R0-07B / R2-06 Documentation Service
 *
 * Implements:
 * 1. fr.documentation.fetchOpenApi(): Promise<FederalRegisterOpenApiDocument>
 *    Path: /documentation
 */
import type { FederalRegisterClient } from "../core/client";
import type { JsonpCallbackParams } from "../request/types";
import type { FederalRegisterOpenApiDocument, JsonpText } from "./models";
export declare class DocumentationService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Fetch current Federal Register OpenAPI 3.0 document (FR-DOCS-001).
     * Path: /documentation
     */
    fetchOpenApi(): Promise<FederalRegisterOpenApiDocument>;
    /**
     * Fetch current Federal Register OpenAPI 3.0 document as JSONP (FR-DOCS-001 companion).
     * Path: /documentation
     */
    fetchOpenApiJsonp(params: JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=documentation.d.ts.map