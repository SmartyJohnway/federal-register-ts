/**
 * CAP-001 Topic Catalog Deterministic Verification Test Suite
 *
 * Verifies:
 * 1. topics.list() dispatches exactly /topics.json.
 * 2. No query string is emitted by topics.list().
 * 3. A representative catalog fixture decodes transparently.
 * 4. Both thesaurus and ad_hoc buckets are preserved.
 * 5. see_also preserves { name, slug } items.
 * 6. Empty slug is accepted as a valid string value.
 * 7. cfr_references and see arrays are preserved without guessed transformation.
 * 8. Catalog items do not acquire a synthetic url.
 * 9. Existing topics.suggestions() behavior remains unchanged.
 * 10. Existing JSONP suggestion behavior remains unchanged.
 * 11. Root package type exports expose all six new public topic-catalog interfaces.
 * 12. Strict TypeScript usage and structure verification.
 */

import {
  FederalRegisterClient,
  TopicCatalogResponse,
  TopicCatalogItem,
  TopicCatalogMeta,
  TopicCatalogCountMeta,
  TopicCatalogResults,
  TopicCatalogSeeAlsoItem,
} from "../src/index";

describe("CAP-001 Topic Catalog (client.topics.list)", () => {
  let capturedUrls: string[] = [];
  let capturedMethods: string[] = [];
  let capturedHeaders: Record<string, string>[] = [];

  const deterministicCatalogFixture: TopicCatalogResponse = {
    meta: {
      count: {
        thesaurus: 2,
        ad_hoc: 2,
        total: 4,
      },
    },
    results: {
      thesaurus: [
        {
          name: "Accountants",
          slug: "accountants",
          see_also: [
            {
              name: "Business and industry",
              slug: "business-industry",
            },
          ],
          cfr_references: [],
          see: [],
        },
        {
          name: "Public lands-classification",
          slug: "public-lands-classification",
          see_also: [],
          cfr_references: [],
          see: [],
        },
      ],
      ad_hoc: [
        {
          name: "1200 Sixth Avenue",
          slug: "sixth-avenue",
          see_also: [],
          cfr_references: [],
          see: [],
        },
        {
          name: "Promotion",
          slug: "", // empty slug as observed in production
          see_also: [],
          cfr_references: [{ some_arbitrary_key: 123 }],
          see: ["text_ref"],
        },
      ],
    },
  };

  function createMockClient(mockResponseBody: any, status = 200): FederalRegisterClient {
    capturedUrls = [];
    capturedMethods = [];
    capturedHeaders = [];

    const mockFetch = jest.fn(async (input: any, init?: any) => {
      const url = typeof input === "string" ? input : input.url;
      capturedUrls.push(url);
      capturedMethods.push(init?.method || "GET");
      capturedHeaders.push(init?.headers || {});

      return {
        status,
        ok: status >= 200 && status < 300,
        headers: new Headers({
          "content-type": "application/json; charset=utf-8",
        }),
        json: async () => mockResponseBody,
        text: async () => JSON.stringify(mockResponseBody),
      } as unknown as Response;
    });

    return new FederalRegisterClient({
      fetch: mockFetch,
    });
  }

  beforeEach(() => {
    capturedUrls = [];
    capturedMethods = [];
    capturedHeaders = [];
  });

  test("1 & 2. topics.list() dispatches exactly /topics.json with zero query string", async () => {
    const client = createMockClient(deterministicCatalogFixture);
    const result = await client.topics.list();

    expect(capturedUrls.length).toBe(1);
    expect(capturedUrls[0]).toBe("https://www.federalregister.gov/api/v1/topics.json");
    expect(capturedMethods[0]).toBe("GET");
    expect(result).toBeDefined();
  });

  test("3 & 4. Representative catalog fixture decodes transparently with both buckets", async () => {
    const client = createMockClient(deterministicCatalogFixture);
    const result = await client.topics.list();

    expect(result.meta.count.total).toBe(4);
    expect(result.meta.count.thesaurus).toBe(2);
    expect(result.meta.count.ad_hoc).toBe(2);

    expect(result.results.thesaurus.length).toBe(2);
    expect(result.results.ad_hoc.length).toBe(2);
  });

  test("5. see_also preserves { name, slug } items", async () => {
    const client = createMockClient(deterministicCatalogFixture);
    const result = await client.topics.list();

    const accountants = result.results.thesaurus[0];
    expect(accountants.see_also.length).toBe(1);
    expect(accountants.see_also[0].name).toBe("Business and industry");
    expect(accountants.see_also[0].slug).toBe("business-industry");
  });

  test("6. Empty slug is accepted as valid string value", async () => {
    const client = createMockClient(deterministicCatalogFixture);
    const result = await client.topics.list();

    const promotion = result.results.ad_hoc[1];
    expect(promotion.name).toBe("Promotion");
    expect(promotion.slug).toBe("");
    expect(typeof promotion.slug).toBe("string");
  });

  test("7. cfr_references and see arrays are preserved without guessed transformation", async () => {
    const client = createMockClient(deterministicCatalogFixture);
    const result = await client.topics.list();

    const promotion = result.results.ad_hoc[1];
    expect(promotion.cfr_references).toEqual([{ some_arbitrary_key: 123 }]);
    expect(promotion.see).toEqual(["text_ref"]);
  });

  test("8. Catalog items do not acquire a synthetic url", async () => {
    const client = createMockClient(deterministicCatalogFixture);
    const result = await client.topics.list();

    for (const item of [...result.results.thesaurus, ...result.results.ad_hoc]) {
      expect((item as any).url).toBeUndefined();
    }
  });

  test("9. Existing topics.suggestions() behavior remains unchanged", async () => {
    const mockSuggestions = [
      { name: "Aviation Safety", slug: "aviation-safety", url: "https://example.com/topics/aviation-safety" },
    ];
    const client = createMockClient(mockSuggestions);

    const res = await client.topics.suggestions({
      term: "aviat",
      fields: ["name", "slug", "url"],
    });

    expect(capturedUrls[0]).toBe(
      "https://www.federalregister.gov/api/v1/topics/suggestions?conditions%5Bterm%5D=aviat&fields%5B%5D=name&fields%5B%5D=slug&fields%5B%5D=url"
    );
    expect(res).toEqual(mockSuggestions);
    expect(res[0].url).toBe("https://example.com/topics/aviation-safety");
  });

  test("10. Existing JSONP suggestion behavior remains unchanged", async () => {
    const jsonpPayload = "cb_topics([{\"name\":\"Aviation\"}])";
    capturedUrls = [];

    const mockFetch = jest.fn(async (input: any) => {
      const url = typeof input === "string" ? input : input.url;
      capturedUrls.push(url);
      return {
        status: 200,
        ok: true,
        headers: new Headers({ "content-type": "text/javascript" }),
        text: async () => jsonpPayload,
        json: async () => {
          throw new Error("not json");
        },
      } as unknown as Response;
    });

    const client = new FederalRegisterClient({ fetch: mockFetch });
    const res = await client.topics.suggestionsJsonp({
      term: "aviat",
      callback: "cb_topics",
    });

    expect(capturedUrls[0]).toContain("/topics/suggestions");
    expect(capturedUrls[0]).toContain("callback=cb_topics");
    expect(res).toBe(jsonpPayload);
  });

  test("11 & 12. Public catalog types type-check correctly in strict usage", () => {
    const testItem: TopicCatalogItem = {
      name: "Solar Energy",
      slug: "solar-energy",
      see_also: [{ name: "Renewable Energy", slug: "renewable-energy" }],
      cfr_references: [],
      see: [],
    };
    const testCountMeta: TopicCatalogCountMeta = {
      thesaurus: 1,
      ad_hoc: 0,
      total: 1,
    };
    const testMeta: TopicCatalogMeta = {
      count: testCountMeta,
    };
    const testResults: TopicCatalogResults = {
      thesaurus: [testItem],
      ad_hoc: [],
    };
    const testResponse: TopicCatalogResponse = {
      meta: testMeta,
      results: testResults,
    };

    expect(testResponse.meta.count.total).toBe(1);
    expect(testResponse.results.thesaurus[0].name).toBe("Solar Energy");
  });
});
