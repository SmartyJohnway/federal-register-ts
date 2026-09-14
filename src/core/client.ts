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
  decodeTextResponse,
  DecodedResponse,
  OperationScopedDecoder,
} from "./transport";
export { DecodedResponse, OperationScopedDecoder } from "./transport";

/**
 * Exact frozen public client configuration interface.
 * R2-03 clarification: exactly baseUrl and fetch spellings.
 */
export interface FederalRegisterClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
}

/**
 * Internal request execution options passed by namespaces or navigation.
 * Never exposed as an arbitrary public get/request method.
 */
export interface InternalExecuteOptions {
  readonly pathOrUrl: string;
  readonly queryString?: string;
  readonly decoder?: OperationScopedDecoder;
}

export class FederalRegisterClient {
  public static readonly DEFAULT_BASE_URL = "https://www.federalregister.gov/api/v1";

  private readonly _baseUrl: string;
  private readonly _fetch: typeof globalThis.fetch;


  constructor(options?: FederalRegisterClientOptions) {
    const rawBase = options?.baseUrl || FederalRegisterClient.DEFAULT_BASE_URL;
    // Normalize trailing slash
    this._baseUrl = rawBase.endsWith("/")
      ? rawBase.slice(0, -1)
      : rawBase;

    this._fetch = options?.fetch || globalThis.fetch;
  }

  public get baseUrl(): string {
    return this._baseUrl;
  }

  /**
   * Internal request execution boundary.
   * Establishes resolved URL, executes via instance-scoped fetch, decodes response,
   * and applies operation-scoped or default JSON decoder.
   */
  public async executeInternal<T=any>(opts: InternalExecuteOptions): Promise<T> {
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
   * Rawpath helper for navigation opaque server URLs.
   * Ensures that opaque next_page_url / previous_page_url are executed safely
   * through the originating client's instance-scoped fetch without query reconstruction.
   */
  public async fetchOpaqueUrl<T=any>(opaqueUrl: string, decoder?: OperationScopedDecoder): Promise<T> {
    if (!opaqueUrl || typeof opaqueUrl !== "string") {
      throw new Error("server navigation URL must be a non-empty string");
    }
    return this.executeInternal<T>({
      pathOrUrl: opaqueUrl,
      decoder,
    });
  }
}
