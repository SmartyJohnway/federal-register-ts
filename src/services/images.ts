/**
 * R0-07B / R2-06 Images Service
 *
 * Implements:
 * 1. fr.images.find(params: ImageFindParams): Promise<ImageMetadataMap>
 *    Path: /images/{identifier}
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type { ImageFindParams, JsonpCallbackParams } from "../request/types";
import type { ImageMetadataMap, JsonpText } from "./models";

export class ImagesService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Find public image metadata by identifier (FR-IMAGE-001).
   * Path: /images/{identifier}
   * Note: Missing/non-public image returns HTTP 404 with {}, which throws FederalRegisterEmptyJsonError.
   */
  async find(params: ImageFindParams): Promise<ImageMetadataMap> {
    const identifier = QuerySerializer.serializeImageFind(params);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<ImageMetadataMap>(
      `/images/${encodeURIComponent(identifier)}`,
      undefined,
      decodeJsonResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Method ---

  /**
   * Find public image metadata JSONP format companion (FR-PROTO-003 companion to FR-IMAGE-001).
   */
  async findJsonp(params: ImageFindParams & JsonpCallbackParams): Promise<JsonpText> {
    const identifier = QuerySerializer.serializeImageFind(params);
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(
      `/images/${encodeURIComponent(identifier)}`,
      qs,
      (decoded) => {
        if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
        throw decodeJsonResponse(decoded);
      }
    );
  }
}

