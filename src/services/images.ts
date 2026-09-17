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
import type { ImageFindParams } from "../request/types";
import type { ImageMetadataMap } from "./models";

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
}
