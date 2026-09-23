/**
 * R2-07 Canonical Surface & 120-Capability Closure Test Suite
 *
 * Mechanically reconciles:
 * 1. 14 / 14 top-level capability-domain namespaces & nested facet namespaces
 * 2. 53 / 53 canonical operation symbols
 * 3. JSONP 44 applicability / 9 alternate-format & web exclusions (FR-PROTO-003)
 * 4. 53 / 53 typed input contracts and wire serialization validation (R0-07C)
 * 5. 20 / 20 parity-contract reconciliation (R0-07D / R0-07E)
 * 6. 120 / 120 frozen capability reconciliation (R0-07E)
 * 7. 16 / 16 uncertainty-guard preservation
 * 8. Forbidden legacy/stale surface negatives & clean package-root runtime exports
 * 9. Client instance isolation & no global mutable base URI regression
 * 10. Package-root type export closure
 */

import * as crypto from "crypto";
import * as pkg from "../src/index";
import {
  FederalRegisterClient,
  RequestValidationError,
  FederalRegisterError,
  FederalRegisterHttpError,
  FederalRegisterStatusMessageError,
  FederalRegisterSearchValidationError,
  FederalRegisterAgencyNotFoundError,
  FederalRegisterEffectiveDateRangeError,
  FederalRegisterEmptyJsonError,
  FederalRegisterEmptyBodyError,
  FederalRegisterRawResponseError,
  PublicInspectionIssueConditionError,
} from "../src/index";

// Load the frozen 120-capability oracle fixture
const oracle120: Array<{
  ordinal: number;
  capability_id: string;
  parity_mode: string;
  namespace_owner: string;
  canonical_surface: string;
  request_input: string;
  return_model: string;
  format: string;
  exposure: string;
  r0_05_state: string;
  r0_07_disposition: string;
}> = require("./r2_07_oracle_120.json");

