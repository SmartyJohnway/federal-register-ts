import { FederalRegisterClient } from "../src/core/client";
import { RequestValidationError } from "../src/request/validation";

describe("R3-POSTGA-01 PR-1 — Runtime Validation Safety", () => {
  let client: FederalRegisterClient;

  beforeEach(() => {
    client = new FederalRegisterClient({
      fetch: jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ count: 0, results: [] }),
        text: async () => JSON.stringify({ count: 0, results: [] }),
      }),
    });
  });

  describe("FIX-001 — Reject Unknown Request Keys at Runtime", () => {
    test("rejects unknown top-level key bogusTopLevel", async () => {
      await expect(
        client.documents.search({ bogusTopLevel: "val" } as any)
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects singular condition key (typo for conditions)", async () => {
      await expect(
        client.documents.search({ condition: { term: "energy" } } as any)
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects unknown nested condition key conditions.bogus_filter", async () => {
      await expect(
        client.documents.search({ conditions: { bogus_filter: "val" } as any })
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects singular conditions.agency (typo for agencies)", async () => {
      await expect(
        client.documents.search({ conditions: { agency: "EPA" } as any })
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects singular conditions.type (typo for types)", async () => {
      await expect(
        client.documents.search({ conditions: { type: "RULE" } as any })
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects snake_case per_page parameter", async () => {
      await expect(
        client.documents.search({ per_page: 20 } as any)
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects snake_case publication_date parameter", async () => {
      await expect(
        client.documents.search({ publication_date: "2024-01-01" } as any)
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects misplaced term in searchDetails top-level", async () => {
      await expect(
        client.documents.searchDetails({ term: "energy" } as any)
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects unknown keys in Public Inspection search", async () => {
      await expect(
        client.publicInspection.search({ unknownKey: 123 } as any)
      ).rejects.toThrow(RequestValidationError);
      await expect(
        client.publicInspection.search({ conditions: { unknownCond: "test" } as any })
      ).rejects.toThrow(RequestValidationError);
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
    });
  });

  describe("FIX-002 — Runtime Validation of conditions.types", () => {
    test("rejects invalid type code BOGUS", async () => {
      await expect(
        client.documents.search({ conditions: { types: ["BOGUS" as any] } })
      ).rejects.toThrow(RequestValidationError);
    });

    test("rejects lower-case rule (does not auto-coerce)", async () => {
      await expect(
        client.documents.search({ conditions: { types: ["rule" as any] } })
      ).rejects.toThrow(RequestValidationError);
    });

    test("accepts all canonical DocumentTypeCode values", async () => {
      await expect(
        client.documents.search({
          conditions: { types: ["RULE", "PRORULE", "NOTICE", "PRESDOCU"] },
        })
      ).resolves.toBeDefined();
    });
  });

  describe("FIX-004 — Required Parameter Object Guard", () => {
    test("rejects undefined/null on documents.find", async () => {
      await expect(client.documents.find(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.documents.find(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("rejects undefined/null on documents.findMany", async () => {
      await expect(client.documents.findMany(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.documents.findMany(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("rejects undefined/null on documents.autocomplete", async () => {
      await expect(client.documents.autocomplete(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.documents.autocomplete(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("rejects undefined/null on agencies.find", async () => {
      await expect(client.agencies.find(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.agencies.find(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("rejects undefined/null on agencies.findMany", async () => {
      await expect(client.agencies.findMany(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.agencies.findMany(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("rejects undefined/null on effectiveDates.calculate", async () => {
      await expect(client.effectiveDates.calculate(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.effectiveDates.calculate(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("rejects undefined/null on issues.find", async () => {
      await expect(client.issues.find(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.issues.find(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("rejects undefined/null on publicInspection.availableOn", async () => {
      await expect(client.publicInspection.availableOn(undefined as any)).rejects.toThrow(RequestValidationError);
      await expect(client.publicInspection.availableOn(null as any)).rejects.toThrow(RequestValidationError);
    });

    test("allows optional parameters to be omitted on search methods", async () => {
      await expect(client.documents.search()).resolves.toBeDefined();
      await expect(client.documents.searchDetails()).resolves.toBeDefined();
      await expect(client.publicInspection.search()).resolves.toBeDefined();
      await expect(client.agencies.list()).resolves.toBeDefined();
    });
  });
});
