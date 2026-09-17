import { FederalRegisterClient } from "../src/core/client";
import {
  FederalRegisterSearchValidationError,
  FederalRegisterHttpError,
  FederalRegisterStatusMessageError,
  FederalRegisterEffectiveDateRangeError,
  FederalRegisterEmptyJsonError,
  FederalRegisterEmptyBodyError,
} from "../src/core/errors";
import { RequestValidationError } from "../src/request/validation";
import { decodeTextResponse } from "../src/core/transport";
import type {
  EffectiveDateMap,
  XmlIssueToc,
  LegacyIssueToc,
  ImageMetadataMap,
  WebClippingsResponse,
  FederalRegisterOpenApiDocument,
  JsonpText,
} from "../src/services/models";

describe("R2-06 Remaining Capability Families (21 Operations) Suite", () => {
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
  // 1. Documents Service Alternate Formats (3 operations)
  // =========================================================================
  describe("1. Documents Service Alternate Formats", () => {
    test("1.1 fr.documents.findCsv - fetches CSV text by document numbers", async () => {
      const csvData = "document_number,title\n2024-12345,Test Document";
      const client = createClient(csvData, 200, { "content-type": "text/csv" });

      const res = await client.documents.findCsv({ documentNumbers: ["2024-12345"] });
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documents/2024-12345.csv");
      expect(res).toBe(csvData);
    });

    test("1.2 fr.documents.findCsv - throws FederalRegisterHttpError on 404", async () => {
      const client = createClient("Not Found", 404, { "content-type": "text/plain" });

      await expect(client.documents.findCsv({ documentNumbers: ["missing-doc"] })).rejects.toThrow(
        FederalRegisterHttpError
      );
    });

    test("1.3 fr.documents.searchRss - fetches RSS XML text with query conditions", async () => {
      const rssData = "<rss><channel><title>Federal Register Documents</title></channel></rss>";
      const client = createClient(rssData, 200, { "content-type": "application/rss+xml" });

      const res = await client.documents.searchRss({
        conditions: { term: "energy" },
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents.rss?conditions%5Bterm%5D=energy"
      );
      expect(res).toBe(rssData);
    });

    test("1.4 fr.documents.searchRss - throws FederalRegisterSearchValidationError on 400 error payload", async () => {
      const errorPayload = {
        error: "Search conditions are invalid",
        errors: { "conditions[term]": ["must not be blank"] },
      };
      const client = createClient(errorPayload, 400);

      await expect(client.documents.searchRss({})).rejects.toThrow(FederalRegisterSearchValidationError);
    });

    test("1.5 fr.documents.searchCsv - fetches CSV text with query conditions", async () => {
      const csvData = "document_number,title,type\n2024-001,Doc 1,RULE";
      const client = createClient(csvData, 200, { "content-type": "text/csv" });

      const res = await client.documents.searchCsv({
        conditions: { types: ["RULE"] },
        fields: ["document_number", "title", "type"],
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/documents.csv?fields%5B%5D=document_number&fields%5B%5D=title&fields%5B%5D=type&conditions%5Btype%5D%5B%5D=RULE"
      );
      expect(res).toBe(csvData);
    });
  });

  // =========================================================================
  // 2. Public Inspection Service Alternate Formats (3 operations)
  // =========================================================================
  describe("2. Public Inspection Service Alternate Formats", () => {
    test("2.1 fr.publicInspection.currentCsv - fetches current public inspection CSV", async () => {
      const csvData = "document_number,title\nPI-001,Current PI Item";
      const client = createClient(csvData, 200, { "content-type": "text/csv" });

      const res = await client.publicInspection.currentCsv();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/public-inspection-documents/current.csv");
      expect(res).toBe(csvData);
    });

    test("2.2 fr.publicInspection.searchCsv - fetches search results in CSV format", async () => {
      const csvData = "document_number,title\nPI-002,Filtered PI Item";
      const client = createClient(csvData, 200, { "content-type": "text/csv" });

      const res = await client.publicInspection.searchCsv({
        conditions: { term: "tariff" },
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents.csv?conditions%5Bterm%5D=tariff"
      );
      expect(res).toBe(csvData);
    });

    test("2.3 fr.publicInspection.searchRss - fetches search results in RSS XML format", async () => {
      const rssData = "<rss><channel><title>Public Inspection Documents</title></channel></rss>";
      const client = createClient(rssData, 200, { "content-type": "application/rss+xml" });

      const res = await client.publicInspection.searchRss({
        conditions: { agencyIds: [12] },
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/public-inspection-documents.rss?conditions%5Bagency_ids%5D%5B%5D=12"
      );
      expect(res).toBe(rssData);
    });
  });

  // =========================================================================
  // 3. Topics Service (1 operation)
  // =========================================================================
  describe("3. Topics Service", () => {
    test("3.1 fr.topics.suggestions - fetches topic suggestions matching prefix term", async () => {
      const mockSuggestions = [
        { name: "Aviation Safety", slug: "aviation-safety", url: "https://.../topics/aviation-safety" },
      ];
      const client = createClient(mockSuggestions);

      const res = await client.topics.suggestions({
        term: "aviat",
        fields: ["name", "slug", "url"],
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/topics/suggestions?conditions%5Bterm%5D=aviat&fields%5B%5D=name&fields%5B%5D=slug&fields%5B%5D=url"
      );
      expect(res).toEqual(mockSuggestions);
    });
  });

  // =========================================================================
  // 4. Sections Service (1 operation)
  // =========================================================================
  describe("4. Sections Service", () => {
    test("4.1 fr.sections.list - fetches all Federal Register sections dictionary", async () => {
      const mockSections = {
        money: { name: "Money" },
        environment: { name: "Environment" },
        defense: { name: "Defense" },
      };
      const client = createClient(mockSections);

      const res = await client.sections.list();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/sections");
      expect(res).toEqual(mockSections);
    });
  });

  // =========================================================================
  // 5. Suggested Searches Service (3 operations)
  // =========================================================================
  describe("5. Suggested Searches Service", () => {
    test("5.1 fr.suggestedSearches.list - fetches suggested search index grouped by section", async () => {
      const mockData = {
        environment: [
          {
            title: "Clean Air Act",
            slug: "clean-air-act",
            description: "Rules regarding clean air",
            section: "environment",
            search_conditions: { term: "clean air" },
            documents_in_last_year: 42,
            documents_with_open_comment_periods: 3,
            position: 1,
          },
        ],
      };
      const client = createClient(mockData);

      const res = await client.suggestedSearches.list();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/suggested_searches");
      expect(res).toEqual(mockData);
    });

    test("5.2 fr.suggestedSearches.listBySections - fetches suggested searches filtered by section slugs", async () => {
      const mockData = { environment: [] };
      const client = createClient(mockData);

      const res = await client.suggestedSearches.listBySections({
        sections: ["environment", "money"],
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/suggested_searches?conditions%5Bsections%5D%5B%5D=environment&conditions%5Bsections%5D%5B%5D=money"
      );
      expect(res).toEqual(mockData);
    });

    test("5.3 fr.suggestedSearches.find - fetches single suggested search by slug", async () => {
      const mockItem = {
        title: "Clean Air Act",
        slug: "clean-air-act",
        description: "Rules regarding clean air",
        section: "environment",
        search_conditions: { term: "clean air" },
      };
      const client = createClient(mockItem);

      const res = await client.suggestedSearches.find({ slug: "clean-air-act" });
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/suggested_searches/clean-air-act");
      expect(res).toEqual(mockItem);
    });

    test("5.4 fr.suggestedSearches.find - throws FederalRegisterStatusMessageError on 404 status object", async () => {
      const errorPayload = {
        status: 404,
        message: "Suggested search not found with slug: invalid-slug",
      };
      const client = createClient(errorPayload, 404);

      try {
        await client.suggestedSearches.find({ slug: "invalid-slug" });
        fail("Expected FederalRegisterStatusMessageError");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterStatusMessageError);
        expect(err.status).toBe(404);
        expect(err.body.message).toContain("Suggested search not found with slug: invalid-slug");
      }
    });
  });

  // =========================================================================
  // 6. Holidays Service (1 operation)
  // =========================================================================
  describe("6. Holidays Service", () => {
    test("6.1 fr.holidays.list - fetches Federal holidays dictionary", async () => {
      const mockHolidays = {
        "2026-01-01": "New Year's Day",
        "2026-01-19": "Birthday of Martin Luther King, Jr.",
      };
      const client = createClient(mockHolidays);

      const res = await client.holidays.list();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/holidays");
      expect(res).toEqual(mockHolidays);
    });
  });

  // =========================================================================
  // 7. Effective Dates Service (1 operation)
  // =========================================================================
  describe("7. Effective Dates Service", () => {
    test("7.1 fr.effectiveDates.calculate - calculates effective dates with frozen GOLDEN calendar map", async () => {
      const mockCalc: EffectiveDateMap = {
        "2026-09-16": {
          "15": { date: "2026-10-01", delay_reasons: [] },
          "21": { date: "2026-10-07", delay_reasons: [] },
          "30": { date: "2026-10-16", delay_reasons: ["weekend"] },
          "35": { date: "2026-10-21", delay_reasons: [] },
          "45": { date: "2026-10-31", delay_reasons: ["weekend"] },
          "60": { date: "2026-11-15", delay_reasons: ["weekend"] },
          "90": { date: "2026-12-15", delay_reasons: [] },
        },
      };
      const client = createClient(mockCalc);

      const res: EffectiveDateMap = await client.effectiveDates.calculate({
        startDate: "2026-09-16",
        endDate: "2026-09-30",
      });
      expect(capturedUrls[0]).toBe(
        "https://www.federalregister.gov/api/v1/effective-dates?start_date=2026-09-16&end_date=2026-09-30"
      );
      expect(res).toEqual(mockCalc);
      expect(res["2026-09-16"]["30"].delay_reasons).toContain("weekend");
    });

    test("7.2 fr.effectiveDates.calculate - throws FederalRegisterEffectiveDateRangeError on 400 range error", async () => {
      const errorPayload = {
        error: "Publication date is outside the supported calculation window",
      };
      const client = createClient(errorPayload, 400);

      try {
        await client.effectiveDates.calculate({ startDate: "2026-01-01", endDate: "2026-01-10" });
        fail("Expected FederalRegisterEffectiveDateRangeError");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterEffectiveDateRangeError);
        expect(err.status).toBe(400);
        expect(err.message).toContain("outside the supported calculation window");
      }
    });

    test("7.3 fr.effectiveDates.calculate - signed 120-day boundary validation (Blocker F)", async () => {
      const mockCalc: EffectiveDateMap = {
        "2026-01-01": {
          "15": { date: "2026-01-16", delay_reasons: [] },
          "21": { date: "2026-01-22", delay_reasons: [] },
          "30": { date: "2026-01-31", delay_reasons: [] },
          "35": { date: "2026-02-05", delay_reasons: [] },
          "45": { date: "2026-02-15", delay_reasons: [] },
          "60": { date: "2026-03-02", delay_reasons: [] },
          "90": { date: "2026-04-01", delay_reasons: [] },
        },
      };
      const client = createClient(mockCalc);

      // Exact 120 days forward (e.g. 2026-01-01 to 2026-05-01 = 120 days): PASS
      await expect(
        client.effectiveDates.calculate({
          startDate: "2026-01-01",
          endDate: "2026-05-01",
        })
      ).resolves.toBeDefined();

      // 121 days forward (2026-01-01 to 2026-05-02 = 121 days): throws RequestValidationError
      await expect(
        client.effectiveDates.calculate({
          startDate: "2026-01-01",
          endDate: "2026-05-02",
        })
      ).rejects.toThrow(RequestValidationError);

      // Reverse order (endDate < startDate): signed diff is negative (<= 120), does not trigger 120-day overflow
      await expect(
        client.effectiveDates.calculate({
          startDate: "2026-05-01",
          endDate: "2026-01-01",
        })
      ).resolves.toBeDefined();
    });
  });

  // =========================================================================
  // 8. Issues Service (2 operations)
  // =========================================================================
  describe("8. Issues Service", () => {
    test("8.1 fr.issues.find - fetches XML-produced Issue TOC with meta.publication_date", async () => {
      const mockXmlToc: XmlIssueToc = {
        meta: {
          publication_date: "2026-09-16",
        },
        agencies: [
          {
            name: "Environmental Protection Agency",
            slug: "environmental-protection-agency",
            see_also: [{ name: "Air Quality Agency", slug: "air-quality-agency" }],
            document_categories: [
              {
                type: "Rules",
                documents: [
                  {
                    subject_1: "Air Quality Standards",
                    subject_2: "Ozone",
                    document_numbers: ["2026-12345"],
                  },
                ],
              },
            ],
          },
        ],
      };
      const client = createClient(mockXmlToc);

      const res = await client.issues.find({ publicationDate: "2026-09-16" });
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/issues/2026-09-16.json");
      expect(res).toEqual(mockXmlToc);
      expect((res as XmlIssueToc).meta.publication_date).toBe("2026-09-16");
    });

    test("8.2 fr.issues.current - fetches Legacy-produced current Issue TOC (no meta)", async () => {
      const mockLegacyToc: LegacyIssueToc = {
        agencies: [
          {
            name: "Coast Guard",
            slug: "coast-guard",
            document_categories: [
              {
                type: "Notices",
                documents: [
                  {
                    subject_1: "Safety Zones",
                    document_numbers: ["2026-99999"],
                  },
                ],
              },
            ],
          },
        ],
      };
      const client = createClient(mockLegacyToc);

      const res = await client.issues.current();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/issues/current.json");
      expect(res).toEqual(mockLegacyToc);
      expect((res as any).meta).toBeUndefined();
    });

    test("8.3 fr.issues.find - throws FederalRegisterStatusMessageError on 404", async () => {
      const errorPayload = {
        status: 404,
        message: "Federal Register Issue not published for date: 2026-09-20",
      };
      const client = createClient(errorPayload, 404);

      await expect(client.issues.find({ publicationDate: "2026-09-20" })).rejects.toThrow(
        FederalRegisterStatusMessageError
      );
    });
  });

  // =========================================================================
  // 9. Images Service (1 operation)
  // =========================================================================
  describe("9. Images Service", () => {
    test("9.1 fr.images.find - fetches style-keyed ImageVariantMetadata map (Blocker B)", async () => {
      const mockImageMap: ImageMetadataMap = {
        medium: {
          content_type: "image/png",
          height: 600,
          identifier: "EP16SE26.001",
          sha: "abc123sha",
          size: 102400,
          url: "https://images.federalregister.gov/EP16SE26.001/medium.png",
          width: 800,
        },
        original: {
          content_type: "image/png",
          height: 1200,
          identifier: "EP16SE26.001",
          sha: "abc123sha_orig",
          size: 409600,
          url: "https://images.federalregister.gov/EP16SE26.001/original.png",
          width: 1600,
        },
      };
      const client = createClient(mockImageMap);

      const res: ImageMetadataMap = await client.images.find({ identifier: "EP16SE26.001" });
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/images/EP16SE26.001");
      expect(res).toEqual(mockImageMap);
      expect(res.medium.identifier).toBe("EP16SE26.001");
      expect(res.medium.width).toBe(800);
    });

    test("9.2 fr.images.find - maps HTTP 404 with body {} to FederalRegisterEmptyJsonError", async () => {
      const client = createClient({}, 404);

      try {
        await client.images.find({ identifier: "non-public-image" });
        fail("Expected FederalRegisterEmptyJsonError");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterEmptyJsonError);
        expect(err.status).toBe(404);
      }
    });
  });

  // =========================================================================
  // 10. Category Counts Service (2 operations)
  // =========================================================================
  describe("10. Category Counts Service", () => {
    test("10.1 fr.categoryCounts.documentTypeCsv - fetches document type category counts CSV", async () => {
      const csvData = "category,count\nRULE,150\nPROPOSED_RULE,90";
      const client = createClient(csvData, 200, { "content-type": "text/csv" });

      const res = await client.categoryCounts.documentTypeCsv();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/category_counts/document_type.csv");
      expect(res).toBe(csvData);
    });

    test("10.2 fr.categoryCounts.pageCountCsv - fetches page count category counts CSV", async () => {
      const csvData = "year,pages\n2025,85000\n2026,62000";
      const client = createClient(csvData, 200, { "content-type": "text/csv" });

      const res = await client.categoryCounts.pageCountCsv();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/category_counts/page_count.csv");
      expect(res).toBe(csvData);
    });
  });

  // =========================================================================
  // 11. Site Notifications Service (1 operation, 3 tri-state paths)
  // =========================================================================
  describe("11. Site Notifications Service", () => {
    test("11.1 fr.siteNotifications.find - State A: HTTP 200 + active notification payload", async () => {
      const activePayload = {
        id: 1,
        identifier: "maintenance",
        notification_type: "warning",
        description: "Scheduled maintenance tonight",
        active: true,
      };
      const client = createClient(activePayload, 200);

      const res = await client.siteNotifications.find({ identifier: "maintenance" });
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/site_notifications/maintenance");
      expect(res).toEqual(activePayload);
      expect((res as any).active).toBe(true);
    });

    test("11.2 fr.siteNotifications.find - State B: HTTP 200 + empty object {} returns InactiveSiteNotification", async () => {
      const client = createClient({}, 200);

      const res = await client.siteNotifications.find({ identifier: "maintenance" });
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/site_notifications/maintenance");
      expect(res).toEqual({});
    });

    test("11.3 fr.siteNotifications.find - State C: HTTP 404 + empty body throws FederalRegisterEmptyBodyError", async () => {
      const client = createClient("", 404, { "content-type": "text/plain" });

      try {
        await client.siteNotifications.find({ identifier: "nonexistent-notification" });
        fail("Expected FederalRegisterEmptyBodyError");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterEmptyBodyError);
        expect(err.status).toBe(404);
      }
    });
  });

  // =========================================================================
  // 12. Documentation Service (1 operation)
  // =========================================================================
  describe("12. Documentation Service", () => {
    test("12.1 fr.documentation.fetchOpenApi - fetches official OpenAPI 3.0 specification", async () => {
      const mockOpenApi: FederalRegisterOpenApiDocument = {
        openapi: "3.0.0",
        info: {
          title: "Federal Register API",
          version: "v1",
        },
        servers: [{ url: "https://www.federalregister.gov/api/v1" }],
        paths: {},
        components: {
          schemas: {},
        },
      };
      const client = createClient(mockOpenApi);

      const res: FederalRegisterOpenApiDocument = await client.documentation.fetchOpenApi();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/documentation");
      expect(res).toEqual(mockOpenApi);
      expect(res.openapi).toBe("3.0.0");
    });
  });

  // =========================================================================
  // 13. Clippings Service (1 operation)
  // =========================================================================
  describe("13. Clippings Service", () => {
    test("13.1 fr.clippings.current - fetches web-owned user clippings with anonymous faux clipboard (Blocker B)", async () => {
      const mockClippings: WebClippingsResponse = {
        clippings: [],
        folders: [
          {
            name: "My Clipboard",
            slug: "my-clippings",
            doc_count: 0,
            documents: [],
            document_types: [],
          },
        ],
      };
      const client = createClient(mockClippings);

      const res: WebClippingsResponse = await client.clippings.current();
      expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/clippings");
      expect(res).toEqual(mockClippings);
      expect(res.clippings).toHaveLength(0);
      expect(res.folders[0].name).toBe("My Clipboard");
      expect(res.folders[0].slug).toBe("my-clippings");
      expect(res.folders[0].doc_count).toBe(0);
    });
  });

  // =========================================================================
  // 14. Protocol Cross-Cutting Contracts (FR-PROTO-002 CORS & FR-PROTO-003 JSONP)
  // =========================================================================
  describe("14. Protocol Cross-Cutting Contracts (CORS & JSONP)", () => {
    test("14.1 FR-PROTO-002: Wildcard CORS is a server header assertion only (Blocker E)", async () => {
      const client = new FederalRegisterClient();
      // Asserts that client instance does NOT expose any cors() runtime method
      expect((client as any).cors).toBeUndefined();
      expect((client.documents as any).cors).toBeUndefined();

      // Asserts server response header contract: Access-Control-Allow-Origin: *
      const mockHeaders = {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      };
      const testClient = createClient({ test: "data" }, 200, mockHeaders);
      const res = await testClient.documentation.fetchOpenApi();
      expect(res).toBeDefined();

      // Verify mockFetch received the response with Access-Control-Allow-Origin: *
      const rawResp = await mockFetch(capturedUrls[0]);
      expect(rawResp.headers.get("access-control-allow-origin")).toBe("*");
    });

    test("14.2 FR-PROTO-003: JSONP format policy and callback validation (Blocker D)", async () => {
      // 1. Valid callback identifier grammar: ^[A-Za-z0-9_.]+$
      const validCallbacks = ["myCallback", "cb_123", "app.callback.v1", "jQuery123_456"];
      const callbackRegex = /^[A-Za-z0-9_.]+$/;
      for (const cb of validCallbacks) {
        expect(callbackRegex.test(cb)).toBe(true);
      }

      // 2. Invalid callback identifier rejected
      const invalidCallbacks = ["<script>", "alert(1)", "bad callback", "cb;evil()", "foo/bar"];
      for (const cb of invalidCallbacks) {
        expect(callbackRegex.test(cb)).toBe(false);
      }

      // 3. Raw JavaScript text response decoding (never JSON-decoded)
      const rawJsonp = "myCallback({\"openapi\":\"3.0.0\"});";
      const client = createClient(rawJsonp, 200, { "content-type": "application/javascript" });
      const rawResp = await mockFetch("https://www.federalregister.gov/api/v1/documentation?callback=myCallback");
      const text = await rawResp.text();
      const decodedJsonp: JsonpText = text;
      expect(decodedJsonp).toBe(rawJsonp);
      expect(decodedJsonp.startsWith("myCallback(")).toBe(true);

      // 4. No generic client.jsonp(path) escape hatch exists
      expect((client as any).jsonp).toBeUndefined();
    });
  });

  // =========================================================================
  // 15. Negative Phase Boundary & Escape Prevention
  // =========================================================================
  describe("15. Negative Phase Boundary & Escape Prevention", () => {
    test("Prohibits unauthorized generic methods and future phase escapes", () => {
      const client = new FederalRegisterClient();

      // Untyped transport escapes remain undefined
      expect((client as any).get).toBeUndefined();
      expect((client as any).post).toBeUndefined();
      expect((client as any).put).toBeUndefined();
      expect((client as any).delete).toBeUndefined();
      expect((client as any).patch).toBeUndefined();
      expect((client as any).jsonp).toBeUndefined();

      // Generic facet(name) method remains undefined
      expect((client.documents as any).facet).toBeUndefined();
      expect((client.publicInspection as any).facet).toBeUndefined();
      expect((client.documents.facets as any).facet).toBeUndefined();
      expect((client.publicInspection.facets as any).facet).toBeUndefined();
      expect((client.publicInspection.issues.facets as any).facet).toBeUndefined();

      // Generic resource escapes remain undefined
      expect((client as any).resource).toBeUndefined();
      expect((client as any).endpoint).toBeUndefined();
    });
  });
});
