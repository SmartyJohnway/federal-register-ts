import { FederalRegisterClient } from "../src/core/client";
import type { SearchResultEnvelope, DocumentSearchItem } from "../src/services/models";

describe("R3-POSTGA-01 PR-2 — Runtime / Type Contract Parity", () => {
  describe("FIX-003 — One-ID findMany Normalization", () => {
    test("Documents findMany: normalizes upstream bare single object into MultiLookupEnvelope", async () => {
      const mockDoc = {
        title: "Test Document",
        document_number: "2024-00001",
      };
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockDoc,
          text: async () => JSON.stringify(mockDoc),
        }),
      });

      const res = await client.documents.findMany({
        documentNumbers: ["2024-00001"],
      });

      expect(res).toEqual({
        count: 1,
        results: [mockDoc],
      });
      expect(res.results[0].document_number).toBe("2024-00001");
    });

    test("Documents findMany: preserves multi-item envelope response unchanged", async () => {
      const mockEnvelope = {
        count: 2,
        results: [
          { title: "Doc 1", document_number: "2024-00001" },
          { title: "Doc 2", document_number: "2024-00002" },
        ],
      };
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockEnvelope,
          text: async () => JSON.stringify(mockEnvelope),
        }),
      });

      const res = await client.documents.findMany({
        documentNumbers: ["2024-00001", "2024-00002"],
      });

      expect(res).toEqual(mockEnvelope);
    });

    test("Documents findMany: preserves partial-success envelope with errors.not_found", async () => {
      const mockEnvelope = {
        count: 1,
        results: [{ title: "Doc 1", document_number: "2024-00001" }],
        errors: { not_found: ["2024-99999"] },
      };
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockEnvelope,
          text: async () => JSON.stringify(mockEnvelope),
        }),
      });

      const res = await client.documents.findMany({
        documentNumbers: ["2024-00001", "2024-99999"],
      });

      expect(res).toEqual(mockEnvelope);
      expect(res.errors?.not_found).toEqual(["2024-99999"]);
    });

    test("Public Inspection findMany: normalizes upstream bare single object into MultiLookupEnvelope", async () => {
      const mockPiDoc = {
        title: "PI Document",
        document_number: "2024-00003",
      };
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockPiDoc,
          text: async () => JSON.stringify(mockPiDoc),
        }),
      });

      const res = await client.publicInspection.findMany({
        documentNumbers: ["2024-00003"],
      });

      expect(res).toEqual({
        count: 1,
        results: [mockPiDoc],
      });
    });

    test("Agencies findMany: normalizes upstream bare single object into plain array", async () => {
      const mockAgency = {
        id: 123,
        name: "Environmental Protection Agency",
        short_name: "EPA",
      };
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockAgency,
          text: async () => JSON.stringify(mockAgency),
        }),
      });

      const res = await client.agencies.findMany({
        ids: [123],
      });

      expect(Array.isArray(res)).toBe(true);
      expect(res).toEqual([mockAgency]);
      expect(res[0].name).toBe("Environmental Protection Agency");
    });

    test("Agencies findMany: preserves multi-agency array unchanged", async () => {
      const mockAgencies = [
        { id: 123, name: "EPA" },
        { id: 456, name: "DOE" },
      ];
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockAgencies,
          text: async () => JSON.stringify(mockAgencies),
        }),
      });

      const res = await client.agencies.findMany({
        ids: [123, 456],
      });

      expect(Array.isArray(res)).toBe(true);
      expect(res).toEqual(mockAgencies);
    });

    test("Citation lookups (findByCitation / findManyByCitation) remain MultiLookupEnvelope negative control", async () => {
      const mockCitationEnvelope = {
        count: 1,
        results: [{ title: "Citation Doc", document_number: "2024-00004", citation: "89 FR 1234" }],
      };
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockCitationEnvelope,
          text: async () => JSON.stringify(mockCitationEnvelope),
        }),
      });

      const singleRes = await client.documents.findByCitation({
        citation: { volume: 89, page: 1234 },
      });
      expect(singleRes).toEqual(mockCitationEnvelope);

      const multiRes = await client.documents.findManyByCitation({
        citations: [{ volume: 89, page: 1234 }],
      });
      expect(multiRes).toEqual(mockCitationEnvelope);
    });
  });

  describe("FIX-005 — Optional is_neural Response Typing", () => {
    test("types and surfaces is_neural optional boolean on search envelope", async () => {
      const mockSearchResult = {
        count: 1,
        total_pages: 1,
        description: "Search results",
        is_neural: true,
        results: [
          {
            title: "Neural Result",
            document_number: "2024-00005",
          },
        ],
      };
      const client = new FederalRegisterClient({
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockSearchResult,
          text: async () => JSON.stringify(mockSearchResult),
        }),
      });

      const res: SearchResultEnvelope<DocumentSearchItem> = await client.documents.search({
        conditions: { term: "renewable energy", searchTypeId: 3 },
      });

      expect(res.is_neural).toBe(true);

      if ("is_neural" in res) {
        const neuralFlag: boolean | undefined = res.is_neural;
        expect(neuralFlag).toBe(true);
      }
    });
  });
});
