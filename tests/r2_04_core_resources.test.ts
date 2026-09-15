import { FederalRegisterClient } from "../src/core/client";
import {
  FederalRegisterSearchValidationError,
  FederalRegisterHttpError,
  FederalRegisterAgencyNotFoundError,
} from "../src/core/errors";
import type {
  DocumentSearchParams,
  DocumentFindParams,
  DocumentFindManyParams,
  DocumentCitationFindParams,
  DocumentCitationFindManyParams,
  DocumentAutocompleteParams,
  DocumentSearchDetailsParams,
  AgencyListParams,
  AgencyFindParams,
  AgencyFindManyParams,
  AgencySuggestionsParams,
  PublicInspectionSearchParams,
  PublicInspectionAvailableOnParams,
  PublicInspectionCurrentParams,
  PublicInspectionFindParams,
  PublicInspectionFindManyParams,
  PublicInspectionSearchDetailsParams,
} from "../src/request/types";

describe("R2-04 Core Resource Families (17 Operations) Suite", () => {
  let capturedUrls: string[] = [];
  let mockFetch: typeof fetch;

  beforeEach(() => {
    capturedUrls = [];
  });

  const createClient = (responseBody: any, responseStatus: number = 200, headers: Record<string, string> = { "content-type": "application/json" }) => {
    mockFetch = jest.fn().mockImplementation(async (url: any) => {
      capturedUrls.push(url.toString());
      return new Response(typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody), {
        status: responseStatus,
        headers,
      });
    });
    return new FederalRegisterClient({
      baseUrl: "https://www.federalregister.gov/api/v1",
      fetch: mockFetch,
    });
  };

  // =========================================================================
  // 1. Documents Service (7 operations)
  // =========================================================================
  describe("1. Documents Service", () => {
    test("1.1 fr.documents.search - route, query serialization, and envelope return", async () => {
      const mockResult = {
        count: 1,
        total_pages: 1,
        results: [{ document_number: "2026-0001", title: "Test Rule" }],
      };
      const client = createClient(mockResult);

      const res = await client.documents.search({
        conditions: { term: "Delegations", types: ["RULE"] },
        perPage: 10,
        page: 2,
        order: "newest",
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = capturedUrls[0];
      expect(calledUrl).toContain("https://www.federalregister.gov/api/v1/documents.json?");
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("per_page=10");
      expect(calledUrl).toContain("order=newest");
      expect(calledUrl).toContain("conditions%5Bterm%5D=Delegations");
      expect(calledUrl).toContain("conditions%5Btype%5D%5B%5D=RULE");
      expect(res).toEqual(mockResult);
    });

    test("1.1 fr.documents.search - throws FederalRegisterSearchValidationError on 400 validation error", async () => {
      const mockErrorPayload = {
        errors: { "conditions[term]": "Invalid query syntax" },
      };
      const client = createClient(mockErrorPayload, 400);

      await expect(client.documents.search({ conditions: { term: "bad" } }))
        .rejects
        .toThrow(FederalRegisterSearchValidationError);
    });

    test("1.2 fr.documents.find - single document lookup", async () => {
      const mockDoc = { document_number: "2026-12345", title: "Show Doc" };
      const client = createClient(mockDoc);

      const res = await client.documents.find({
        documentNumber: "2026-12345",
        fields: ["document_number", "title"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/2026-12345.json?fields%5B%5D=document_number&fields%5B%5D=title"
      );
      expect(res).toEqual(mockDoc);
    });

    test("1.3 fr.documents.findMany - multi-lookup partial success envelope resolved (not thrown)", async () => {
      const mockEnvelope = {
        count: 1,
        results: [{ document_number: "2026-11111", title: "Found Doc" }],
        errors: { not_found: ["2026-99999"] },
      };
      const client = createClient(mockEnvelope);

      const res = await client.documents.findMany({
        documentNumbers: ["2026-11111", "2026-99999"],
        fields: ["document_number", "title"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/2026-11111,2026-99999.json?fields%5B%5D=document_number&fields%5B%5D=title"
      );
      expect(res.count).toBe(1);
      expect(res.results).toHaveLength(1);
      expect(res.errors?.not_found).toEqual(["2026-99999"]);
    });

    test("1.4 fr.documents.findByCitation - single citation lookup uses {volume}%20FR%20{page}.json and returns MultiLookupEnvelope", async () => {
      const mockEnvelope = {
        count: 1,
        results: [{ citation: "91 FR 58007", document_number: "2026-18739" }],
      };
      const client = createClient(mockEnvelope);

      const res = await client.documents.findByCitation({
        citation: { volume: 91, page: 58007 },
        fields: ["citation", "document_number"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/91%20FR%2058007.json?fields%5B%5D=citation&fields%5B%5D=document_number"
      );
      expect(res.count).toBe(1);
      expect(res.results[0].citation).toBe("91 FR 58007");
    });

    test("1.5 fr.documents.findManyByCitation - multiple citations lookup returns MultiLookupEnvelope with partial success", async () => {
      const mockEnvelope = {
        count: 1,
        results: [{ citation: "91 FR 58007", document_number: "2026-18739" }],
        errors: { not_found: ["99 FR 99999"] },
      };
      const client = createClient(mockEnvelope);

      const res = await client.documents.findManyByCitation({
        citations: [
          { volume: 91, page: 58007 },
          { volume: 99, page: 99999 },
        ],
        fields: ["citation", "document_number"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/91%2F58007,99%2F99999.json?fields%5B%5D=citation&fields%5B%5D=document_number"
      );
      expect(res.count).toBe(1);
      expect(res.errors?.not_found).toEqual(["99 FR 99999"]);
    });

    test("1.6 fr.documents.autocomplete - autocomplete suggestions", async () => {
      const mockSuggestions = [
        { document_number: "2026-0001", search_term_completion: "Delegations of Authority", entry_type: "Notice" },
      ];
      const client = createClient(mockSuggestions);

      const res = await client.documents.autocomplete({ term: "Delegations" });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents/autocomplete-suggestions?conditions%5Bterm%5D=Delegations"
      );
      expect(res).toEqual(mockSuggestions);
    });

    test("1.7 fr.documents.searchDetails - document search details", async () => {
      const mockDetails = {
        suggestions: {
          citation: { document_numbers: ["2026-18739"], volume: 91, page: 58007 },
        },
        filters: {},
      };
      const client = createClient(mockDetails);

      const res = await client.documents.searchDetails({
        conditions: { term: "91 FR 58007" },
        omitSpellingSuggestions: true,
      });

      expect(capturedUrls[0]).toContain("https://www.federalregister.gov/api/v1/documents/search-details?");
      expect(capturedUrls[0]).toContain("omit_spelling_suggestions=1");
      expect(capturedUrls[0]).toContain("conditions%5Bterm%5D=91%20FR%2058007");
      expect(res).toEqual(mockDetails);
    });
  });

  // =========================================================================
  // 2. Public Inspection Service (6 operations)
  // =========================================================================
  describe("2. Public Inspection Service", () => {
    test("2.1 fr.publicInspection.search - PI search", async () => {
      const mockResult = {
        count: 1,
        total_pages: 1,
        results: [{ document_number: "2026-18583", title: "PI Title" }],
      };
      const client = createClient(mockResult);

      const res = await client.publicInspection.search({
        conditions: { term: "Blackspotted" },
        fields: ["document_number", "title"],
      });

      expect(capturedUrls[0]).toContain("https://www.federalregister.gov/api/v1/public-inspection-documents.json?");
      expect(capturedUrls[0]).toContain("conditions%5Bterm%5D=Blackspotted");
      expect(capturedUrls[0]).toContain("fields%5B%5D=document_number");
      expect(res).toEqual(mockResult);
    });

    test("2.2 fr.publicInspection.availableOn - issue-date retrieval returns PublicInspectionIssueDocumentsEnvelope", async () => {
      const mockEnvelope = {
        count: 1,
        results: [{ document_number: "2026-18583" }],
        special_filings_updated_at: "2026-09-11T12:00:00Z",
        regular_filings_updated_at: "2026-09-11T12:00:00Z",
      };
      const client = createClient(mockEnvelope);

      const res = await client.publicInspection.availableOn({
        availableOn: "2026-09-11",
        fields: ["document_number"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents.json?conditions%5Bavailable_on%5D=2026-09-11&fields%5B%5D=document_number"
      );
      expect(res.count).toBe(1);
      expect((res as any).special_filings_updated_at).toBe("2026-09-11T12:00:00Z");
    });

    test("2.3 fr.publicInspection.current - current PI documents returns PublicInspectionIssueDocumentsEnvelope", async () => {
      const mockEnvelope = {
        count: 1,
        results: [{ document_number: "2026-18583" }],
        special_filings_updated_at: null,
        regular_filings_updated_at: "2026-09-11T12:00:00Z",
      };
      const client = createClient(mockEnvelope);

      const res = await client.publicInspection.current({
        fields: ["document_number"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents/current.json?fields%5B%5D=document_number"
      );
      expect(res.count).toBe(1);
    });

    test("2.4 fr.publicInspection.find - single PI document lookup", async () => {
      const mockDoc = { document_number: "2026-18583", title: "Single PI" };
      const client = createClient(mockDoc);

      const res = await client.publicInspection.find({
        documentNumber: "2026-18583",
        fields: ["document_number", "title"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents/2026-18583.json?fields%5B%5D=document_number&fields%5B%5D=title"
      );
      expect(res).toEqual(mockDoc);
    });

    test("2.5 fr.publicInspection.findMany - multi PI lookup partial success envelope resolved", async () => {
      const mockEnvelope = {
        count: 1,
        results: [{ document_number: "2026-18583" }],
        errors: { not_found: ["2026-99999"] },
      };
      const client = createClient(mockEnvelope);

      const res = await client.publicInspection.findMany({
        documentNumbers: ["2026-18583", "2026-99999"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents/2026-18583,2026-99999.json"
      );
      expect(res.count).toBe(1);
      expect(res.errors?.not_found).toEqual(["2026-99999"]);
    });

    test("2.6 fr.publicInspection.searchDetails - PI search details (suggestions always {})", async () => {
      const mockDetails = {
        suggestions: {},
        filters: {},
      };
      const client = createClient(mockDetails);

      const res = await client.publicInspection.searchDetails({
        conditions: { term: "Blackspotted" },
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents/search-details?conditions%5Bterm%5D=Blackspotted"
      );
      expect(res.suggestions).toEqual({});
    });
  });

  // =========================================================================
  // 3. Agencies Service (4 operations)
  // =========================================================================
  describe("3. Agencies Service", () => {
    test("3.1 fr.agencies.list - list agencies", async () => {
      const mockAgencies = [
        { id: 1, name: "Agency 1", json_url: "https://api/agencies/1.json" },
      ];
      const client = createClient(mockAgencies);

      const res = await client.agencies.list({ fields: ["id", "name"] });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/agencies.json?fields%5B%5D=id&fields%5B%5D=name"
      );
      expect(res).toEqual(mockAgencies);
    });

    test("3.2 fr.agencies.find - single agency lookup by ID or slug", async () => {
      const mockAgency = { id: 557, name: "National Archives", slug: "national-archives" };
      const client = createClient(mockAgency);

      const res = await client.agencies.find({ idOrSlug: 557 });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/agencies/557.json"
      );
      expect(res).toEqual(mockAgency);
    });

    test("3.2 fr.agencies.find - throws FederalRegisterAgencyNotFoundError on 404 { error: 404 }", async () => {
      const client = createClient({ error: 404 }, 404);

      await expect(client.agencies.find({ idOrSlug: "nonexistent-agency" }))
        .rejects
        .toThrow(FederalRegisterAgencyNotFoundError);
    });

    test("3.3 fr.agencies.findMany - multi agency lookup returns plain array (no MultiLookupEnvelope)", async () => {
      const mockAgencies = [
        { id: 557, name: "National Archives" },
        { id: 2, name: "Agriculture Department" },
      ];
      const client = createClient(mockAgencies);

      const res = await client.agencies.findMany({
        ids: [557, 2],
        fields: ["id", "name"],
      });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/agencies/557,2.json?fields%5B%5D=id&fields%5B%5D=name"
      );
      expect(Array.isArray(res)).toBe(true);
      expect(res).toHaveLength(2);
      expect((res as any).count).toBeUndefined(); // Plain array, not envelope!
    });

    test("3.4 fr.agencies.suggestions - agency suggestions by term", async () => {
      const mockSuggestions = [
        { id: 557, name: "National Archives", slug: "national-archives" },
      ];
      const client = createClient(mockSuggestions);

      const res = await client.agencies.suggestions({ term: "archives" });

      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/agencies/suggestions?conditions%5Bterm%5D=archives"
      );
      expect(res).toEqual(mockSuggestions);
    });
  });

  // =========================================================================
  // 4. Instance Isolation & Client Binding
  // =========================================================================
  describe("4. Instance Isolation", () => {
    test("Resource namespaces remain strictly bound to their originating client instance", async () => {
      const callsA: string[] = [];
      const callsB: string[] = [];

      const fetchA: typeof fetch = jest.fn().mockImplementation(async (url: any) => {
        callsA.push(url.toString());
        return new Response(JSON.stringify({ client: "A", count: 1, results: [] }), { status: 200 });
      });

      const fetchB: typeof fetch = jest.fn().mockImplementation(async (url: any) => {
        callsB.push(url.toString());
        return new Response(JSON.stringify({ client: "B", count: 1, results: [] }), { status: 200 });
      });

      const clientA = new FederalRegisterClient({ baseUrl: "https://api-a.example.com", fetch: fetchA });
      const clientB = new FederalRegisterClient({ baseUrl: "https://api-b.example.org", fetch: fetchB });

      const resA = await clientA.documents.search();
      const resB = await clientB.agencies.list();

      expect((resA as any).client).toBe("A");
      expect((resB as any).client).toBe("B");

      expect(callsA[0]).toContain("https://api-a.example.com/documents.json");
      expect(callsB[0]).toContain("https://api-b.example.org/agencies.json");

      expect(fetchA).toHaveBeenCalledTimes(1);
      expect(fetchB).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // 5. Negative Phase-Leak Verification
  // =========================================================================
  describe("5. Negative Phase-Leak Verification", () => {
    test("Prohibits unauthorized facet or alternate-format methods in R2-04", () => {
      const client = new FederalRegisterClient();

      // Facets are deferred to R2-05
      expect((client.documents as any).facets).toBeUndefined();
      expect((client.publicInspection as any).facets).toBeUndefined();
      expect((client.publicInspection as any).issues).toBeUndefined();

      // CSV and RSS are deferred to R2-06
      expect((client.documents as any).findCsv).toBeUndefined();
      expect((client.documents as any).searchCsv).toBeUndefined();
      expect((client.documents as any).searchRss).toBeUndefined();
      expect((client.publicInspection as any).currentCsv).toBeUndefined();
      expect((client.publicInspection as any).searchCsv).toBeUndefined();
      expect((client.publicInspection as any).searchRss).toBeUndefined();

      // Other resource families are deferred to R2-06
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
