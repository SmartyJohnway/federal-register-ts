"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeClientRuntime = initializeClientRuntime;
exports.getInternalClientRuntime = getInternalClientRuntime;
const transport_1 = require("../transport");
/**
 * Module-private registry. Each client instance maps to exactly one runtime.
 * WeakMap ensures no memory leaks — when a client is garbage-collected,
 * its runtime is automatically released.
 */
const runtimes = new WeakMap();
/**
 * Initialize the internal runtime for a client instance.
 * Called exactly once from the FederalRegisterClient constructor.
 * The runtime closure captures the config values — subsequent
 * mutation of the options object has no effect.
 *
 * @throws Error if the client already has a registered runtime.
 */
function initializeClientRuntime(client, config) {
    if (runtimes.has(client)) {
        throw new Error("Client runtime already initialized");
    }
    const { baseUrl, fetch: fetchFn } = config;
    const runtime = {
        async execute(path, queryString, decoder) {
            const relPath = path.startsWith("/") ? path : "/" + path;
            let finalUrl = baseUrl + relPath;
            if (queryString && queryString.length > 0) {
                const sep = finalUrl.includes("?") ? "&" : "?";
                finalUrl = finalUrl + sep + queryString;
            }
            const response = await fetchFn(finalUrl);
            const decoded = await (0, transport_1.decodeResponse)(response);
            if (decoder) {
                return decoder(decoded);
            }
            return (0, transport_1.decodeJsonResponse)(decoded);
        },
        async fetchUrl(absoluteUrl, decoder) {
            const response = await fetchFn(absoluteUrl);
            const decoded = await (0, transport_1.decodeResponse)(response);
            if (decoder) {
                return decoder(decoded);
            }
            return (0, transport_1.decodeJsonResponse)(decoded);
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
function getInternalClientRuntime(client) {
    const runtime = runtimes.get(client);
    if (!runtime) {
        throw new Error("Client runtime not initialized — was the client constructed via new FederalRegisterClient()?");
    }
    return runtime;
}
//# sourceMappingURL=runtime.js.map