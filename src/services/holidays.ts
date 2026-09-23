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
import { QuerySerializer } from "../request/serializer";
import type { JsonpCallbackParams } from "../request/types";
import type { HolidayMap, JsonpText } from "./models";

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

  // --- FR-PROTO-003 JSONP Sibling Method ---

  /**
   * List Federal Register holidays JSONP format companion (FR-PROTO-003 companion to FR-HOLIDAY-001).
   */
  async listJsonp(params: JsonpCallbackParams): Promise<JsonpText> {
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/holidays", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw decodeJsonResponse(decoded);
    });
  }
}
