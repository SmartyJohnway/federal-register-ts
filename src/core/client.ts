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

export class FederalRegisterClient {
  #baseUrl: string;
  #fetch: typeof globalThis.fetch;

  /**
   * Core Document operations service namespace (R0-07B / R2-04).
   */
  readonly documents: DocumentsService;

  /**
   * Core Public Inspection operations service namespace (R0-07B / R2-04).
   */
  readonly publicInspection: PublicInspectionService;

  /**
   * Core Agency operations service namespace (R0-07B / R2-04).
   */
  readonly agencies: AgenciesService;

  constructor(options?: FederalRegisterClientOptions) {
    const rawBase = options?.baseUrl || DEFAULT_BASE_URL;
    // Normalize trailing slash
    const baseUrl = rawBase.endsWith("/")
      ? rawBase.slice(0, -1)
      : rawBase;

    const fetchFn = options?.fetch || globalThis.fetch;

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
  }
}
