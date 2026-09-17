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
import type { SectionMap } from "./models";

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
}