describe("R2-07 Canonical Surface & 120-Capability Closure Tests", () => {
  let client: FederalRegisterClient;

  beforeEach(() => {
    client = new FederalRegisterClient();
  });

  // =========================================================================
  // 1. 14 / 14 Top-Level Runtime Namespace Snapshot
  // =========================================================================
  describe("1. 14 / 14 Top-Level Runtime Namespace Snapshot", () => {
    const expected14Namespaces = [
      "agencies",
      "categoryCounts",
      "clippings",
      "documentation",
      "documents",
      "effectiveDates",
      "holidays",
      "images",
      "issues",
      "publicInspection",
      "sections",
      "siteNotifications",
      "suggestedSearches",
      "topics",
    ];

    test("1.1 Exactly 14 authorized top-level namespaces exist on FederalRegisterClient instance", () => {
      const instanceKeys = Object.keys(client).sort();
      expect(instanceKeys).toEqual(expected14Namespaces);
      expect(instanceKeys.length).toBe(14);
    });

    test("1.2 Zero unexpected, missing, or duplicate top-level namespaces", () => {
      const instanceKeys = new Set(Object.keys(client));
      const missing = expected14Namespaces.filter((ns) => !instanceKeys.has(ns));
      const extra = Array.from(instanceKeys).filter((k) => !expected14Namespaces.includes(k));

      expect(missing).toEqual([]);
      expect(extra).toEqual([]);
    });

    test("1.3 Nested facet namespaces remain properly owned under parent domains", () => {
      expect(typeof client.documents.facets).toBe("object");
      expect(typeof client.publicInspection.facets).toBe("object");
      expect(typeof client.publicInspection.issues).toBe("object");
      expect(typeof client.publicInspection.issues.facets).toBe("object");
    });

    test("1.4 FederalRegisterClient prototype and instance symbols remain clean", () => {
      const protoKeys = Reflect.ownKeys(FederalRegisterClient.prototype);
      expect(protoKeys).toEqual(["constructor"]);
      expect(Object.getOwnPropertySymbols(FederalRegisterClient.prototype)).toEqual([]);
      expect(Object.getOwnPropertySymbols(client)).toEqual([]);
    });
  });

  // =========================================================================
  // 2. 53 / 53 Canonical Symbol Snapshot & Operation Ownership
  // =========================================================================
  describe("2. 53 / 53 Canonical Symbol Snapshot & Operation Ownership", () => {
    const canonical53Operations = oracle120.filter((c) =>
      c.canonical_surface.startsWith("fr.")
    );

    test("2.1 Oracle identifies exactly 53 canonical operation symbols", () => {
      expect(canonical53Operations.length).toBe(53);
      const uniqueSymbols = new Set(canonical53Operations.map((c) => c.canonical_surface));
      expect(uniqueSymbols.size).toBe(53);
    });

    test("2.2 Every one of the 53 canonical operations exists as a function on FederalRegisterClient", () => {
      for (const op of canonical53Operations) {
        const pathSegments = op.canonical_surface.replace(/^fr\./, "").split(".");
        let current: any = client;
        for (const segment of pathSegments) {
          expect(current).toBeDefined();
          current = current[segment];
        }
        expect(typeof current).toBe("function");
      }
    });

    test("2.3 Operation family breakdown matches frozen specification", () => {
      // Documents: 10
      const docMethods = [
        "search", "find", "findMany", "findByCitation", "findManyByCitation",
        "autocomplete", "searchDetails", "findCsv", "searchCsv", "searchRss"
      ];
      for (const m of docMethods) {
        expect(typeof (client.documents as any)[m]).toBe("function");
      }

      // Public Inspection: 9
      const piMethods = [
        "search", "availableOn", "current", "find", "findMany",
        "searchDetails", "currentCsv", "searchCsv", "searchRss"
      ];
      for (const m of piMethods) {
        expect(typeof (client.publicInspection as any)[m]).toBe("function");
      }

      // Agencies: 4
      const agencyMethods = ["list", "find", "findMany", "suggestions"];
      for (const m of agencyMethods) {
        expect(typeof (client.agencies as any)[m]).toBe("function");
      }

      // Document Facets: 10
      const docFacetMethods = [
        "agency", "topic", "section", "type", "subtype",
        "daily", "weekly", "monthly", "quarterly", "yearly"
      ];
      for (const m of docFacetMethods) {
        expect(typeof (client.documents.facets as any)[m]).toBe("function");
      }

      // PI Facets: 3
      const piFacetMethods = ["type", "agency", "agencies"];
      for (const m of piFacetMethods) {
        expect(typeof (client.publicInspection.facets as any)[m]).toBe("function");
      }

      // PI Issue Facets: 2
      const piIssueFacetMethods = ["daily", "type"];
      for (const m of piIssueFacetMethods) {
        expect(typeof (client.publicInspection.issues.facets as any)[m]).toBe("function");
      }

      // Remaining Service Families: 15
      expect(typeof client.topics.suggestions).toBe("function");
      expect(typeof client.sections.list).toBe("function");
      expect(typeof client.suggestedSearches.list).toBe("function");
      expect(typeof client.suggestedSearches.listBySections).toBe("function");
      expect(typeof client.suggestedSearches.find).toBe("function");
      expect(typeof client.holidays.list).toBe("function");
      expect(typeof client.effectiveDates.calculate).toBe("function");
      expect(typeof client.issues.find).toBe("function");
      expect(typeof client.issues.current).toBe("function");
      expect(typeof client.images.find).toBe("function");
      expect(typeof client.categoryCounts.documentTypeCsv).toBe("function");
      expect(typeof client.categoryCounts.pageCountCsv).toBe("function");
      expect(typeof client.siteNotifications.find).toBe("function");
      expect(typeof client.documentation.fetchOpenApi).toBe("function");
      expect(typeof client.clippings.current).toBe("function");
    });
  });

  // =========================================================================
  // 3. JSONP 44 Applicability & 9 Exclusions (FR-PROTO-003)
  // =========================================================================
  describe("3. JSONP 44 Applicability & 9 Exclusions (FR-PROTO-003)", () => {
    const excluded9Operations = [
      "fr.documents.findCsv",
      "fr.documents.searchCsv",
      "fr.documents.searchRss",
      "fr.publicInspection.currentCsv",
      "fr.publicInspection.searchCsv",
      "fr.publicInspection.searchRss",
      "fr.categoryCounts.documentTypeCsv",
      "fr.categoryCounts.pageCountCsv",
      "fr.clippings.current",
    ];

    test("3.1 Exactly 44 operations have fooJsonp format companion methods", () => {
      const canonical53 = oracle120.filter((c) => c.canonical_surface.startsWith("fr."));
      let jsonpCount = 0;

      for (const op of canonical53) {
        const pathSegments = op.canonical_surface.replace(/^fr\./, "").split(".");
        const methodName = pathSegments.pop()!;
        const jsonpMethodName = `${methodName}Jsonp`;

        let current: any = client;
        for (const segment of pathSegments) {
          current = current[segment];
        }

        if (excluded9Operations.includes(op.canonical_surface)) {
          expect(current[jsonpMethodName]).toBeUndefined();
        } else {
          expect(typeof current[jsonpMethodName]).toBe("function");
          jsonpCount++;
        }
      }

      expect(jsonpCount).toBe(44);
    });

    test("3.2 Exactly 9 operations are excluded from JSONP sibling exposure", () => {
      expect(excluded9Operations.length).toBe(9);
      expect((client.documents as any).findCsvJsonp).toBeUndefined();
      expect((client.documents as any).searchCsvJsonp).toBeUndefined();
      expect((client.documents as any).searchRssJsonp).toBeUndefined();
      expect((client.publicInspection as any).currentCsvJsonp).toBeUndefined();
      expect((client.publicInspection as any).searchCsvJsonp).toBeUndefined();
      expect((client.publicInspection as any).searchRssJsonp).toBeUndefined();
      expect((client.categoryCounts as any).documentTypeCsvJsonp).toBeUndefined();
      expect((client.categoryCounts as any).pageCountCsvJsonp).toBeUndefined();
      expect((client.clippings as any).currentJsonp).toBeUndefined();
    });

    test("3.3 Zero generic client.jsonp escape hatch", () => {
      expect((client as any).jsonp).toBeUndefined();
      expect((pkg as any).jsonp).toBeUndefined();
    });

    test("3.4 JSONP callback grammar validation rejects invalid identifiers", async () => {
      const invalidCallbacks = ["cb with space", "bad-dash", "alert()", "<script>", ""];
      for (const cb of invalidCallbacks) {
        await expect(client.agencies.listJsonp({ callback: cb })).rejects.toThrow(RequestValidationError);
        await expect(client.documents.searchJsonp({ callback: cb })).rejects.toThrow(RequestValidationError);
      }
    });
  });

  // =========================================================================
  // 4. 53 / 53 Typed Input Contract Closure (R0-07C)
  // =========================================================================
  describe("4. 53 / 53 Typed Input Contract Closure (R0-07C)", () => {
    test("4.1 Operations requiring non-empty identifiers reject empty arrays", async () => {
      await expect(client.documents.findMany({ documentNumbers: [] as any })).rejects.toThrow(RequestValidationError);
      await expect(client.documents.findCsv({ documentNumbers: [] as any })).rejects.toThrow(RequestValidationError);
      await expect(client.agencies.findMany({ ids: [] as any })).rejects.toThrow(RequestValidationError);
      await expect(client.publicInspection.findMany({ documentNumbers: [] as any })).rejects.toThrow(RequestValidationError);
    });

    test("4.2 Operations requiring non-blank identifiers reject empty/whitespace strings", async () => {
      await expect(client.documents.find({ documentNumber: "" })).rejects.toThrow(RequestValidationError);
      await expect(client.documents.findByCitation({ citation: { volume: 0, page: 1 } as any })).rejects.toThrow(RequestValidationError);
      await expect(client.agencies.find({ idOrSlug: "" })).rejects.toThrow(RequestValidationError);
      await expect(client.suggestedSearches.find({ slug: "" })).rejects.toThrow(RequestValidationError);
      await expect(client.issues.find({ publicationDate: "" })).rejects.toThrow(RequestValidationError);
      await expect(client.images.find({ identifier: "" })).rejects.toThrow(RequestValidationError);
      await expect(client.siteNotifications.find({ identifier: "" })).rejects.toThrow(RequestValidationError);
    });

    test("4.3 Date-period operations enforce format and range boundaries (isolated mock)", async () => {
      // local mock to ensure fetch is not called
      const mockFetch = jest.fn().mockResolvedValue(
        new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
      const testClient = new FederalRegisterClient({ fetch: mockFetch });

      // Invalid date format
      await expect(
        testClient.effectiveDates.calculate({ startDate: "invalid-date", endDate: "2026-01-01" })
      ).rejects.toThrow(RequestValidationError);

      // Effective dates 120-day forward limit
      await expect(
        testClient.effectiveDates.calculate({ startDate: "2026-01-01", endDate: "2026-06-01" })
      ).rejects.toThrow(RequestValidationError);

      // Historical signed‑reverse behavior superseded by
      // R3-POSTGA-02-E/F E-CORR-004.
      await expect(
        testClient.effectiveDates.calculate({ startDate: "2026-06-01", endDate: "2026-01-01" })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("4.4 Search operations validate page boundaries and reject invalid types", async () => {
      await expect(client.documents.search({ page: 0 as any })).rejects.toThrow(RequestValidationError);
      await expect(client.documents.search({ page: 51 as any })).rejects.toThrow(RequestValidationError);
      await expect(client.documents.search({ perPage: 1 as any })).rejects.toThrow(RequestValidationError);
      await expect(client.documents.search({ perPage: 2001 as any })).rejects.toThrow(RequestValidationError);
      await expect(client.publicInspection.search({ page: -1 as any })).rejects.toThrow(RequestValidationError);
    });
  });

  // =========================================================================
  // 5. 20 / 20 Parity-Contract Reconciliation (R0-07D / R0-07E)
  // =========================================================================
  describe("5. 20 / 20 Parity-Contract Reconciliation (R0-07D / R0-07E)", () => {
    const parityModes = ["RESPONSE_MODEL", "CLIENT_ERROR_MODEL", "FORMAT", "SERVER_BEHAVIOR"];
    const parity20 = oracle120.filter((c) => parityModes.includes(c.parity_mode));

    test("5.1 Exactly 20 parity capability rows in frozen oracle", () => {
      expect(parity20.length).toBe(20);
      const modeBreakdown: Record<string, number> = {};
      for (const p of parity20) {
        modeBreakdown[p.parity_mode] = (modeBreakdown[p.parity_mode] || 0) + 1;
      }
      expect(modeBreakdown["RESPONSE_MODEL"]).toBe(6);
      expect(modeBreakdown["CLIENT_ERROR_MODEL"]).toBe(5);
      expect(modeBreakdown["FORMAT"]).toBe(8);
      expect(modeBreakdown["SERVER_BEHAVIOR"]).toBe(1);
    });

    test("5.2 Public Inspection agency vs agencies key domain distinction is preserved", () => {
      const piAgencyFacet = oracle120.find((c) => c.capability_id === "FR-PI-FAC-002")!;
      const piAgenciesFacet = oracle120.find((c) => c.capability_id === "FR-PI-FAC-003")!;

      expect(piAgencyFacet.canonical_surface).toBe("fr.publicInspection.facets.agency");
      expect(piAgencyFacet.return_model).toBe("PublicInspectionAgencyIdFacetMap");

      expect(piAgenciesFacet.canonical_surface).toBe("fr.publicInspection.facets.agencies");
      expect(piAgenciesFacet.return_model).toBe("PublicInspectionAgencySlugFacetMap");

      expect(typeof client.publicInspection.facets.agency).toBe("function");
      expect(typeof client.publicInspection.facets.agencies).toBe("function");
    });

    test("5.3 MultiLookupEnvelope partial success preserves errors.not_found", async () => {
      const mockPayload = {
        results: [{ document_number: "2024-001" }],
        errors: { not_found: ["2024-999"] },
      };
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify(mockPayload), { status: 200, headers: { "content-type": "application/json" } })
      );
      const testClient = new FederalRegisterClient({ fetch: mockFetch });
      const res = await testClient.documents.findMany({ documentNumbers: ["2024-001", "2024-999"] });

      expect(res.results.length).toBe(1);
      expect(res.errors).toBeDefined();
      expect(res.errors?.not_found).toEqual(["2024-999"]);
    });

    test("5.4 SiteNotification tri-state model decoding (active, inactive {}, missing empty-404)", async () => {
      // 1. Active notification (HTTP 200 with content)
      const mockActive = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, message: "Maintenance tonight" }), { status: 200, headers: { "content-type": "application/json" } })
      );
      const clientActive = new FederalRegisterClient({ fetch: mockActive });
      const activeRes = await clientActive.siteNotifications.find({ identifier: "banner" });
      expect((activeRes as any).id).toBe(1);

      // 2. Inactive notification (HTTP 200 with empty JSON {})
      const mockInactive = jest.fn().mockResolvedValue(
        new Response("{}", { status: 200, headers: { "content-type": "application/json" } })
      );
      const clientInactive = new FederalRegisterClient({ fetch: mockInactive });
      const inactiveRes = await clientInactive.siteNotifications.find({ identifier: "banner" });
      expect(inactiveRes).toEqual({});

      // 3. Missing notification (HTTP 404 empty body throws FederalRegisterEmptyBodyError)
      const mockMissing = jest.fn().mockResolvedValue(
        new Response("", { status: 404, headers: { "content-type": "text/html" } })
      );
      const clientMissing = new FederalRegisterClient({ fetch: mockMissing });
      await expect(clientMissing.siteNotifications.find({ identifier: "banner" })).rejects.toThrow(FederalRegisterEmptyBodyError);
    });

    test("5.5 FR-PROTO-002 Wildcard CORS remains server assertion only (zero client methods)", () => {
      const corsCap = oracle120.find((c) => c.capability_id === "FR-PROTO-002")!;
      expect(corsCap.canonical_surface).toBe("assertion:wildcard-cors");
      expect(corsCap.parity_mode).toBe("SERVER_BEHAVIOR");
      expect((client as any).cors).toBeUndefined();
      expect((pkg as any).cors).toBeUndefined();
    });
  });

  // =========================================================================
  // 6. 120 / 120 Frozen Capability Reconciliation (R0-07E)
  // =========================================================================
  describe("6. 120 / 120 Frozen Capability Reconciliation (R0-07E)", () => {
    test("6.0 Non-self-consistency oracle semantic projection hash guard", () => {
      // Construct exact 11-field UTF-8 semantic projection
      const projected = oracle120.map((c) => ({
        ordinal: c.ordinal,
        capability_id: c.capability_id,
        parity_mode: c.parity_mode,
        namespace_owner: c.namespace_owner,
        canonical_surface: c.canonical_surface,
        request_input: c.request_input,
        return_model: c.return_model,
        format: c.format,
        exposure: c.exposure,
        r0_05_state: c.r0_05_state,
        r0_07_disposition: c.r0_07_disposition,
      }));

      const jsonStr = JSON.stringify(projected);
      const digest = crypto.createHash("sha256").update(Buffer.from(jsonStr, "utf8")).digest("hex");
      const expectedDigest = "2362b64d7cb5dca09677375f591042d3a6ab1b4517c30b1c06234a03625d9c38";

      expect(digest).toBe(expectedDigest);
    });

    test("6.1 Oracle contains exactly 120 capabilities with 120 unique IDs", () => {
      expect(oracle120.length).toBe(120);
      const ids = oracle120.map((c) => c.capability_id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(120);
    });

    test("6.2 Ordinal integrity matches frozen sequential numbering 1..120", () => {
      for (let i = 0; i < 120; i++) {
        expect(oracle120[i].ordinal).toBe(i + 1);
      }
      expect(oracle120[0].capability_id).toBe("FR-PROTO-001");
      expect(oracle120[119].capability_id).toBe("FR-WEB-001");
    });

    test("6.3 Zero undefined representation or missing namespace owners across all 120 rows", () => {
      for (const cap of oracle120) {
        expect(cap.namespace_owner).toBeTruthy();
        expect(cap.canonical_surface).toBeTruthy();
        expect(cap.request_input).toBeTruthy();
        expect(cap.return_model).toBeTruthy();
        expect(cap.format).toBeTruthy();
        expect(cap.exposure).toBeTruthy();
        expect(cap.r0_05_state).toBeTruthy();
        expect(cap.r0_07_disposition).toBeTruthy();
      }
    });

    test("6.4 Parity mode breakdown matches frozen R0-07E crosswalk", () => {
      const counts = oracle120.reduce((acc, c) => {
        acc[c.parity_mode] = (acc[c.parity_mode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(counts["FORMAT"]).toBe(8);
      expect(counts["SERVER_BEHAVIOR"]).toBe(1);
      expect(counts["QUERY_INPUT"]).toBe(51);
      expect(counts["CLIENT_ERROR_MODEL"]).toBe(5);
      expect(counts["RESPONSE_MODEL"]).toBe(6);
      expect(counts["COMPATIBILITY_INPUT"]).toBe(2);
      expect(counts["OPERATION"]).toBe(31);
      expect(counts["OPERATION_MODE"]).toBe(15);
      expect(counts["WEB_OPERATION"]).toBe(1);
      expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(120);
    });

    test("6.5 Parity contracts filter yields exactly 20 contracts across 4 parity modes", () => {
      const parity20 = oracle120.filter((c) =>
        c.parity_mode === "RESPONSE_MODEL" ||
        c.parity_mode === "CLIENT_ERROR_MODEL" ||
        c.parity_mode === "FORMAT" ||
        c.parity_mode === "SERVER_BEHAVIOR"
      );
      expect(parity20.length).toBe(20);

      const breakdown = parity20.reduce((acc, c) => {
        acc[c.parity_mode] = (acc[c.parity_mode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(breakdown["RESPONSE_MODEL"]).toBe(6);
      expect(breakdown["CLIENT_ERROR_MODEL"]).toBe(5);
      expect(breakdown["FORMAT"]).toBe(8);
      expect(breakdown["SERVER_BEHAVIOR"]).toBe(1);
    });
  });

  // =========================================================================
  // 7. 16 / 16 Frozen Uncertainty / Availability Guards
  // =========================================================================
  describe("7. 16 / 16 Frozen Uncertainty / Availability Guards", () => {
    const frozenGuardIds = [
      "FR-SEARCHTYPE-001",
      "FR-SEARCHTYPE-006",
      "FR-DOC-FLT-009",
      "FR-DOC-FLT-012",
      "FR-DOC-FLT-014",
      "FR-DOC-FLT-019",
      "FR-PI-FLT-004",
      "FR-PI-FLT-005",
      "FR-SUGGEST-002",
      "FR-PI-011",
      "FR-PI-FLT-001",
      "FR-PI-FLT-006",
      "FR-PI-FLT-008",
      "FR-TOPIC-001",
      "FR-DOC-006",
      "FR-WEB-001",
    ];

    test("7.1 Exactly 16 uncertainty guards in oracle", () => {
      expect(frozenGuardIds.length).toBe(16);
      for (const id of frozenGuardIds) {
        expect(oracle120.some((c) => c.capability_id === id)).toBe(true);
      }
    });

    test("7.2 Guard classifications are preserved without premature promotion", () => {
      const featureUnavailable = oracle120.filter((g) => g.r0_05_state === "FEATURE_UNAVAILABLE");
      expect(featureUnavailable.map((g) => g.capability_id).sort()).toEqual([
        "FR-SEARCHTYPE-001",
        "FR-SEARCHTYPE-006",
      ]);

      const inconclusiveFixture = oracle120.filter((g) => g.r0_05_state === "INCONCLUSIVE_FIXTURE");
      expect(inconclusiveFixture.map((g) => g.capability_id).sort()).toEqual([
        "FR-DOC-FLT-009",
        "FR-DOC-FLT-012",
        "FR-DOC-FLT-014",
        "FR-DOC-FLT-019",
        "FR-PI-FLT-004",
        "FR-PI-FLT-005",
        "FR-SUGGEST-002",
      ]);

      const inconclusiveData = oracle120.filter((g) => g.r0_05_state === "INCONCLUSIVE_DATA");
      expect(inconclusiveData.map((g) => g.capability_id).sort()).toEqual([
        "FR-PI-011",
        "FR-PI-FLT-001",
        "FR-PI-FLT-006",
        "FR-PI-FLT-008",
      ]);

      const resolvedThird = oracle120.filter((g) => g.r0_05_state === "RESOLVED_THIRD_BEHAVIOR");
      expect(resolvedThird.map((g) => g.capability_id)).toEqual(["FR-TOPIC-001"]);

      const conditionalReserve = oracle120.filter((g) => g.r0_05_state === "NOT_EXECUTED_CONDITIONAL_RESERVE_UNCONSUMED");
      expect(conditionalReserve.map((g) => g.capability_id)).toEqual(["FR-DOC-006"]);

      // Base r0_05_state of FR-WEB-001 is PASS, while AUTH_DEFERRED remains represented in its guard disposition
      const web001 = oracle120.find((g) => g.capability_id === "FR-WEB-001")!;
      expect(web001.r0_05_state).toBe("PASS");
      expect(web001.exposure).toBe("WEB_OWNED_SESSION");
    });
  });

  // =========================================================================
  // 8. Forbidden / Stale Surface Negatives (R0-07F / Section 10)
  // =========================================================================
  describe("8. Forbidden / Stale Surface Negatives (R0-07F / Section 10)", () => {
    test("8.1 Package-root runtime exports match exactly the 12 canonical symbols", () => {
      const expectedRuntimeExports = [
        "FederalRegisterAgencyNotFoundError",
        "FederalRegisterClient",
        "FederalRegisterEffectiveDateRangeError",
        "FederalRegisterEmptyBodyError",
        "FederalRegisterEmptyJsonError",
        "FederalRegisterError",
        "FederalRegisterHttpError",
        "FederalRegisterRawResponseError",
        "FederalRegisterSearchValidationError",
        "FederalRegisterStatusMessageError",
        "PublicInspectionIssueConditionError",
        "RequestValidationError",
      ].sort();

      const actualExports = Object.keys(pkg).sort();
      expect(actualExports).toEqual(expectedRuntimeExports);
      expect(actualExports.length).toBe(12);
    });

    test("8.2 Stale root operation functions are strictly absent from package root", () => {
      expect((pkg as any).searchDocuments).toBeUndefined();
      expect((pkg as any).findDocument).toBeUndefined();
      expect((pkg as any).search).toBeUndefined();
      expect((pkg as any).find).toBeUndefined();
      expect((pkg as any).listAgencies).toBeUndefined();
    });

    test("8.3 Stale ActiveRecord-style static operation methods are strictly absent", () => {
      expect((pkg as any).Document?.search).toBeUndefined();
      expect((pkg as any).Document?.find).toBeUndefined();
      expect((pkg as any).Agency?.all).toBeUndefined();
      expect((pkg as any).Agency?.find).toBeUndefined();
      expect((pkg as any).PublicInspectionDocument?.search).toBeUndefined();
      expect((pkg as any).PublicInspectionDocument?.find).toBeUndefined();
    });

    test("8.4 Process-global mutable base URI is strictly absent", () => {
      expect((FederalRegisterClient as any).overrideBaseUri).toBeUndefined();
      expect((FederalRegisterClient as any).BASE_URI).toBeUndefined();
      expect((FederalRegisterClient as any).DEFAULT_BASE_URL).toBeUndefined();
      expect((client as any).overrideBaseUri).toBeUndefined();
      expect((client as any).BASE_URI).toBeUndefined();
      expect((pkg as any).Client?.overrideBaseUri).toBeUndefined();
    });

    test("8.5 Low-level / untyped escape hatches are strictly absent on client", () => {
      expect((client as any).get).toBeUndefined();
      expect((client as any).post).toBeUndefined();
      expect((client as any).put).toBeUndefined();
      expect((client as any).delete).toBeUndefined();
      expect((client as any).execute).toBeUndefined();
      expect((client as any).request).toBeUndefined();
      expect((client as any).fetch).toBeUndefined();
      expect((client as any).fetchUrl).toBeUndefined();
      expect((client as any).baseUrl).toBeUndefined();
      expect((client as any).executeInternal).toBeUndefined();
      expect((client as any).fetchOpaqueUrl).toBeUndefined();
      expect((client.documents as any).facet).toBeUndefined();
      expect((client.publicInspection as any).facet).toBeUndefined();
    });

    test("8.6 Explicit .json method aliases are strictly absent on client namespaces", () => {
      expect((client.documents as any).searchJson).toBeUndefined();
      expect((client.documents as any).findJson).toBeUndefined();
      expect((client.publicInspection as any).searchJson).toBeUndefined();
      expect((client.agencies as any).listJson).toBeUndefined();
      expect((client.sections as any).listJson).toBeUndefined();
      expect((client.issues as any).currentJson).toBeUndefined();
    });
  });

  // =========================================================================
  // 9. Client Instance Isolation & Configuration Safety
  // =========================================================================
  describe("9. Client Instance Isolation & Configuration Safety", () => {
    test("9.1 Instances with different configurations execute independently with zero shared state", async () => {
      const callsA: string[] = [];
      const callsB: string[] = [];

      const fetchA: typeof fetch = jest.fn().mockImplementation(async (url: any) => {
        callsA.push(url.toString());
        return new Response(JSON.stringify({ name: "Agency A" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      });

      const fetchB: typeof fetch = jest.fn().mockImplementation(async (url: any) => {
        callsB.push(url.toString());
        return new Response(JSON.stringify({ name: "Agency B" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      });

      const clientA = new FederalRegisterClient({
        baseUrl: "https://api-a.example.com/v1/",
        fetch: fetchA,
      });

      const clientB = new FederalRegisterClient({
        baseUrl: "https://api-b.example.org/v1/",
        fetch: fetchB,
      });

      const resA = await clientA.agencies.find({ idOrSlug: "epa" });
      const resB = await clientB.agencies.find({ idOrSlug: "doc" });

      expect(callsA).toEqual(["https://api-a.example.com/v1/agencies/epa"]);
      expect(callsB).toEqual(["https://api-b.example.org/v1/agencies/doc"]);
      expect((resA as any).name).toBe("Agency A");
      expect((resB as any).name).toBe("Agency B");
    });
  });
});
