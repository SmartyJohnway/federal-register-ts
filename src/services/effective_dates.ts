/**
 * R0-07B / R2-06 Effective Dates Service
 *
 * Implements:
 * 1. fr.effectiveDates.calculate(params: EffectiveDatesParams): Promise<EffectiveDateMap>
 *    Path: /effective-dates?start_date=...&end_date=...
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import {
  decodeJsonResponse,
  classifyEffectiveDateHttpError,
  type DecodedResponse,
} from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type { EffectiveDatesParams, JsonpCallbackParams } from "../request/types";
import type { EffectiveDateMap, JsonpText } from "./models";

function decodeEffectiveDatesResponse(decoded: DecodedResponse): EffectiveDateMap {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decodeJsonResponse(decoded);
  }
  throw classifyEffectiveDateHttpError(decoded);
}

export class EffectiveDatesService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Calculate effective-date calendar (FR-EFFDATE-001).
   * Path: /effective-dates?start_date=...&end_date=...
   */
  async calculate(params: EffectiveDatesParams): Promise<EffectiveDateMap> {
    const entries = QuerySerializer.serializeEffectiveDatesParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<EffectiveDateMap>(
      "/effective-dates",
      qs,
      decodeEffectiveDatesResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Method ---

  /**
   * Calculate effective-date calendar JSONP format companion (FR-PROTO-003 companion to FR-EFFDATE-001).
   */
  async calculateJsonp(
    params: EffectiveDatesParams & JsonpCallbackParams
  ): Promise<JsonpText> {
    const entries = QuerySerializer.serializeEffectiveDatesParams(params);
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(
      "/effective-dates",
      qs,
      (decoded: DecodedResponse) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifyEffectiveDateHttpError(decoded);
      }
    );
  }
}

