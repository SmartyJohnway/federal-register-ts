/**
 * R0-07B / R2-06 Site Notifications Service
 *
 * Implements:
 * 1. fr.siteNotifications.find(params: SiteNotificationFindParams): Promise<ActiveSiteNotification | InactiveSiteNotification>
 *    Path: /site_notifications/{id}
 *
 * Tri-state response contract:
 * - Active: HTTP 200 + typed object -> ActiveSiteNotification
 * - Inactive: HTTP 200 + {} -> InactiveSiteNotification
 * - Missing: HTTP 404 + empty body -> throws FederalRegisterEmptyBodyError
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import {
  decodeJsonResponse,
  classifyGenericHttpError,
  type DecodedResponse,
} from "../core/transport";
import { FederalRegisterHttpError } from "../core/errors";
import { QuerySerializer } from "../request/serializer";
import type { SiteNotificationFindParams, JsonpCallbackParams } from "../request/types";
import type {
  ActiveSiteNotification,
  InactiveSiteNotification,
  JsonpText,
} from "./models";

function decodeSiteNotificationResponse(
  decoded: DecodedResponse
): ActiveSiteNotification | InactiveSiteNotification {
  if (decoded.status >= 200 && decoded.status < 300) {
    const parsed = decodeJsonResponse(decoded);
    if (Array.isArray(parsed)) {
      throw new FederalRegisterHttpError(
        `HTTP ${decoded.status} returned non-object JSON root: ${JSON.stringify(parsed)}`,
        decoded.status,
        decoded.contentType,
        decoded.bodyKind,
        parsed,
        decoded.rawText
      );
    }
    if (Object.keys(parsed).length === 0) {
      return parsed as InactiveSiteNotification;
    }
    return parsed as ActiveSiteNotification;
  }
  throw classifyGenericHttpError(decoded);
}

export class SiteNotificationsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Site notification lookup by identifier (FR-SITENOTIF-001).
   * Path: /site_notifications/{id}
   */
  async find(
    params: SiteNotificationFindParams
  ): Promise<ActiveSiteNotification | InactiveSiteNotification> {
    const identifier = QuerySerializer.serializeSiteNotificationFind(params);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<ActiveSiteNotification | InactiveSiteNotification>(
      `/site_notifications/${encodeURIComponent(identifier)}`,
      undefined,
      decodeSiteNotificationResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Method ---

  /**
   * Site notification lookup JSONP format companion (FR-PROTO-003 companion to FR-SITENOTIF-001).
   */
  async findJsonp(
    params: SiteNotificationFindParams & JsonpCallbackParams
  ): Promise<JsonpText> {
    const identifier = QuerySerializer.serializeSiteNotificationFind(params);
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(
      `/site_notifications/${encodeURIComponent(identifier)}`,
      qs,
      (decoded: DecodedResponse) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifyGenericHttpError(decoded);
      }
    );
  }
}

