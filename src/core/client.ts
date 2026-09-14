/**
 * R0-07A / R2-03 Canonical FederalRegisterClient
 *
 * Implements the frozen Client contract defined in:
 * - R0-07A_Canonical_SDK_Architecture_and_Naming_Policy_2026-09-12.md
 * - R0-07B_Operation_Namespace_and_Export_Surface_2026-09-12.md
 * - R2-03 Public Client Configuration Contract Clarification v1.0
 */

import {
  decodeResponse,
  decodeJsonResponse,
  DecodedResponse,
  OperationScopedDecoder,
} from "./transport";

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

/**
 * Internal request execution options passed by namespaces or navigation.
 * Internal to the SDK; not part of public package-root export.
 */
export interface InternalExecuteOptions {
  readonly pathOrUrl: string;
  readonly queryString?: string;
  readonly decoder?: OperationScopedDecoder;
}

/**
 * Internal weak map associating client instance with internal transport configuration.
 * Genuinely private to this module; zero consumer-reachable prototype or symbol escape.
 */
const clientTransportState = new WeakMap<
  FederalRegisterClient,
  {
    baseUrl: string;
    fetch: typeof globalThis.fetch;
  }
>();

export class FederalRegisterClient {
  #baseUrl: string;
  #fetch: typeof globalThis.fetch;

  constructor(options?: FederalRegisterClientOptions) {
    const rawBase = options?.baseUrl || DEFAULT_BASE_URL;
    // Normalize trailing slash
    const baseUrl = rawBase.endsWith("/")
      ? rawBase.slice(0, -1)
      : rawBase;

    const fetch = options?.fetch || globalThis.fetch;

    this.#baseUrl = baseUrl;
    this.#fetch = fetch;

    clientTransportState.set(this, {
      baseUrl,
      fetch,
    });
  }
}

/**
 * Internal execution implementation invoked by SDK internal namespaces and navigation.
 * Functions as module-internal helper; not exposed on public client prototype.
 */
export async function executeInternal<T = any>(
  client: FederalRegisterClient,
  opts: InternalExecuteOptions
): Promise<T> {
  const state = clientTransportState.get(client);
  if (!state) {
    throw new Error("Invalid FederalRegisterClient instance");
  }

  let finalUrl: string;

  if (opts.pathOrUrl.startsWith("http://") || opts.pathOrUrl.startsWith("https://")) {
    finalUrl = opts.pathOrUrl;
  } else {
    const relPath = opts.pathOrUrl.startsWith("/")
      ? opts.pathOrUrl
      : "/" + opts.pathOrUrl;
    finalUrl = state.baseUrl + relPath;
  }

  if (opts.queryString && opts.queryString.length > 0) {
    const sep = finalUrl.includes("?") ? "&" : "?";
    finalUrl = finalUrl + sep + opts.queryString;
  }

  const response = await state.fetch(finalUrl);
  const decoded = await decodeResponse(response);

  if (opts.decoder) {
    return opts.decoder(decoded);
  }

  return decodeJsonResponse(decoded);
}

/**
 * Internal-only server navigation URL execution helper.
 */
export async function fetchOpaqueUrl<T = any>(
  client: FederalRegisterClient,
  opaqueUrl: string, 
  decoder?: OperationScopedDecoder
): Promise<T> {
  if (!opaqueUrl || typeof opaqueUrl !== "string") {
    throw new Error("server navigation URL must be a non-empty string");
  }
  return executeInternal<T>(client, {
    pathOrUrl: opaqueUrl,
    decoder,
  });
}

/**
 * Internal-only getters for test/internal validation.
 */
export function getClientBaseUrl(client: FederalRegisterClient): string {
  const state = clientTransportState.get(client);
  if (!state) {
    throw new Error("Invalid FederalRegisterClient instance");
  }
  return state.baseUrl;
}

export function getClientFetch(client: FederalRegisterClient): typeof globalThis.fetch {
  const state = clientTransportState.get(client);
  if (!state) {
    throw new Error("Invalid FederalRegisterClient instance");
  }
  return state.fetch;
}
