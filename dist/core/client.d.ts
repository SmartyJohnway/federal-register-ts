/**
 * R0-07A / R2-03 / R2-04 Canonical FederalRegisterClient
 *
 * Implements the frozen Client contract defined in:
 * - R0-07A_Canonical_SDK_Architecture_and_Naming_Policy_2026-09-12.md
 * - R0-07B_Operation_Namespace_and_Export_Surface_2026-09-12.md
 * - R2-03 Public Client Configuration Contract Clarification v1.0
 * - R2-03_Internal_Transport_Architecture_Contract_Adjudication_Clarification_v1.0
 * - R2-04 Core Resource Families Authorization & Execution Contract
 */
import { DocumentsService } from "../services/documents";
import { PublicInspectionService } from "../services/public_inspection";
import { AgenciesService } from "../services/agencies";
import { TopicsService } from "../services/topics";
import { SectionsService } from "../services/sections";
import { SuggestedSearchesService } from "../services/suggested_searches";
import { HolidaysService } from "../services/holidays";
import { EffectiveDatesService } from "../services/effective_dates";
import { IssuesService } from "../services/issues";
import { ImagesService } from "../services/images";
import { CategoryCountsService } from "../services/category_counts";
import { SiteNotificationsService } from "../services/site_notifications";
import { DocumentationService } from "../services/documentation";
import { ClippingsService } from "../services/clippings";
/**
 * Exact frozen public client configuration interface.
 * R2-03 clarification: exactly baseUrl and fetch spellings.
 */
export interface FederalRegisterClientOptions {
    readonly baseUrl?: string;
    readonly fetch?: typeof globalThis.fetch;
}
export declare class FederalRegisterClient {
    #private;
    /**
     * Core Document operations service namespace (R0-07B / R2-04 / R2-06).
     */
    readonly documents: DocumentsService;
    /**
     * Core Public Inspection operations service namespace (R0-07B / R2-04 / R2-06).
     */
    readonly publicInspection: PublicInspectionService;
    /**
     * Core Agency operations service namespace (R0-07B / R2-04).
     */
    readonly agencies: AgenciesService;
    /**
     * Topics operations service namespace (R0-07B / R2-06).
     */
    readonly topics: TopicsService;
    /**
     * Sections operations service namespace (R0-07B / R2-06).
     */
    readonly sections: SectionsService;
    /**
     * Suggested Searches operations service namespace (R0-07B / R2-06).
     */
    readonly suggestedSearches: SuggestedSearchesService;
    /**
     * Holidays operations service namespace (R0-07B / R2-06).
     */
    readonly holidays: HolidaysService;
    /**
     * Effective Dates operations service namespace (R0-07B / R2-06).
     */
    readonly effectiveDates: EffectiveDatesService;
    /**
     * Issues operations service namespace (R0-07B / R2-06).
     */
    readonly issues: IssuesService;
    /**
     * Images operations service namespace (R0-07B / R2-06).
     */
    readonly images: ImagesService;
    /**
     * Category Counts operations service namespace (R0-07B / R2-06).
     */
    readonly categoryCounts: CategoryCountsService;
    /**
     * Site Notifications operations service namespace (R0-07B / R2-06).
     */
    readonly siteNotifications: SiteNotificationsService;
    /**
     * Documentation operations service namespace (R0-07B / R2-06).
     */
    readonly documentation: DocumentationService;
    /**
     * Web Clippings operations service namespace (R0-07B / R2-06).
     */
    readonly clippings: ClippingsService;
    constructor(options?: FederalRegisterClientOptions);
}
//# sourceMappingURL=client.d.ts.map