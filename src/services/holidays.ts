/**
 * R0-07B / R2-06 Holidays Service
 *
 * Implements:
 * 1. fr.holidays.list(): Promise<HolidayMap>
 *    Path: /holidays
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import type { HolidayMap } from "./models";

export class HolidaysService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * List Federal Register holidays (FR-HOLIDAY-001).
   * Path: /holidays
   */
  async list(): Promise<HolidayMap> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<HolidayMap>(
      "/holidays",
      undefined,
      decodeJsonResponse
    );
  }
}
