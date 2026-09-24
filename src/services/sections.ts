/**
 * R0-07B / R2-06 Sections Service
 *
 * Implements:
 * 1. fr.sections.list(): Promise<SectionMap>
 *    Path: /sections
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type { JsonpCallbackParams } from "../request/types";
import type { SectionMap, JsonpText } from "./models";

export class SectionsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * List Federal Register sections (FR-SECTION-001).
   * Path: /sections
   */
  async list(): Promise<SectionMap> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<SectionMap>(
      "/sections",
      undefined,
      decodeJsonResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Method ---

  /**
   * List Federal Register sections JSONP format companion (FR-PROTO-003 companion to FR-SECTION-001).
   */
  async listJsonp(params: JsonpCallbackParams): Promise<JsonpText> {
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/sections", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw decodeJsonResponse(decoded);
    });
  }
}
