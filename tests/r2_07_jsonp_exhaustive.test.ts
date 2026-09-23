/**
 * R2-07 JSONP Exhaustive 44/44 Companion Method Closure Test
 *
 * Authoritative source: Frozen R2-07 Canonical Surface
 *   53 canonical operations − 9 JSONP exclusions = 44 JSONP companion methods
 *
 * Exclusions (FR-PROTO-003): CSV, RSS, and clippings.current
 *   fr.documents.findCsv, fr.documents.searchCsv, fr.documents.searchRss,
 *   fr.publicInspection.currentCsv, fr.publicInspection.searchCsv,
 *   fr.publicInspection.searchRss, fr.categoryCounts.documentTypeCsv,
 *   fr.categoryCounts.pageCountCsv, fr.clippings.current
 *
 * Test matrix per method:
 *   1. fn()         → RequestValidationError, fetch=0
 *   2. fn(undefined) → RequestValidationError, fetch=0
 *   3. fn(null)      → RequestValidationError, fetch=0
 *   4. fn({})        → RequestValidationError, fetch=0
 *   5. fn(validParams) → fetch=1, result defined
 */

import { FederalRegisterClient } from "../src/core/client";
import { RequestValidationError } from "../src/request/validation";

// ---------------------------------------------------------------------------
// 44 JSONP companion methods with their dot-path from client root and the
// minimal valid params object each method requires for a successful call.
// ---------------------------------------------------------------------------
interface JsonpMethodSpec {
  /** Dot-separated path from the client instance, e.g. "agencies.listJsonp" */
  path: string;
  /** Minimal valid params for a successful call (always includes callback) */
  validParams: Record<string, unknown>;
}

const JSONP_44: JsonpMethodSpec[] = [
  // ── Agencies (4) ──────────────────────────────────────────────────────
  { path: "agencies.listJsonp",        validParams: { callback: "cb" } },
  { path: "agencies.findJsonp",        validParams: { callback: "cb", idOrSlug: "epa" } },
  { path: "agencies.findManyJsonp",    validParams: { callback: "cb", ids: [1, 2] } },
  { path: "agencies.suggestionsJsonp", validParams: { callback: "cb", term: "env" } },

  // ── Documents (7, excl. findCsv/searchCsv/searchRss) ─────────────────
  { path: "documents.searchJsonp",            validParams: { callback: "cb" } },
  { path: "documents.findJsonp",              validParams: { callback: "cb", documentNumber: "2024-00001" } },
  { path: "documents.findManyJsonp",          validParams: { callback: "cb", documentNumbers: ["2024-00001"] } },
  { path: "documents.findByCitationJsonp",    validParams: { callback: "cb", citation: { volume: 89, page: 1 } } },
  { path: "documents.findManyByCitationJsonp", validParams: { callback: "cb", citations: [{ volume: 89, page: 1 }] } },
  { path: "documents.autocompleteJsonp",      validParams: { callback: "cb", term: "climate" } },
  { path: "documents.searchDetailsJsonp",     validParams: { callback: "cb" } },

  // ── Document Facets (10) ──────────────────────────────────────────────
  { path: "documents.facets.agencyJsonp",     validParams: { callback: "cb" } },
  { path: "documents.facets.topicJsonp",      validParams: { callback: "cb" } },
  { path: "documents.facets.sectionJsonp",    validParams: { callback: "cb" } },
  { path: "documents.facets.typeJsonp",       validParams: { callback: "cb" } },
  { path: "documents.facets.subtypeJsonp",    validParams: { callback: "cb" } },
  { path: "documents.facets.dailyJsonp",      validParams: { callback: "cb" } },
  { path: "documents.facets.weeklyJsonp",     validParams: { callback: "cb" } },
  { path: "documents.facets.monthlyJsonp",    validParams: { callback: "cb" } },
  { path: "documents.facets.quarterlyJsonp",  validParams: { callback: "cb" } },
  { path: "documents.facets.yearlyJsonp",     validParams: { callback: "cb" } },

  // ── Public Inspection (6, excl. currentCsv/searchCsv/searchRss) ──────
  { path: "publicInspection.searchJsonp",        validParams: { callback: "cb" } },
  { path: "publicInspection.availableOnJsonp",   validParams: { callback: "cb", availableOn: "2026-01-15" } },
  { path: "publicInspection.currentJsonp",       validParams: { callback: "cb" } },
  { path: "publicInspection.findJsonp",          validParams: { callback: "cb", documentNumber: "2024-00001" } },
  { path: "publicInspection.findManyJsonp",      validParams: { callback: "cb", documentNumbers: ["2024-00001"] } },
  { path: "publicInspection.searchDetailsJsonp", validParams: { callback: "cb" } },

  // ── PI Facets (3) ─────────────────────────────────────────────────────
  { path: "publicInspection.facets.typeJsonp",      validParams: { callback: "cb" } },
  { path: "publicInspection.facets.agencyJsonp",    validParams: { callback: "cb" } },
  { path: "publicInspection.facets.agenciesJsonp",  validParams: { callback: "cb" } },

  // ── PI Issue Facets (2) ───────────────────────────────────────────────
  { path: "publicInspection.issues.facets.dailyJsonp", validParams: { callback: "cb", publicationDate: { gte: "2026-01-01" } } },
  { path: "publicInspection.issues.facets.typeJsonp",  validParams: { callback: "cb", publicationDate: { is: "2026-01-15" } } },

  // ── Topics (1) ────────────────────────────────────────────────────────
  { path: "topics.suggestionsJsonp", validParams: { callback: "cb", term: "air" } },

  // ── Sections (1) ──────────────────────────────────────────────────────
  { path: "sections.listJsonp", validParams: { callback: "cb" } },

  // ── Suggested Searches (3) ────────────────────────────────────────────
  { path: "suggestedSearches.listJsonp",           validParams: { callback: "cb" } },
  { path: "suggestedSearches.listBySectionsJsonp", validParams: { callback: "cb", sections: ["money"] } },
  { path: "suggestedSearches.findJsonp",           validParams: { callback: "cb", slug: "a-slug" } },

  // ── Holidays (1) ──────────────────────────────────────────────────────
  { path: "holidays.listJsonp", validParams: { callback: "cb" } },

  // ── Effective Dates (1) ───────────────────────────────────────────────
  { path: "effectiveDates.calculateJsonp", validParams: { callback: "cb", startDate: "2026-01-01", endDate: "2026-02-01" } },

  // ── Issues (2) ────────────────────────────────────────────────────────
  { path: "issues.findJsonp",    validParams: { callback: "cb", publicationDate: "2026-01-15" } },
  { path: "issues.currentJsonp", validParams: { callback: "cb" } },

  // ── Images (1) ────────────────────────────────────────────────────────
  { path: "images.findJsonp", validParams: { callback: "cb", identifier: "img-001" } },

  // ── Site Notifications (1) ────────────────────────────────────────────
  { path: "siteNotifications.findJsonp", validParams: { callback: "cb", identifier: "banner" } },

  // ── Documentation (1) ─────────────────────────────────────────────────
  { path: "documentation.fetchOpenApiJsonp", validParams: { callback: "cb" } },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the canonical URL string from whatever the fetch mock receives.
 * Handles string, URL, and Request inputs per requirement §2.
 */
function extractUrlString(input: unknown): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  if (input instanceof Request) return input.url;
  return String(input);
}

