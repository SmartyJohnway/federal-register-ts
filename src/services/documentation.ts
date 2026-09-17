/**
 * R0-07B / R2-06 Documentation Service
 *
 * Implements:
 * 1. fr.documentation.fetchOpenApi(): Promise<FederalRegisterOpenApiDocument>
 *    Path: /documentation
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import type { FederalRegisterOpenApiDocument } from "./models";

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
}
