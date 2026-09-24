/**
 * R3-POSTGA-02-I Runtime Domain Validation Regression Tests
 *
 * Covers:
 * - I-CORR-003: Public Inspection conditions.term runtime domain
 * - I-CORR-004: Numeric ID-array runtime validation (7 fields across Document & PI searches, plus AgencyFindMany ids)
 * - I-CORR-005: suggestedSearches.listBySections sections array & element validation
 *
 * Verifies:
 * - valid cases accepted and serialized correctly
 * - boundary valid cases (empty array) preserved
 * - invalid scalar, non-array, wrong-type elements, null, undefined, object, mixed array
 * - RequestValidationError thrown with fetch calls = 0 and native TypeError = 0
 */

import {
  FederalRegisterClient,
  RequestValidationError,
} from "../src";

function createMockClient(): {
  client: FederalRegisterClient;
  fetchCalls: { url: string; options?: RequestInit }[];
} {
  const fetchCalls: { url: string; options?: RequestInit }[] = [];
  const mockFetch: typeof fetch = async (input, init) => {
    fetchCalls.push({ url: String(input), options: init });
    return new Response(JSON.stringify({ count: 0, total_pages: 0, results: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const client = new FederalRegisterClient({ fetch: mockFetch });
  return { client, fetchCalls };
}

describe("I-CORR-003 — Public Inspection conditions.term Runtime Domain", () => {
  test("valid string 'renewable' -> accepted and serialized as conditions[term]=renewable", async () => {
    const { client, fetchCalls } = createMockClient();
    await client.publicInspection.search({
      conditions: { term: "renewable" },
    });
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toContain("conditions%5Bterm%5D=renewable");
  });

  test("valid empty string '' -> accepted and serialized as conditions[term]=", async () => {
    const { client, fetchCalls } = createMockClient();
    await client.publicInspection.search({
      conditions: { term: "" },
    });
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toContain("conditions%5Bterm%5D=");
  });

  test("valid whitespace string ' ' -> accepted and serialized as conditions[term]=+", async () => {
    const { client, fetchCalls } = createMockClient();
    await client.publicInspection.search({
      conditions: { term: " " },
    });
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toMatch(/conditions%5Bterm%5D=(\+|%20)/);
  });

  const invalidTermCases: [string, any][] = [
    ["number 123", 123],
    ["boolean true", true],
    ["boolean false", false],
    ["null", null],
    ["object {}", {}],
    ["empty array []", []],
    ["array of strings ['term']", ["term"]],
  ];

  test.each(invalidTermCases)(
    "invalid term (%s) -> throws RequestValidationError with fetch = 0",
    async (_label, invalidValue) => {
      const { client, fetchCalls } = createMockClient();
      await expect(
        client.publicInspection.search({
          conditions: { term: invalidValue },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(fetchCalls.length).toBe(0);
    }
  );

  test("invalid term on publicInspection.searchDetails -> throws RequestValidationError with fetch = 0", async () => {
    const { client, fetchCalls } = createMockClient();
    await expect(
      client.publicInspection.searchDetails({
        conditions: { term: 123 as any },
      })
    ).rejects.toThrow(RequestValidationError);
    expect(fetchCalls.length).toBe(0);
  });
});

describe("I-CORR-004 — Numeric ID-array Runtime Validation", () => {
  describe("DocumentSearchConditions.agencyIds", () => {
    test("valid numeric array [492, 468] -> accepted", async () => {
      const { client, fetchCalls } = createMockClient();
      await client.documents.search({
        conditions: { agencyIds: [492, 468] },
      });
      expect(fetchCalls.length).toBe(1);
      expect(fetchCalls[0].url).toContain("conditions%5Bagency_ids%5D%5B%5D=492");
      expect(fetchCalls[0].url).toContain("conditions%5Bagency_ids%5D%5B%5D=468");
    });

    test("valid empty array [] -> accepted (omitted from query)", async () => {
      const { client, fetchCalls } = createMockClient();
      await client.documents.search({
        conditions: { agencyIds: [] },
      });
      expect(fetchCalls.length).toBe(1);
      expect(fetchCalls[0].url).not.toContain("agency_ids");
    });

    const invalidCases: [string, any][] = [
      ["scalar number 492", 492],
      ["scalar string '492'", "492"],
      ["object {}", {}],
      ["array with null [492, null]", [492, null]],
      ["array with undefined [492, undefined]", [492, undefined]],
      ["array with string [492, '468']", [492, "468"]],
      ["array with object [492, {}]", [492, {}]],
      ["array with zero [492, 0]", [492, 0]],
      ["array with negative [492, -5]", [492, -5]],
      ["array with float [492, 1.5]", [492, 1.5]],
    ];

    test.each(invalidCases)(
      "invalid agencyIds (%s) -> throws RequestValidationError with fetch = 0",
      async (_label, invalidValue) => {
        const { client, fetchCalls } = createMockClient();
        await expect(
          client.documents.search({
            conditions: { agencyIds: invalidValue },
          })
        ).rejects.toThrow(RequestValidationError);
        expect(fetchCalls.length).toBe(0);
      }
    );
  });

  describe("DocumentSearchConditions other ID array fields", () => {
    const idFields: [string, keyof any][] = [
      ["sectionIds", "sectionIds"],
      ["topicIds", "topicIds"],
      ["noticeTypeIds", "noticeTypeIds"],
      ["presidentialDocumentTypeIds", "presidentialDocumentTypeIds"],
      ["smallEntityIds", "smallEntityIds"],
    ];

    test.each(idFields)(
      "rejects scalar number on %s with fetch = 0",
      async (_name, field) => {
        const { client, fetchCalls } = createMockClient();
        await expect(
          client.documents.search({
            conditions: { [field]: 100 } as any,
          })
        ).rejects.toThrow(RequestValidationError);
        expect(fetchCalls.length).toBe(0);
      }
    );

    test.each(idFields)(
      "rejects string element on %s with fetch = 0",
      async (_name, field) => {
        const { client, fetchCalls } = createMockClient();
        await expect(
          client.documents.search({
            conditions: { [field]: [100, "200"] } as any,
          })
        ).rejects.toThrow(RequestValidationError);
        expect(fetchCalls.length).toBe(0);
      }
    );

    test.each(idFields)(
      "accepts valid numeric array on %s",
      async (_name, field) => {
        const { client, fetchCalls } = createMockClient();
        await client.documents.search({
          conditions: { [field]: [100, 200] } as any,
        });
        expect(fetchCalls.length).toBe(1);
      }
    );
  });

  describe("PublicInspectionSearchConditions.agencyIds", () => {
    test("valid numeric array [492] -> accepted", async () => {
      const { client, fetchCalls } = createMockClient();
      await client.publicInspection.search({
        conditions: { agencyIds: [492] },
      });
      expect(fetchCalls.length).toBe(1);
      expect(fetchCalls[0].url).toContain("conditions%5Bagency_ids%5D%5B%5D=492");
    });

    test("invalid scalar number 492 -> throws RequestValidationError with fetch = 0", async () => {
      const { client, fetchCalls } = createMockClient();
      await expect(
        client.publicInspection.search({
          conditions: { agencyIds: 492 as any },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(fetchCalls.length).toBe(0);
    });

    test("invalid array with string element -> throws RequestValidationError with fetch = 0", async () => {
      const { client, fetchCalls } = createMockClient();
      await expect(
        client.publicInspection.search({
          conditions: { agencyIds: [492, "invalid"] as any },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(fetchCalls.length).toBe(0);
    });
  });

  describe("AgencyFindManyParams.ids", () => {
    test("valid numeric array [492, 468] -> accepted", async () => {
      const { client, fetchCalls } = createMockClient();
      await client.agencies.findMany({ ids: [492, 468] });
      expect(fetchCalls.length).toBe(1);
      expect(fetchCalls[0].url).toContain("/agencies/492,468");
    });

    test("empty array [] -> throws RequestValidationError with fetch = 0", async () => {
      const { client, fetchCalls } = createMockClient();
      await expect(
        client.agencies.findMany({ ids: [] as any })
      ).rejects.toThrow(RequestValidationError);
      expect(fetchCalls.length).toBe(0);
    });

    test("scalar number 492 -> throws RequestValidationError with fetch = 0", async () => {
      const { client, fetchCalls } = createMockClient();
      await expect(
        client.agencies.findMany({ ids: 492 as any })
      ).rejects.toThrow(RequestValidationError);
      expect(fetchCalls.length).toBe(0);
    });

    test("array with string element [492, '468'] -> throws RequestValidationError with fetch = 0", async () => {
      const { client, fetchCalls } = createMockClient();
      await expect(
        client.agencies.findMany({ ids: [492, "468"] as any })
      ).rejects.toThrow(RequestValidationError);
      expect(fetchCalls.length).toBe(0);
    });
  });
});

describe("I-CORR-005 — suggestedSearches.listBySections sections Element Validation", () => {
  test("valid single section ['money'] -> accepted", async () => {
    const { client, fetchCalls } = createMockClient();
    await client.suggestedSearches.listBySections({ sections: ["money"] });
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toContain("conditions%5Bsections%5D%5B%5D=money");
  });

  test("valid multiple sections ['money', 'environment'] -> accepted", async () => {
    const { client, fetchCalls } = createMockClient();
    await client.suggestedSearches.listBySections({ sections: ["money", "environment"] });
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toContain("conditions%5Bsections%5D%5B%5D=money");
    expect(fetchCalls[0].url).toContain("conditions%5Bsections%5D%5B%5D=environment");
  });

  const invalidSectionsCases: [string, any][] = [
    ["empty array []", []],
    ["scalar string 'money'", "money"],
    ["scalar number 123", 123],
    ["object {}", {}],
    ["array with empty string ['']", [""]],
    ["array with whitespace [' ']", [" "]],
    ["array with null ['money', null]", ["money", null]],
    ["array with undefined ['money', undefined]", ["money", undefined]],
    ["array with number ['money', 123]", ["money", 123]],
    ["array with object ['money', {}]", ["money", {}]],
  ];

  test.each(invalidSectionsCases)(
    "invalid sections (%s) -> throws RequestValidationError with fetch = 0",
    async (_label, invalidValue) => {
      const { client, fetchCalls } = createMockClient();
      await expect(
        client.suggestedSearches.listBySections({ sections: invalidValue })
      ).rejects.toThrow(RequestValidationError);
      expect(fetchCalls.length).toBe(0);
    }
  );
});
