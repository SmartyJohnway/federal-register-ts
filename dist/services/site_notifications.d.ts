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
import type { SiteNotificationFindParams, JsonpCallbackParams } from "../request/types";
import type { ActiveSiteNotification, InactiveSiteNotification, JsonpText } from "./models";
export declare class SiteNotificationsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Site notification lookup by identifier (FR-SITENOTIF-001).
     * Path: /site_notifications/{id}
     */
    find(params: SiteNotificationFindParams): Promise<ActiveSiteNotification | InactiveSiteNotification>;
    /**
     * Site notification lookup JSONP format companion (FR-PROTO-003 companion to FR-SITENOTIF-001).
     */
    findJsonp(params: SiteNotificationFindParams & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=site_notifications.d.ts.map