/**
 * R2-03 Internal Client Runtime Bridge
 *
 * Module-private WeakMap registry that binds each FederalRegisterClient instance
 * to its own isolated runtime (baseUrl + fetch). This module is an internal
 * implementation detail — it is NOT re-exported from any canonical public barrel
 * (src/index.ts, src/core/index.ts, or package root).
 *
 * Repository-internal modules and repository tests may access it through
 * relative imports. It is not part of the canonical public API contract.
 *
 * Frozen architecture reference:
 * - R2-03_Internal_Transport_Architecture_Contract_Adjudication_Clarification_v1.0
 * - R0-07A_Canonical_SDK_Architecture_and_Naming_Policy_2026-09-12.md
 * - R0-07D_Response_Error_Format_Navigation_Contract_2026-09-12.md
 */

import type { FederalRegisterClient } from "../client";
import {
  decodeResponse,
  decodeJsonResponse,
  type OperationScopedDecoder,
} from "../transport";

/**
 * Internal runtime bound to a single FederalRegisterClient instance.
 * Each runtime captures the originating client's baseUrl and fetch;
 * no process-global mutable state is involved.
 */
export interface InternalClientRuntime {
  /**
   * Execute a request using the originating client's baseUrl and fetch.
   * Performs normal transport/decode/error classification.
   */
  execute<T = any>(
    path: string,
    queryString?: string,
    decoder?: OperationScopedDecoder
  ): Promise<T>;

  /**
   * Execute an opaque absolute URL (e.g. server-provided next_page_url)
   * using the originating client's fetch. The URL is passed through
   * without parsing or reconstruction.
   */
  fetchUrl<T = any>(
    absoluteUrl: string,
    decoder?: OperationScopedDecoder
  ): Promise<T>;
}

/**
 * Module-private registry. Each client instance maps to exactly one runtime.
 * WeakMap ensures no memory leaks — when a client is garbage-collected,
 * its runtime is automatically released.
 */
const runtimes = new WeakMap<FederalRegisterClient, InternalClientRuntime>();

/**
 * Configuration snapshot captured at client construction time.
 */
interface ClientRuntimeConfig {
  readonly baseUrl: string;
  readonly fetch: typeof globalThis.fetch;
}

/**
 * Initialize the internal runtime for a client instance.
 * Called exactly once from the FederalRegisterClient constructor.
 * The runtime closure captures the config values — subsequent
 * mutation of the options object has no effect.
 *
 * @throws Error if the client already has a registered runtime.
 */
export function initializeClientRuntime(
  client: FederalRegisterClient,
  config: ClientRuntimeConfig
): void {
  if (runtimes.has(client)) {
    throw new Error("Client runtime already initialized");
  }

  const { baseUrl, fetch: fetchFn } = config;

  const runtime: InternalClientRuntime = {
    async execute<T = any>(
      path: string,
      queryString?: string,
      decoder?: OperationScopedDecoder
    ): Promise<T> {
      const relPath = path.startsWith("/") ? path : "/" + path;
      let finalUrl = baseUrl + relPath;
      if (queryString && queryString.length > 0) {
        const sep = finalUrl.includes("?") ? "&" : "?";
        finalUrl = finalUrl + sep + queryString;
      }
      const response = await fetchFn(finalUrl);
      const decoded = await decodeResponse(response);
      if (decoder) {
        return decoder(decoded);
      }
      return decodeJsonResponse(decoded);
    },

    async fetchUrl<T = any>(
      absoluteUrl: string,
      decoder?: OperationScopedDecoder
    ): Promise<T> {
      const response = await fetchFn(absoluteUrl);
      const decoded = await decodeResponse(response);
      if (decoder) {
        return decoder(decoded);
      }
      return decodeJsonResponse(decoded);
    },
  };

  runtimes.set(client, runtime);
}

/**
 * Retrieve the internal runtime for a client instance.
 * Used by SDK operation modules and repository tests to execute
 * requests through the originating client's transport.
 *
 * @throws Error if the client does not have a registered runtime.
 */
export function getInternalClientRuntime(
  client: FederalRegisterClient
): InternalClientRuntime {
  const runtime = runtimes.get(client);
  if (!runtime) {
    throw new Error(
      "Client runtime not initialized — was the client constructed via new FederalRegisterClient()?"
    );
  }
  return runtime;
}
