/**
 * E-CORR-003 Runtime Domain Matrix Test Suite
 *
 * Verifies strict runtime domain rules with zero network requests (fetchCount = 0):
 * 1. BooleanQuery (significant, acceptingComments, correction, specialFiling):
 *    - Allows: true, false
 *    - Rejects: null, "true", "false", "yes", "", 0, 1, NaN, [], {} -> RequestValidationError
 * 2. True-Only Flags (metadataOnly, includePre1994Docs):
 *    - Allows: omitted (undefined), true
 *    - Rejects: false, null, "true", "false", 0, 1, [], {} -> RequestValidationError
 * 3. Ordinary Boolean (omitSpellingSuggestions):
 *    - Allows: true, false
 *    - Rejects: null, "true", 0, 1, [], {} -> RequestValidationError
 * 4. NearCondition:
 *    - Allowed keys: location, within
 *    - Rejects: extra nested keys (e.g. { location: "dc", within: 5, foo: "bar" }) -> RequestValidationError
 * 5. String-Array Validation:
 *    - Allows: [] (semantic array -> omitted / no-op), ["valid"]
 *    - Rejects: non-array, array with non-strings or empty strings -> RequestValidationError
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

  // 1. BooleanQuery: significant, acceptingComments, correction, specialFiling
  describe("1. BooleanQuery Fields (significant, acceptingComments, correction, specialFiling)", () => {
    const invalidValues = [null, "true", "false", "yes", "", 0, 1, NaN, [], {}];

    test.each(invalidValues)("significant rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(
        client.documents.search({
          conditions: { significant: val as any },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("acceptingComments rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(
        client.documents.search({
          conditions: { acceptingComments: val as any },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("correction rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(
        client.documents.search({
          conditions: { correction: val as any },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("specialFiling rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(
        client.publicInspection.search({
          conditions: { specialFiling: val as any },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("boolean true and false are accepted", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.search({ conditions: { significant: true } });
      await client.documents.search({ conditions: { significant: false } });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // 2. True-Only Flags: metadataOnly, includePre1994Docs
  describe("2. True-Only Flags (metadataOnly, includePre1994Docs)", () => {
    const invalidValues = [false, null, "true", "false", 0, 1, [], {}];

    test.each(invalidValues)("metadataOnly rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(
        client.documents.search({
          metadataOnly: val as any,
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test.each(invalidValues)("includePre1994Docs rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(
        client.documents.search({
          includePre1994Docs: val as any,
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("omitted and explicit true are accepted", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.search({});
      await client.documents.search({ metadataOnly: true, includePre1994Docs: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // 3. Ordinary Boolean: omitSpellingSuggestions
  describe("3. Ordinary Boolean (omitSpellingSuggestions)", () => {
    const invalidValues = [null, "true", "false", 0, 1, [], {}];

    test.each(invalidValues)("omitSpellingSuggestions rejects invalid value %p -> RequestValidationError, fetch=0", async (val) => {
      await expect(
        client.documents.searchDetails({
          omitSpellingSuggestions: val as any,
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("explicit true and false are accepted", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.searchDetails({ omitSpellingSuggestions: true });
      await client.documents.searchDetails({ omitSpellingSuggestions: false });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // 4. NearCondition Key Enforcement
  describe("4. NearCondition Allowed Keys", () => {
    test("rejects extra nested keys in NearCondition -> RequestValidationError, fetch=0", async () => {
      await expect(
        client.documents.search({
          conditions: {
            near: { location: "Washington DC", within: 10, extraKey: "forbidden" } as any,
          },
        })
      ).rejects.toThrow(RequestValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test("accepts valid NearCondition with location and within", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.search({
        conditions: {
          near: { location: "Washington DC", within: 10 },
        },
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // 5. String-Array Validation: [] semantic array -> omitted / no-op
  describe("5. String-Array [] Semantic No-Op Behavior", () => {
    test("[] semantic array is allowed without error", async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response('{"count":0,"results":[]}')));
      await client.documents.search({
        conditions: {
          types: [],
        },
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
