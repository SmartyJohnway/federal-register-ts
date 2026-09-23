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

import { initializeClientRuntime } from "./internal/runtime";
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

/**
 * Internal default base URL.
 * Retained internally; not exported publicly.
 */
const DEFAULT_BASE_URL = "https://www.federalregister.gov/api/v1";

import { RequestValidationError } from "../request/validation";

function validateBaseUrl(url: any): string {
  if (url === undefined) {
    return DEFAULT_BASE_URL;
  }
  if (typeof url !== "string") {
    throw new RequestValidationError(
      `baseUrl option must be a valid http or https absolute URL string. Received: ${JSON.stringify(url)}`,
      "baseUrl",
      url
    );
  }
  const trimmed = url.trim();
  if (trimmed === "") {
    throw new RequestValidationError(
      `baseUrl option cannot be empty or whitespace. Received: ${JSON.stringify(url)}`,
      "baseUrl",
      url
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new RequestValidationError(
      `baseUrl option must be a valid absolute URL. Received: ${JSON.stringify(url)}`,
      "baseUrl",
      url
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new RequestValidationError(
      `baseUrl protocol must be http: or https:. Received: ${parsed.protocol}`,
      "baseUrl",
      url
    );
  }
  if (parsed.search !== "" || parsed.hash !== "") {
    throw new RequestValidationError(
      `baseUrl cannot contain query parameters or fragments. Received: ${JSON.stringify(url)}`,
      "baseUrl",
      url
    );
  }
  return trimmed.replace(/\/+$/, "");
}

function validateFetchFn(fetchFn: any): typeof globalThis.fetch {
  if (fetchFn === undefined) {
    return globalThis.fetch;
  }
  if (typeof fetchFn !== "function") {
    throw new RequestValidationError(
      `fetch option must be a function. Received: ${JSON.stringify(fetchFn)}`,
      "fetch",
      fetchFn
    );
  }
  return fetchFn;
}

export class FederalRegisterClient {
  #baseUrl: string;
  #fetch: typeof globalThis.fetch;

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

  constructor(options?: FederalRegisterClientOptions) {
    if (options !== undefined && (typeof options !== "object" || options === null || Array.isArray(options))) {
      throw new RequestValidationError(
        `FederalRegisterClient constructor options must be an object. Received: ${JSON.stringify(options)}`,
        "options",
        options
      );
    }

    const baseUrl = validateBaseUrl(options?.baseUrl);
    const fetchFn = validateFetchFn(options?.fetch);

    this.#baseUrl = baseUrl;
    this.#fetch = fetchFn;

    // Register this instance's transport in the internal runtime bridge.
    // The runtime closure captures baseUrl and fetchFn by value —
    // no process-global mutable state is involved.
    initializeClientRuntime(this, { baseUrl, fetch: fetchFn });

    // Initialize core resource service namespaces bound to this client instance
    this.documents = new DocumentsService(this);
    this.publicInspection = new PublicInspectionService(this);
    this.agencies = new AgenciesService(this);
    this.topics = new TopicsService(this);
    this.sections = new SectionsService(this);
    this.suggestedSearches = new SuggestedSearchesService(this);
    this.holidays = new HolidaysService(this);
    this.effectiveDates = new EffectiveDatesService(this);
    this.issues = new IssuesService(this);
    this.images = new ImagesService(this);
    this.categoryCounts = new CategoryCountsService(this);
    this.siteNotifications = new SiteNotificationsService(this);
    this.documentation = new DocumentationService(this);
    this.clippings = new ClippingsService(this);
  }
}