/**
 * Resolve a dot-path like "documents.facets.agencyJsonp" to the bound method on `client`.
 */
function resolveMethod(client: FederalRegisterClient, dotPath: string): (...args: any[]) => Promise<any> {
  const segments = dotPath.split(".");
  let parent: any = client;
  for (let i = 0; i < segments.length - 1; i++) {
    parent = parent[segments[i]];
    if (parent === undefined || parent === null) {
      throw new Error(`Cannot resolve path "${dotPath}": segment "${segments[i]}" hit ${parent}`);
    }
  }
  const methodName = segments[segments.length - 1];
  const method = parent[methodName];
  if (typeof method !== "function") {
    throw new Error(`Path "${dotPath}" resolved to ${typeof method}, not a function`);
  }
  return method.bind(parent);
}

/**
 * Build a URL-aware mock fetch that:
 *  - Returns JSONP text when `callback=` is in the URL, using the actual callback name.
 *  - Returns valid JSON otherwise.
 */
function createJsonpAwareMockFetch(): jest.Mock {
  return jest.fn().mockImplementation((...args: unknown[]) => {
    const urlStr = extractUrlString(args[0]);
    const callbackMatch = urlStr.match(/[?&]callback=([^&]+)/);

    if (callbackMatch) {
      const actualCallback = decodeURIComponent(callbackMatch[1]);
      return Promise.resolve(
        new Response(`${actualCallback}({"count":0,"results":[]});`, {
          status: 200,
          headers: { "content-type": "application/javascript" },
        })
      );
    }

    return Promise.resolve(
      new Response(JSON.stringify({ count: 0, results: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("R2-07 JSONP Exhaustive 44/44 Closure", () => {
  // Sanity: inventory count matches frozen spec
  test("Inventory contains exactly 44 method specs", () => {
    expect(JSONP_44.length).toBe(44);
    const uniquePaths = new Set(JSONP_44.map((m) => m.path));
    expect(uniquePaths.size).toBe(44);
  });

  // ---------------------------------------------------------------------------
  // Per-method test matrix
  // ---------------------------------------------------------------------------
  JSONP_44.forEach((spec) => {
    describe(`${spec.path}`, () => {
      let mockFetch: jest.Mock;
      let client: FederalRegisterClient;

      beforeEach(() => {
        mockFetch = createJsonpAwareMockFetch();
        client = new FederalRegisterClient({ fetch: mockFetch as any });
      });

      // 1. No args
      test("rejects fn() with RequestValidationError (not TypeError), fetch=0", async () => {
        const fn = resolveMethod(client, spec.path);
        await expect(fn()).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });

      // 2. undefined
      test("rejects fn(undefined) with RequestValidationError (not TypeError), fetch=0", async () => {
        const fn = resolveMethod(client, spec.path);
        await expect(fn(undefined)).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });

      // 3. null
      test("rejects fn(null) with RequestValidationError (not TypeError), fetch=0", async () => {
        const fn = resolveMethod(client, spec.path);
        await expect(fn(null)).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });

      // 4. Empty object
      test("rejects fn({}) with RequestValidationError (not TypeError), fetch=0", async () => {
        const fn = resolveMethod(client, spec.path);
        await expect(fn({})).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });

      // 5. Valid invocation
      test("valid invocation succeeds: fetch=1, result defined, callback in URL", async () => {
        const fn = resolveMethod(client, spec.path);
        const result = await fn(spec.validParams);
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(result).toBeDefined();

        // Verify the actual request URL contains the callback param
        const calledUrl = extractUrlString(mockFetch.mock.calls[0][0]);
        expect(calledUrl).toContain("callback=cb");
      });
    });
  });
});
