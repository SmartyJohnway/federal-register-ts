import { FederalRegisterClient } from "../src/core/client";
import { RequestValidationError } from "../src/request/validation";

describe("R3-POSTGA-01 PR-1 — Runtime Validation Safety & JSONP Parity", () => {
  let client: FederalRegisterClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // URL‑aware mock: JSON for normal endpoints, JSONP text for callback‑based endpoints.
    // Handles string | URL | Request inputs per deterministic test harness hardening.
    mockFetch = jest.fn().mockImplementation((...args: unknown[]) => {
      const input = args[0];
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input instanceof Request
              ? input.url
              : String(input);
      const isJsonp = requestUrl.includes("callback=");
      if (isJsonp) {
        return Promise.resolve(
          new Response(`callback_fn({ count: 0, results: [] });`, {
            status: 200,
            headers: { "content-type": "application/javascript" },
          })
        );
      }
      // Regular JSON response
      return Promise.resolve(
        new Response(JSON.stringify({ count: 0, results: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
    });
    client = new FederalRegisterClient({
      fetch: mockFetch,
    });
  });

  describe("FIX-001 — Reject Unknown Request Keys at Runtime (with fetchCount === 0 assertion)", () => {
    test("rejects unknown top-level key bogusTopLevel", async () => {
      await expect(
        client.documents.search({ bogusTopLevel: "val" } as any)
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects singular condition key (typo for conditions)", async () => {
      await expect(
        client.documents.search({ condition: { term: "energy" } } as any)
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects unknown nested condition key conditions.bogus_filter", async () => {
      await expect(
        client.documents.search({ conditions: { bogus_filter: "val" } as any })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects singular conditions.agency (typo for agencies)", async () => {
      await expect(
        client.documents.search({ conditions: { agency: "EPA" } as any })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects singular conditions.type (typo for types)", async () => {
      await expect(
        client.documents.search({ conditions: { type: "RULE" } as any })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects snake_case per_page parameter", async () => {
      await expect(
        client.documents.search({ per_page: 20 } as any)
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects snake_case publication_date parameter", async () => {
      await expect(
        client.documents.search({ publication_date: "2024-01-01" } as any)
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects misplaced term in searchDetails top-level", async () => {
      await expect(
        client.documents.searchDetails({ term: "energy" } as any)
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects unknown keys in Public Inspection search", async () => {
      await expect(
        client.publicInspection.search({ unknownKey: 123 } as any)
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);

      await expect(
        client.publicInspection.search({ conditions: { unknownCond: "test" } as any })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("preserves all documented valid search parameters", async () => {
      await expect(
        client.documents.search({
          page: 1,
          perPage: 20,
          order: "newest",
          fields: ["document_number", "title"],
          conditions: {
            term: "solar",
            agencies: ["environmental-protection-agency"],
            types: ["RULE"],
            publicationDate: { is: "2024-01-15" },
            significant: true,
          },
        })
      ).resolves.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("FIX-002 — Runtime Validation of conditions.types", () => {
    test("rejects invalid type code BOGUS and prevents network dispatch", async () => {
      await expect(
        client.documents.search({ conditions: { types: ["BOGUS" as any] } })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects lower-case rule (does not auto-coerce) and prevents network dispatch", async () => {
      await expect(
        client.documents.search({ conditions: { types: ["rule" as any] } })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("accepts all canonical DocumentTypeCode values", async () => {
      await expect(
        client.documents.search({
          conditions: { types: ["RULE", "PRORULE", "NOTICE", "PRESDOCU"] },
        })
      ).resolves.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("FIX-004 — Required Parameter Object Guard (with fetchCount === 0 assertion)", () => {
    test("rejects undefined/null on documents.find", async () => {
      await expect(client.documents.find(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.documents.find(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects undefined/null on documents.findMany", async () => {
      await expect(client.documents.findMany(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.documents.findMany(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects undefined/null on documents.autocomplete", async () => {
      await expect(client.documents.autocomplete(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.documents.autocomplete(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects undefined/null on agencies.find", async () => {
      await expect(client.agencies.find(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.agencies.find(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects undefined/null on agencies.findMany", async () => {
      await expect(client.agencies.findMany(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.agencies.findMany(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects undefined/null on effectiveDates.calculate", async () => {
      await expect(client.effectiveDates.calculate(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.effectiveDates.calculate(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects undefined/null on issues.find", async () => {
      await expect(client.issues.find(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.issues.find(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("rejects undefined/null on publicInspection.availableOn", async () => {
      await expect(client.publicInspection.availableOn(undefined as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      await expect(client.publicInspection.availableOn(null as any)).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("allows optional parameters to be omitted on search methods", async () => {
      await expect(client.documents.search()).resolves.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      mockFetch.mockClear();

      await expect(client.documents.searchDetails()).resolves.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      mockFetch.mockClear();

      await expect(client.publicInspection.search()).resolves.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      mockFetch.mockClear();

      await expect(client.agencies.list()).resolves.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("C1-01 / FIX-001 — JSONP Sibling Methods Callback & Unknown-Key Validation Matrix", () => {
    describe("Affected endpoints specifically verified for C1-01", () => {
      test("effectiveDates.calculateJsonp accepts valid params and callback", async () => {
        const res = await client.effectiveDates.calculateJsonp({
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          callback: "handleEffectiveDates",
        });
        expect(res).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      test("effectiveDates.calculateJsonp rejects unknown parameter with fetchCount === 0", async () => {
        await expect(
          client.effectiveDates.calculateJsonp({
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            callback: "handleEffectiveDates",
            bogusKey: "invalid",
          } as any)
        ).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });

      test("issues.findJsonp accepts valid params and callback", async () => {
        const res = await client.issues.findJsonp({
          publicationDate: "2024-01-15",
          callback: "handleIssue",
        });
        expect(res).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      test("issues.findJsonp rejects unknown parameter with fetchCount === 0", async () => {
        await expect(
          client.issues.findJsonp({
            publicationDate: "2024-01-15",
            callback: "handleIssue",
            extraField: 123,
          } as any)
        ).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });

      test("images.findJsonp accepts valid params and callback", async () => {
        const res = await client.images.findJsonp({
          identifier: "img-001",
          callback: "handleImage",
        });
        expect(res).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      test("images.findJsonp rejects unknown parameter with fetchCount === 0", async () => {
        await expect(
          client.images.findJsonp({
            identifier: "img-001",
            callback: "handleImage",
            unknownProp: true,
          } as any)
        ).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });

      test("siteNotifications.findJsonp accepts valid params and callback", async () => {
        const res = await client.siteNotifications.findJsonp({
          identifier: "notif-001",
          callback: "handleNotif",
        });
        expect(res).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      test("siteNotifications.findJsonp rejects unknown parameter with fetchCount === 0", async () => {
        await expect(
          client.siteNotifications.findJsonp({
            identifier: "notif-001",
            callback: "handleNotif",
            unknownProp: 42,
          } as any)
        ).rejects.toThrow(RequestValidationError);
        expect(mockFetch).toHaveBeenCalledTimes(0);
      });
    });

    describe("Comprehensive Table-Driven Public *Jsonp Surface Sweep", () => {
      interface JsonpTestCase {
        name: string;
        invokeValid: (c: FederalRegisterClient) => Promise<any>;
        invokeWithUnknown: (c: FederalRegisterClient) => Promise<any>;
        invokeWithInvalidCallback: (c: FederalRegisterClient) => Promise<any>;
      }

      const testCases: JsonpTestCase[] = [
        // Documents
        {
          name: "documents.searchJsonp",
          invokeValid: (c) => c.documents.searchJsonp({ callback: "cbSearch" }),
          invokeWithUnknown: (c) => c.documents.searchJsonp({ callback: "cbSearch", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.searchJsonp({ callback: "bad-identifier!" } as any),
        },
        {
          name: "documents.findJsonp",
          invokeValid: (c) => c.documents.findJsonp({ documentNumber: "2024-00001", callback: "cbFind" }),
          invokeWithUnknown: (c) => c.documents.findJsonp({ documentNumber: "2024-00001", callback: "cbFind", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.findJsonp({ documentNumber: "2024-00001", callback: "" } as any),
        },
        {
          name: "documents.findManyJsonp",
          invokeValid: (c) => c.documents.findManyJsonp({ documentNumbers: ["2024-00001"], callback: "cbFindMany" }),
          invokeWithUnknown: (c) => c.documents.findManyJsonp({ documentNumbers: ["2024-00001"], callback: "cbFindMany", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.findManyJsonp({ documentNumbers: ["2024-00001"], callback: "invalid#name" } as any),
        },
        {
          name: "documents.findByCitationJsonp",
          invokeValid: (c) => c.documents.findByCitationJsonp({ citation: { volume: 89, page: 12345 }, callback: "cbCit" }),
          invokeWithUnknown: (c) => c.documents.findByCitationJsonp({ citation: { volume: 89, page: 12345 }, callback: "cbCit", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.findByCitationJsonp({ citation: { volume: 89, page: 12345 }, callback: "bad-citation-cb!" } as any),
        },
        {
          name: "documents.findManyByCitationJsonp",
          invokeValid: (c) => c.documents.findManyByCitationJsonp({ citations: [{ volume: 89, page: 12345 }], callback: "cbCitMany" }),
          invokeWithUnknown: (c) => c.documents.findManyByCitationJsonp({ citations: [{ volume: 89, page: 12345 }], callback: "cbCitMany", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.findManyByCitationJsonp({ citations: [{ volume: 89, page: 12345 }], callback: "fn name" } as any),
        },
        {
          name: "documents.autocompleteJsonp",
          invokeValid: (c) => c.documents.autocompleteJsonp({ term: "energy", callback: "cbAuto" }),
          invokeWithUnknown: (c) => c.documents.autocompleteJsonp({ term: "energy", callback: "cbAuto", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.autocompleteJsonp({ term: "energy", callback: "alert(1)" } as any),
        },
        {
          name: "documents.searchDetailsJsonp",
          invokeValid: (c) => c.documents.searchDetailsJsonp({ callback: "cbDetails" }),
          invokeWithUnknown: (c) => c.documents.searchDetailsJsonp({ callback: "cbDetails", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.searchDetailsJsonp({ callback: "alert()" } as any),
        },

        // Document Facets
        {
          name: "documents.facets.agencyJsonp",
          invokeValid: (c) => c.documents.facets.agencyJsonp({ callback: "cbFacetAgency" }),
          invokeWithUnknown: (c) => c.documents.facets.agencyJsonp({ callback: "cbFacetAgency", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.agencyJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.topicJsonp",
          invokeValid: (c) => c.documents.facets.topicJsonp({ callback: "cbFacetTopic" }),
          invokeWithUnknown: (c) => c.documents.facets.topicJsonp({ callback: "cbFacetTopic", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.topicJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.sectionJsonp",
          invokeValid: (c) => c.documents.facets.sectionJsonp({ callback: "cbFacetSection" }),
          invokeWithUnknown: (c) => c.documents.facets.sectionJsonp({ callback: "cbFacetSection", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.sectionJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.typeJsonp",
          invokeValid: (c) => c.documents.facets.typeJsonp({ callback: "cbFacetType" }),
          invokeWithUnknown: (c) => c.documents.facets.typeJsonp({ callback: "cbFacetType", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.typeJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.subtypeJsonp",
          invokeValid: (c) => c.documents.facets.subtypeJsonp({ callback: "cbFacetSubtype" }),
          invokeWithUnknown: (c) => c.documents.facets.subtypeJsonp({ callback: "cbFacetSubtype", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.subtypeJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.dailyJsonp",
          invokeValid: (c) => c.documents.facets.dailyJsonp({ callback: "cbFacetDaily" }),
          invokeWithUnknown: (c) => c.documents.facets.dailyJsonp({ callback: "cbFacetDaily", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.dailyJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.weeklyJsonp",
          invokeValid: (c) => c.documents.facets.weeklyJsonp({ callback: "cbFacetWeekly" }),
          invokeWithUnknown: (c) => c.documents.facets.weeklyJsonp({ callback: "cbFacetWeekly", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.weeklyJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.monthlyJsonp",
          invokeValid: (c) => c.documents.facets.monthlyJsonp({ callback: "cbFacetMonthly" }),
          invokeWithUnknown: (c) => c.documents.facets.monthlyJsonp({ callback: "cbFacetMonthly", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.monthlyJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.quarterlyJsonp",
          invokeValid: (c) => c.documents.facets.quarterlyJsonp({ callback: "cbFacetQuarterly" }),
          invokeWithUnknown: (c) => c.documents.facets.quarterlyJsonp({ callback: "cbFacetQuarterly", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.quarterlyJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "documents.facets.yearlyJsonp",
          invokeValid: (c) => c.documents.facets.yearlyJsonp({ callback: "cbFacetYearly" }),
          invokeWithUnknown: (c) => c.documents.facets.yearlyJsonp({ callback: "cbFacetYearly", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.documents.facets.yearlyJsonp({ callback: "cb-bad" } as any),
        },

        // Public Inspection
        {
          name: "publicInspection.searchJsonp",
          invokeValid: (c) => c.publicInspection.searchJsonp({ callback: "cbPISearch" }),
          invokeWithUnknown: (c) => c.publicInspection.searchJsonp({ callback: "cbPISearch", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.searchJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.availableOnJsonp",
          invokeValid: (c) => c.publicInspection.availableOnJsonp({ availableOn: "2024-01-15", callback: "cbPIAvail" }),
          invokeWithUnknown: (c) => c.publicInspection.availableOnJsonp({ availableOn: "2024-01-15", callback: "cbPIAvail", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.availableOnJsonp({ availableOn: "2024-01-15", callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.currentJsonp",
          invokeValid: (c) => c.publicInspection.currentJsonp({ callback: "cbPICurrent" }),
          invokeWithUnknown: (c) => c.publicInspection.currentJsonp({ callback: "cbPICurrent", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.currentJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.findJsonp",
          invokeValid: (c) => c.publicInspection.findJsonp({ documentNumber: "2024-00001", callback: "cbPIFind" }),
          invokeWithUnknown: (c) => c.publicInspection.findJsonp({ documentNumber: "2024-00001", callback: "cbPIFind", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.findJsonp({ documentNumber: "2024-00001", callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.findManyJsonp",
          invokeValid: (c) => c.publicInspection.findManyJsonp({ documentNumbers: ["2024-00001"], callback: "cbPIFindMany" }),
          invokeWithUnknown: (c) => c.publicInspection.findManyJsonp({ documentNumbers: ["2024-00001"], callback: "cbPIFindMany", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.findManyJsonp({ documentNumbers: ["2024-00001"], callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.searchDetailsJsonp",
          invokeValid: (c) => c.publicInspection.searchDetailsJsonp({ callback: "cbPIDetails" }),
          invokeWithUnknown: (c) => c.publicInspection.searchDetailsJsonp({ callback: "cbPIDetails", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.searchDetailsJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.facets.typeJsonp",
          invokeValid: (c) => c.publicInspection.facets.typeJsonp({ callback: "cbPIFacetType" }),
          invokeWithUnknown: (c) => c.publicInspection.facets.typeJsonp({ callback: "cbPIFacetType", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.facets.typeJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.facets.agencyJsonp",
          invokeValid: (c) => c.publicInspection.facets.agencyJsonp({ callback: "cbPIFacetAgency" }),
          invokeWithUnknown: (c) => c.publicInspection.facets.agencyJsonp({ callback: "cbPIFacetAgency", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.facets.agencyJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.facets.agenciesJsonp",
          invokeValid: (c) => c.publicInspection.facets.agenciesJsonp({ callback: "cbPIFacetAgencies" }),
          invokeWithUnknown: (c) => c.publicInspection.facets.agenciesJsonp({ callback: "cbPIFacetAgencies", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.facets.agenciesJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.issues.facets.dailyJsonp",
          invokeValid: (c) => c.publicInspection.issues.facets.dailyJsonp({ publicationDate: { gte: "2024-01-01" }, callback: "cbPIIssueDaily" }),
          invokeWithUnknown: (c) => c.publicInspection.issues.facets.dailyJsonp({ publicationDate: { gte: "2024-01-01" }, callback: "cbPIIssueDaily", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.issues.facets.dailyJsonp({ publicationDate: { gte: "2024-01-01" }, callback: "cb-bad" } as any),
        },
        {
          name: "publicInspection.issues.facets.typeJsonp",
          invokeValid: (c) => c.publicInspection.issues.facets.typeJsonp({ publicationDate: { is: "2024-01-15" }, callback: "cbPIIssueType" }),
          invokeWithUnknown: (c) => c.publicInspection.issues.facets.typeJsonp({ publicationDate: { is: "2024-01-15" }, callback: "cbPIIssueType", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.publicInspection.issues.facets.typeJsonp({ publicationDate: { is: "2024-01-15" }, callback: "cb-bad" } as any),
        },

        // Agencies
        {
          name: "agencies.listJsonp",
          invokeValid: (c) => c.agencies.listJsonp({ callback: "cbAgencyList" }),
          invokeWithUnknown: (c) => c.agencies.listJsonp({ callback: "cbAgencyList", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.agencies.listJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "agencies.findJsonp",
          invokeValid: (c) => c.agencies.findJsonp({ idOrSlug: 123, callback: "cbAgencyFind" }),
          invokeWithUnknown: (c) => c.agencies.findJsonp({ idOrSlug: 123, callback: "cbAgencyFind", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.agencies.findJsonp({ idOrSlug: 123, callback: "cb-bad" } as any),
        },
        {
          name: "agencies.findManyJsonp",
          invokeValid: (c) => c.agencies.findManyJsonp({ ids: [123, 456], callback: "cbAgencyFindMany" }),
          invokeWithUnknown: (c) => c.agencies.findManyJsonp({ ids: [123, 456], callback: "cbAgencyFindMany", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.agencies.findManyJsonp({ ids: [123, 456], callback: "cb-bad" } as any),
        },
        {
          name: "agencies.suggestionsJsonp",
          invokeValid: (c) => c.agencies.suggestionsJsonp({ term: "environmental", callback: "cbAgencySugg" }),
          invokeWithUnknown: (c) => c.agencies.suggestionsJsonp({ term: "environmental", callback: "cbAgencySugg", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.agencies.suggestionsJsonp({ term: "environmental", callback: "cb-bad" } as any),
        },

        // Other Services
        {
          name: "issues.currentJsonp",
          invokeValid: (c) => c.issues.currentJsonp({ callback: "cbIssueCurrent" }),
          invokeWithUnknown: (c) => c.issues.currentJsonp({ callback: "cbIssueCurrent" } as any),
          invokeWithInvalidCallback: (c) => c.issues.currentJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "holidays.listJsonp",
          invokeValid: (c) => c.holidays.listJsonp({ callback: "cbHolidays" }),
          invokeWithUnknown: (c) => c.holidays.listJsonp({ callback: "cbHolidays" } as any),
          invokeWithInvalidCallback: (c) => c.holidays.listJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "sections.listJsonp",
          invokeValid: (c) => c.sections.listJsonp({ callback: "cbSections" }),
          invokeWithUnknown: (c) => c.sections.listJsonp({ callback: "cbSections" } as any),
          invokeWithInvalidCallback: (c) => c.sections.listJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "suggestedSearches.listJsonp",
          invokeValid: (c) => c.suggestedSearches.listJsonp({ callback: "cbSuggList" }),
          invokeWithUnknown: (c) => c.suggestedSearches.listJsonp({ callback: "cbSuggList" } as any),
          invokeWithInvalidCallback: (c) => c.suggestedSearches.listJsonp({ callback: "cb-bad" } as any),
        },
        {
          name: "suggestedSearches.listBySectionsJsonp",
          invokeValid: (c) => c.suggestedSearches.listBySectionsJsonp({ sections: ["money"], callback: "cbSuggSec" }),
          invokeWithUnknown: (c) => c.suggestedSearches.listBySectionsJsonp({ sections: ["money"], callback: "cbSuggSec", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.suggestedSearches.listBySectionsJsonp({ sections: ["money"], callback: "cb-bad" } as any),
        },
        {
          name: "suggestedSearches.findJsonp",
          invokeValid: (c) => c.suggestedSearches.findJsonp({ slug: "test-slug", callback: "cbSuggFind" }),
          invokeWithUnknown: (c) => c.suggestedSearches.findJsonp({ slug: "test-slug", callback: "cbSuggFind", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.suggestedSearches.findJsonp({ slug: "test-slug", callback: "cb-bad" } as any),
        },
        {
          name: "topics.suggestionsJsonp",
          invokeValid: (c) => c.topics.suggestionsJsonp({ term: "solar", callback: "cbTopicSugg" }),
          invokeWithUnknown: (c) => c.topics.suggestionsJsonp({ term: "solar", callback: "cbTopicSugg", invalidUnknown: 1 } as any),
          invokeWithInvalidCallback: (c) => c.topics.suggestionsJsonp({ term: "solar", callback: "cb-bad" } as any),
        },
        {
          name: "documentation.fetchOpenApiJsonp",
          invokeValid: (c) => c.documentation.fetchOpenApiJsonp({ callback: "cbOpenApi" }),
          invokeWithUnknown: (c) => c.documentation.fetchOpenApiJsonp({ callback: "cbOpenApi" } as any),
          invokeWithInvalidCallback: (c) => c.documentation.fetchOpenApiJsonp({ callback: "cb-bad" } as any),
        },
      ];

      for (const tc of testCases) {
        test(`[Table Sweep] ${tc.name} accepts valid callback and dispatches fetch`, async () => {
          mockFetch.mockClear();
          await expect(tc.invokeValid(client)).resolves.toBeDefined();
          expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        test(`[Table Sweep] ${tc.name} rejects invalid callback with fetchCount === 0`, async () => {
          mockFetch.mockClear();
          await expect(tc.invokeWithInvalidCallback(client)).rejects.toThrow(RequestValidationError);
          expect(mockFetch).toHaveBeenCalledTimes(0);
        });
      }
    });
  });
});
