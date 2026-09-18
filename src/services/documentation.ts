/**
 * R0-07B / R2-06 Documentation Service
 *
 * Implements:
 * 1. fr.documentation.fetchOpenApi(): Promise<FederalRegisterOpenApiDocument>
 *    Path: /documentation
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import {
  decodeJsonResponse,
  classifyGenericHttpError,
  type DecodedResponse,
} from "../core/transport";
import type { JsonpCallbackParams } from "../request/types";
import { QuerySerializer } from "../request/serializer";
import type { FederalRegisterOpenApiDocument, JsonpText } from "./models";

export class DocumentationService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Fetch current Federal Register OpenAPI 3.0 document (FR-DOCS-001).
   * Path: /documentation
   */
  async fetchOpenApi(): Promise<FederalRegisterOpenApiDocument> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<FederalRegisterOpenApiDocument>(
      "/documentation",
      undefined,
      decodeJsonResponse
    );
  }

  /**
   * Fetch current Federal Register OpenAPI 3.0 document as JSONP (FR-DOCS-001 companion).
   * Path: /documentation
   */
  async fetchOpenApiJsonp(params: JsonpCallbackParams): Promise<JsonpText> {
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(
      "/documentation",
      qs,
      (decoded: DecodedResponse) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifyGenericHttpError(decoded);
      }
    );
  }
}
