import { FederalRegisterClient } from "../src/core/client";
import {
  FederalRegisterSearchValidationError,
  FederalRegisterHttpError,
  PublicInspectionIssueConditionError,
} from "../src/core/errors";
import type {
  DocumentFacetParams,
  PublicInspectionFacetParams,
  PublicInspectionIssueDailyFacetParams,
  PublicInspectionIssueTypeFacetParams,
} from "../src/request/types";
import type {
  DocumentAgencyFacetMap,
  DocumentTopicFacetMap,
  DocumentSectionFacetMap,
  DocumentTypeFacetMap,
  DocumentSubtypeFacetMap,
  DocumentDailyFacetMap,
  DocumentWeeklyFacetMap,
  DocumentMonthlyFacetMap,
  DocumentQuarterlyFacetMap,
  DocumentYearlyFacetMap,
  PublicInspectionTypeFacetMap,
  PublicInspectionAgencyIdFacetMap,
  PublicInspectionAgencySlugFacetMap,
  PublicInspectionIssueDailyFacetMap,
  PublicInspectionIssueTypeFacetMap,
} from "../src/services/models";

describe("R2-05 Facets & Aggregations (15 Operations) Contract Suite", () => {
  let capturedUrls: string[] = [];
  let mockFetch: typeof fetch;

  beforeEach(() => {
    capturedUrls = [];
  });

  const createClient = (
    responseBody: any,
    responseStatus: number = 200,
    headers: Record<string, string> = { "content-type": "application/json" }
  ) => {
    mockFetch = jest.fn().mockImplementation(async (url: any) => {
      capturedUrls.push(url.toString());
      return new Response(
        typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody),
        {
          status: responseStatus,
          headers,
        }
      );
    });
    return new FederalRegisterClient({
      baseUrl: "https://www.federalregister.gov/api/v1",
      fetch: mockFetch,
    });
  };

  // =========================================================================
  // 1. Document Facets (10 Operations: fr.documents.facets.*)
  // =========================================================================
  describe("1. Document Facets (10 operations)", () => {
    test("1.1 fr.documents.facets.agency - suffixless route and condition serialization", async () => {
      const mockResult: DocumentAgencyFacetMap = {
        "environmental-protection-agency": { count: 42, name: "Environmental Protection Agency" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.agency({
        conditions: { term: "clean air", types: ["RULE"] },
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/facets/agency?conditions%5Bterm%5D=clean%20air&conditions%5Btype%5D%5B%5D=RULE"
      );
      expect(capturedUrls[0]).not.toContain(".json");
      expect(res).toEqual(mockResult);
    });

    test("1.1b fr.documents.facets.agency - self-filter retained and cross-field condition serialization", async () => {
      const mockResult: DocumentAgencyFacetMap = {
        "national-archives-records-administration": { count: 12, name: "National Archives and Records Administration" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.agency({
        conditions: {
          agencies: ["national-archives-records-administration"],
          term: "records",
        },
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/facets/agency?conditions%5Bterm%5D=records&conditions%5Bagencies%5D%5B%5D=national-archives-records-administration"
      );
      expect(capturedUrls[0]).toContain("conditions%5Bagencies%5D%5B%5D=national-archives-records-administration");
      expect(capturedUrls[0]).toContain("conditions%5Bterm%5D=records");
      expect(res).toEqual(mockResult);
    });

    test("1.2 fr.documents.facets.topic - suffixless route", async () => {
      const mockResult: DocumentTopicFacetMap = {
        "air-pollution": { count: 15, name: "Air pollution control" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.topic();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documents/facets/topic");
      expect(res).toEqual(mockResult);
    });

    test("1.3 fr.documents.facets.section - suffixless route", async () => {
      const mockResult: DocumentSectionFacetMap = {
        environment: { count: 88, name: "Environment" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.section({
        conditions: { publicationDate: { year: 2024 } },
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/facets/section?conditions%5Bpublication_date%5D%5Byear%5D=2024"
      );
      expect(res).toEqual(mockResult);
    });

    test("1.4 fr.documents.facets.type - suffixless route and self-filter retained", async () => {
      const mockResult: DocumentTypeFacetMap = {
        RULE: { count: 120, name: "Rule" },
        PRORULE: { count: 45, name: "Proposed Rule" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.type({
        conditions: { types: ["RULE"] },
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/facets/type?conditions%5Btype%5D%5B%5D=RULE"
      );
      expect(res).toEqual(mockResult);
    });

    test("1.5 fr.documents.facets.subtype - suffixless route and frozen subtype key", async () => {
      const mockResult: DocumentSubtypeFacetMap = {
        executive_order: { count: 12, name: "Executive Order" },
        proclamation: { count: 5, name: "Proclamation" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.subtype({
        conditions: { presidents: ["william-j-clinton"] },
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/facets/subtype?conditions%5Bpresident%5D%5B%5D=william-j-clinton"
      );
      expect(res).toEqual(mockResult);
    });

    test("1.6 fr.documents.facets.daily - suffixless route and DateFacetMap return with zero count bucket", async () => {
      const mockResult: DocumentDailyFacetMap = {
        "2026-09-15": { count: 25, name: "09/15/2026" },
        "2026-09-16": { count: 0, name: "09/16/2026" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.daily();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documents/facets/daily");
      expect(res).toEqual(mockResult);
      expect(res["2026-09-16"].count).toBe(0);
    });

    test("1.7 fr.documents.facets.weekly - suffixless route and Monday-oriented format", async () => {
      const mockResult: DocumentWeeklyFacetMap = {
        "2026-09-14": { count: 110, name: "2026 Week 37" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.weekly();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documents/facets/weekly");
      expect(res).toEqual(mockResult);
    });

    test("1.8 fr.documents.facets.monthly - suffixless route and anchor date format", async () => {
      const mockResult: DocumentMonthlyFacetMap = {
        "2026-01-15": { count: 450, name: "January 2026" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.monthly();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documents/facets/monthly");
      expect(res).toEqual(mockResult);
    });

    test("1.9 fr.documents.facets.quarterly - suffixless route and quarter-start format", async () => {
      const mockResult: DocumentQuarterlyFacetMap = {
        "2026-07-01": { count: 1250, name: "Q3 2026" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.quarterly();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documents/facets/quarterly");
      expect(res).toEqual(mockResult);
    });

    test("1.10 fr.documents.facets.yearly - suffixless route and Jan 1 format", async () => {
      const mockResult: DocumentYearlyFacetMap = {
        "2026-01-01": { count: 5200, name: "2026" },
      };
      const client = createClient(mockResult);

      const res = await client.documents.facets.yearly();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documents/facets/yearly");
      expect(res).toEqual(mockResult);
    });

    test("1.11 Valid empty map resolves without error for Document field facet", async () => {
      const client = createClient({});
      const res = await client.documents.facets.agency();
      expect(res).toEqual({});
    });

    test("1.12 Document facets propagate SearchValidationError on HTTP 400 with errors payload", async () => {
      const mockErrorPayload = {
        errors: { "conditions[term]": "Unmatched quote" },
      };
      const client = createClient(mockErrorPayload, 400);

      await expect(
        client.documents.facets.agency({ conditions: { term: '"unclosed quote' } })
      ).rejects.toThrow(FederalRegisterSearchValidationError);
    });

    test("1.13 Document ordinary facet does NOT throw PublicInspectionIssueConditionError on HTTP 200 { status: 400, error }", async () => {
      const quirkLikePayload = {
        status: 400,
        error: "Some condition error string",
      };
      const client = createClient(quirkLikePayload, 200);

      const res = await client.documents.facets.type();
      expect(res).toEqual(quirkLikePayload);
    });
  });

  // =========================================================================
  // 2. Public Inspection Document Facets (3 Operations: fr.publicInspection.facets.*)
  // =========================================================================
  describe("2. Public Inspection Document Facets (3 operations)", () => {
    test("2.1 fr.publicInspection.facets.type - suffixless route", async () => {
      const mockResult: PublicInspectionTypeFacetMap = {
        RULE: { count: 10, name: "Rule" },
      };
      const client = createClient(mockResult);

      const res = await client.publicInspection.facets.type();
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents/facets/type"
      );
      expect(res).toEqual(mockResult);
    });

    test("2.2 fr.publicInspection.facets.agency - Agency ID-based key domain and self-filter retained", async () => {
      const mockResult: PublicInspectionAgencyIdFacetMap = {
        "42": { count: 3, name: "Department of Agriculture" },
      };
      const client = createClient(mockResult);

      const res = await client.publicInspection.facets.agency({
        conditions: { agencyIds: [123], specialFiling: true },
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents/facets/agency?conditions%5Bagency_ids%5D%5B%5D=123&conditions%5Bspecial_filing%5D=1"
      );
      expect(res).toEqual(mockResult);
    });

    test("2.3 fr.publicInspection.facets.agencies - Agency slug-based key domain and self-filter retained", async () => {
      const mockResult: PublicInspectionAgencySlugFacetMap = {
        "environmental-protection-agency": { count: 5, name: "Environmental Protection Agency" },
      };
      const client = createClient(mockResult);

      const res = await client.publicInspection.facets.agencies({
        conditions: {
          agencies: ["environmental-protection-agency"],
          specialFiling: false,
        },
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents/facets/agencies?conditions%5Bagencies%5D%5B%5D=environmental-protection-agency&conditions%5Bspecial_filing%5D=0"
      );
      expect(res).toEqual(mockResult);
    });

    test("2.4 Valid empty map resolves without error for PI Document field facet", async () => {
      const client = createClient({});
      const res = await client.publicInspection.facets.type();
      expect(res).toEqual({});
    });

    test("2.5 PI Document facets propagate SearchValidationError on HTTP 400 with errors payload", async () => {
      const mockErrorPayload = {
        errors: { "conditions[term]": "Invalid query syntax" },
      };
      const client = createClient(mockErrorPayload, 400);

      await expect(
        client.publicInspection.facets.agencies({ conditions: { term: "bad" } })
      ).rejects.toThrow(FederalRegisterSearchValidationError);
    });

    test("2.6 PI Document ordinary facet does NOT throw PublicInspectionIssueConditionError on HTTP 200 { status: 400, error }", async () => {
      const quirkLikePayload = {
        status: 400,
        error: "Some condition error string",
      };
      const client = createClient(quirkLikePayload, 200);

      const res = await client.publicInspection.facets.agency();
      expect(res).toEqual(quirkLikePayload);
    });
  });

  // =========================================================================
  // 3. Public Inspection Issue Facets (2 Operations: fr.publicInspection.issues.facets.*)
  // =========================================================================
  describe("3. Public Inspection Issue Facets (2 operations)", () => {
    test("3.1 fr.publicInspection.issues.facets.daily - requires publicationDate.gte and serializes correctly", async () => {
      const mockResult: PublicInspectionIssueDailyFacetMap = {
        "2026-09-15": {
          special_filings: {
            last_updated_at: "2026-09-15T08:45:00Z",
            documents: 2,
            agencies: 1,
          },
          regular_filings: {
            last_updated_at: "2026-09-15T08:45:00Z",
            documents: 15,
            agencies: 8,
          },
        },
      };
      const client = createClient(mockResult);

      const res = await client.publicInspection.issues.facets.daily({
        publicationDate: { gte: "2026-09-01" },
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-issues/facets/daily?conditions%5Bpublication_date%5D%5Bgte%5D=2026-09-01"
      );
      expect(capturedUrls[0]).not.toContain(".json");
      expect(res).toEqual(mockResult);
    });

    test("3.1 fr.publicInspection.issues.facets.daily - recognizes HTTP 200 with { status: 400, error: string } as PublicInspectionIssueConditionError", async () => {
      const quirkErrorPayload = {
        status: 400,
        error: "conditions[publication_date][gte] is required",
      };
      const client = createClient(quirkErrorPayload, 200);

      await expect(
        client.publicInspection.issues.facets.daily({
          publicationDate: { gte: "2026-09-01" },
        })
      ).rejects.toThrow(PublicInspectionIssueConditionError);
    });

    test("3.2 fr.publicInspection.issues.facets.type - requires publicationDate.is and serializes correctly", async () => {
      const mockResult: PublicInspectionIssueTypeFacetMap = {
        "2026-09-15": {
          special_filings: {
            RULE: { count: 1, name: "Rule" },
          },
          regular_filings: {
            RULE: { count: 8, name: "Rule" },
            NOTICE: { count: 7, name: "Notice" },
          },
        },
      };
      const client = createClient(mockResult);

      const res = await client.publicInspection.issues.facets.type({
        publicationDate: { is: "2026-09-15" },
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-issues/facets/type?conditions%5Bpublication_date%5D%5Bis%5D=2026-09-15"
      );
      expect(capturedUrls[0]).not.toContain(".json");
      expect(res).toEqual(mockResult);
    });

    test("3.2 fr.publicInspection.issues.facets.type - recognizes HTTP 200 with { status: 400, error: string } as PublicInspectionIssueConditionError", async () => {
      const quirkErrorPayload = {
        status: 400,
        error: "conditions[publication_date][is] is required",
      };
      const client = createClient(quirkErrorPayload, 200);

      try {
        await client.publicInspection.issues.facets.type({
          publicationDate: { is: "2026-09-15" },
        });
        fail("Expected PublicInspectionIssueConditionError to be thrown");
      } catch (err: any) {
        expect(err).toBeInstanceOf(PublicInspectionIssueConditionError);
        expect(err.httpStatus).toBe(200);
        expect(err.payload).toEqual(quirkErrorPayload);
        expect(err.message).toContain("conditions[publication_date][is] is required");
      }
    });

    test("3.3 Valid empty map resolves without error for PI Issue type facet (no-matching-issue case)", async () => {
      const client = createClient({});
      const res = await client.publicInspection.issues.facets.type({
        publicationDate: { is: "2026-09-15" },
      });
      expect(res).toEqual({});
    });

    test("3.4 Standard HTTP non-2xx errors throw FederalRegisterHttpError", async () => {
      const client = createClient("Internal Server Error", 500, { "content-type": "text/plain" });

      await expect(
        client.publicInspection.issues.facets.daily({
          publicationDate: { gte: "2026-09-01" },
        })
      ).rejects.toThrow(FederalRegisterHttpError);
    });
  });

  // =========================================================================
  // 4. Negative Boundaries and Forbidden Control Leakage Verification
  // =========================================================================
  describe("4. Negative Boundaries and Forbidden Control Leakage Verification", () => {
    test("Compile-time / type boundary contracts forbid page, perPage, fields, size in facet params", () => {
      // Type-level assertion checks ensuring invalid fields produce type errors if attempted:
      type DocFacetHasPage = "page" extends keyof DocumentFacetParams ? true : false;
      type DocFacetHasPerPage = "perPage" extends keyof DocumentFacetParams ? true : false;
      type DocFacetHasFields = "fields" extends keyof DocumentFacetParams ? true : false;
      type DocFacetHasSize = "size" extends keyof DocumentFacetParams ? true : false;
      type DocFacetHasFacetSize = "facetSize" extends keyof DocumentFacetParams ? true : false;

      const docPage: DocFacetHasPage = false;
      const docPerPage: DocFacetHasPerPage = false;
      const docFields: DocFacetHasFields = false;
      const docSize: DocFacetHasSize = false;
      const docFacetSize: DocFacetHasFacetSize = false;

      expect(docPage).toBe(false);
      expect(docPerPage).toBe(false);
      expect(docFields).toBe(false);
      expect(docSize).toBe(false);
      expect(docFacetSize).toBe(false);

      type PIFacetHasPage = "page" extends keyof PublicInspectionFacetParams ? true : false;
      type PIFacetHasPerPage = "perPage" extends keyof PublicInspectionFacetParams ? true : false;
      type PIFacetHasFields = "fields" extends keyof PublicInspectionFacetParams ? true : false;
      type PIFacetHasSize = "size" extends keyof PublicInspectionFacetParams ? true : false;

      const piPage: PIFacetHasPage = false;
      const piPerPage: PIFacetHasPerPage = false;
      const piFields: PIFacetHasFields = false;
      const piSize: PIFacetHasSize = false;

      expect(piPage).toBe(false);
      expect(piPerPage).toBe(false);
      expect(piFields).toBe(false);
      expect(piSize).toBe(false);
    });

    test("Prohibits unauthorized future alternate formats, generic facet escapes, and resources in R2-05", () => {
      const client = new FederalRegisterClient();

      // Generic facet(name) method prohibited on services and sub-namespaces
      expect((client.documents as any).facet).toBeUndefined();
      expect((client.publicInspection as any).facet).toBeUndefined();
      expect((client.documents.facets as any).facet).toBeUndefined();
      expect((client.publicInspection.facets as any).facet).toBeUndefined();
      expect((client.publicInspection.issues.facets as any).facet).toBeUndefined();

      // Alternate formats (CSV/RSS) deferred to R2-06
      expect((client.documents as any).findCsv).toBeUndefined();
      expect((client.documents as any).searchCsv).toBeUndefined();
      expect((client.documents as any).searchRss).toBeUndefined();
      expect((client.publicInspection as any).currentCsv).toBeUndefined();
      expect((client.publicInspection as any).searchCsv).toBeUndefined();
      expect((client.publicInspection as any).searchRss).toBeUndefined();

      // Deferred resources deferred to R2-06
      expect((client as any).topics).toBeUndefined();
      expect((client as any).sections).toBeUndefined();
      expect((client as any).suggestedSearches).toBeUndefined();
      expect((client as any).holidays).toBeUndefined();
      expect((client as any).effectiveDates).toBeUndefined();
      expect((client as any).issues).toBeUndefined();
      expect((client as any).images).toBeUndefined();
      expect((client as any).categoryCounts).toBeUndefined();
      expect((client as any).siteNotifications).toBeUndefined();
      expect((client as any).documentation).toBeUndefined();
      expect((client as any).clippings).toBeUndefined();
    });
  });
});
