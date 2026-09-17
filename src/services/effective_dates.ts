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
  classifyEffectiveDateHttpError,
  type DecodedResponse,
} from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type { EffectiveDatesParams } from "../request/types";
import type { EffectiveDateMap } from "./models";

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
      (decoded: DecodedResponse) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.parsedJson;
        }
        throw classifyEffectiveDateHttpError(decoded);
      }
    );
  }
}
