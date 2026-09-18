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
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import type { WebClippingsResponse } from "./models";

export class ClippingsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Get current clippings and folders (FR-WEB-001).
   * Path: /clippings
   */
  async current(): Promise<WebClippingsResponse> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<WebClippingsResponse>(
      "/clippings",
      undefined,
      decodeJsonResponse
    );
  }
}
