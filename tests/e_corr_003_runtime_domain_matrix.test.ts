/**
 * E-CORR-003 Runtime Domain Matrix Test Suite (Exhaustive C1-01 & C1-02 Coverage)
 *
 * Verifies strict runtime domain rules with zero network requests (fetchCount = 0):
 * 1. BooleanQuery (significant, acceptingComments, correction, specialFiling):
 *    - Allows: true, false
 *    - Rejects: null, "true", "false", "yes", "", 0, 1, NaN, [], {} -> RequestValidationError
 * 2. True-Only Flags (DocumentSearch.metadataOnly, DocumentSearch.includePre1994Docs,
 *    DocumentSearchCsv.includePre1994Docs, DocumentSearchRss.includePre1994Docs, PublicInspectionSearch.metadataOnly):
 *    - Allows: omitted (undefined), true
 *    - Rejects: false, null, "true", "false", 0, 1, [], {} -> RequestValidationError
 * 3. Ordinary Boolean (omitSpellingSuggestions):
 *    - Allows: true, false
 *    - Rejects: null, "true", 0, 1, [], {} -> RequestValidationError
 * 4. NearCondition:
 *    - Allowed keys: location, within
 *    - Rejects: extra nested keys (e.g. { location: "dc", within: 5, foo: "bar" }) -> RequestValidationError
 * 5. String-Array Filter Inventory (13 fields):
 *    - Document conditions: agencies, citingDocumentNumbers, documentNumbers, executiveOrderNumbers,
 *      presidents, sections, topics, noticeTypes, presidentialDocumentTypes, smallEntities
 *    - Public Inspection conditions: agencies, types, documentNumbers
 *    - Preserves: undefined -> absent, [] -> semantic no-op, ["valid"] -> accepted
 *    - Rejects: scalar string, object, null, [""], ["   "], ["valid", ""], [null], [undefined] -> RequestValidationError, fetch=0
 */

import { FederalRegisterClient } from "../src/core/client";
import { RequestValidationError } from "../src/request/validation";

describe("E-CORR-003 — Runtime Domain Matrix", () => {
  let mockFetch: jest.Mock;
  let client: FederalRegisterClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new FederalRegisterClient({ fetch: mockFetch });
  });

  // ---------------------------------------------------------------------------
  // 1. BooleanQuery Fields
  // ---------------------------------------------------------------------------
  describe("1. BooleanQuery Fields (significant, acceptingComments, correction, specialFiling)", () => {
    const invalidValues = [null, "true", "false", "yes", "", 0, 1, NaN, [], {}];

    test.each(invalidValues)("significant rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.search({ conditions: { significant: val as any } })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("acceptingComments rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.search({ conditions: { acceptingComments: val as any } })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("correction rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.search({ conditions: { correction: val as any } })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("specialFiling rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.publicInspection.search({ conditions: { specialFiling: val as any } })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("boolean true and false are accepted", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.search({ conditions: { significant: true } });
      await client.documents.search({ conditions: { significant: false } });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. True-Only Flags Across Authorized Branches (C1-02)
  // ---------------------------------------------------------------------------
  describe("2. True-Only Flags Across Authorized Branches (C1-02)", () => {
    const invalidValues = [false, null, "true", "false", 0, 1, [], {}];

    test.each(invalidValues)("DocumentSearch.metadataOnly rejects %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.search({ metadataOnly: val as any })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("DocumentSearch.includePre1994Docs rejects %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.search({ includePre1994Docs: val as any })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("DocumentSearchCsv.includePre1994Docs rejects %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.searchCsv({ includePre1994Docs: val as any })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("DocumentSearchRss.includePre1994Docs rejects %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.searchRss({ includePre1994Docs: val as any })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("PublicInspectionSearch.metadataOnly rejects %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.publicInspection.search({ metadataOnly: val as any })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("omitted and explicit true are accepted on all true-only branches", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.search({});
      await client.documents.search({ metadataOnly: true, includePre1994Docs: true });
      await client.documents.searchCsv({ includePre1994Docs: true });
      await client.documents.searchRss({ includePre1994Docs: true });
      await client.publicInspection.search({ metadataOnly: true });
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Ordinary Boolean (omitSpellingSuggestions)
  // ---------------------------------------------------------------------------
  describe("3. Ordinary Boolean (omitSpellingSuggestions)", () => {
    const invalidValues = [null, "true", "false", 0, 1, [], {}];

    test.each(invalidValues)("omitSpellingSuggestions rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(client.documents.searchDetails({ omitSpellingSuggestions: val as any })).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("explicit true and false are accepted", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.searchDetails({ omitSpellingSuggestions: true });
      await client.documents.searchDetails({ omitSpellingSuggestions: false });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. NearCondition Key Enforcement
  // ---------------------------------------------------------------------------
  describe("4. NearCondition Allowed Keys", () => {
    test("rejects extra nested keys in NearCondition -> RequestValidationError, fetch=0", async () => {
      await expect(
        client.documents.search({
          conditions: { near: { location: "Washington DC", within: 10, extraKey: "forbidden" } as any },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("accepts valid NearCondition with location and within", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.search({
        conditions: { near: { location: "Washington DC", within: 10 } },
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. String-Array Search Filter Inventory (C1-01)
  // ---------------------------------------------------------------------------
  describe("5. String-Array Search Filter Inventory (C1-01)", () => {
    const invalidArrayInputs = [
      "scalar_string",
      123,
      null,
      {},
      [""],
      ["   "],
      ["valid", ""],
      [null],
      [undefined],
    ];

    const docStringArrayFields = [
      "agencies",
      "citingDocumentNumbers",
      "documentNumbers",
      "executiveOrderNumbers",
      "presidents",
      "sections",
      "topics",
      "noticeTypes",
      "presidentialDocumentTypes",
      "smallEntities",
    ] as const;

    docStringArrayFields.forEach((field) => {
      describe(`DocumentCondition.${field}`, () => {
        test.each(invalidArrayInputs)(`rejects invalid input %p -> RequestValidationError, fetch=0`, async (val) => {
          await expect(
            client.documents.search({
              conditions: { [field]: val } as any,
            })
          ).rejects.toThrow(RequestValidationError);
          expect(mockFetch).toHaveBeenCalledTimes(0);
        });

        test("accepts [] semantic array (no-op) and valid string arrays", async () => {
          mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
          await client.documents.search({ conditions: { [field]: [] } as any });
          await client.documents.search({ conditions: { [field]: ["test-val"] } as any });
          expect(mockFetch).toHaveBeenCalledTimes(2);
        });
      });
    });

    const piStringArrayFields = ["agencies", "types", "documentNumbers"] as const;

    piStringArrayFields.forEach((field) => {
      describe(`PublicInspectionCondition.${field}`, () => {
        test.each(invalidArrayInputs)(`rejects invalid input %p -> RequestValidationError, fetch=0`, async (val) => {
          await expect(
            client.publicInspection.search({
              conditions: { [field]: val } as any,
            })
          ).rejects.toThrow(RequestValidationError);
          expect(mockFetch).toHaveBeenCalledTimes(0);
        });

        test("accepts [] semantic array (no-op) and valid string arrays", async () => {
          mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
          await client.publicInspection.search({ conditions: { [field]: [] } as any });
          await client.publicInspection.search({ conditions: { [field]: ["test-val"] } as any });
          expect(mockFetch).toHaveBeenCalledTimes(2);
        });
      });
    });
  });
});
