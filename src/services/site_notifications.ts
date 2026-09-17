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
  classifyGenericHttpError,
  type DecodedResponse,
} from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type { SiteNotificationFindParams } from "../request/types";
import type {
  ActiveSiteNotification,
  InactiveSiteNotification,
} from "./models";

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
      (decoded: DecodedResponse) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          if (
            decoded.bodyKind === "json" &&
            decoded.parsedJson &&
            typeof decoded.parsedJson === "object"
          ) {
            if (Object.keys(decoded.parsedJson).length === 0) {
              return decoded.parsedJson as InactiveSiteNotification;
            }
            return decoded.parsedJson as ActiveSiteNotification;
          }
          return decoded.parsedJson;
        }
        throw classifyGenericHttpError(decoded);
      }
    );
  }
}
