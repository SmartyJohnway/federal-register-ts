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
 * Internal symbols for SDK internal operations and navigation.
 * Not exposed on public client type surface.
 */
export const kExecuteInternal = Symbol("kExecuteInternal");
export const kFetchOpaqueUrl = Symbol("kFetchOpaqueUrl");
export const kGetBaseUrl = Symbol("kGetBaseUrl");
export const kGetFetch = Symbol("kGetFetch");

export class FederalRegisterClient {
  private readonly _baseUrl: string;
  private readonly _fetch: typeof globalThis.fetch;

  constructor(options?: FederalRegisterClientOptions) {
    const rawBase = options?.baseUrl || DEFAULT_BASE_URL;
    // Normalize trailing slash
    this._baseUrl = rawBase.endsWith("/")
      ? rawBase.slice(0, -1)
      : rawBase;

    this._fetch = options?.fetch || globalThis.fetch;
  }

  /**
   * Internal-only execution implementation invoked via internal symbol or internal method.
   * Not part of public client typing/autocomplete for package consumers.
   */
  public async [kExecuteInternal]<T = any>(opts: InternalExecuteOptions): Promise<T> {
    let finalUrl: string;

    if (opts.pathOrUrl.startsWith("http://") || opts.pathOrUrl.startsWith("https://")) {
      finalUrl = opts.pathOrUrl;
    } else {
      const relPath = opts.pathOrUrl.startsWith("/")
        ? opts.pathOrUrl
        : `/${opts.pathOrUrl}`;
      finalUrl = `${this._baseUrl}${relPath}`;
    }

    if (opts.queryString && opts.queryString.length > 0) {
      const sep = finalUrl.includes("?") ? "&" : "?";
      finalUrl = `${finalUrl}${sep}${opts.queryString}`;
    }

    const response = await this._fetch(finalUrl);
    const decoded = await decodeResponse(response);

    if (opts.decoder) {
      return opts.decoder(decoded);
    }

    return decodeJsonResponse(decoded);
  }

  /**
   * Internal-only server navigation URL execution invoked via internal symbol.
   */
  public async [kFetchOpaqueUrl]<T = any>(opaqueUrl: string, decoder?: OperationScopedDecoder): Promise<T> {
    if (!opaqueUrl || typeof opaqueUrl !== "string") {
      throw new Error("server navigation URL must be a non-empty string");
    }
    return this[kExecuteInternal]<T>({
      pathOrUrl: opaqueUrl,
      decoder,
    });
  }

  /**
   * Internal-only getters for test/internal validation.
   */
  public [kGetBaseUrl](): string {
    return this._baseUrl;
  }

  public [kGetFetch](): typeof globalThis.fetch {
    return this._fetch;
  }
}

