import {
  FederalRegisterClient,
  FederalRegisterClientOptions,
  FederalRegisterError,
  FederalRegisterHttpError,
  FederalRegisterStatusMessageError,
  FederalRegisterSearchValidationError,
  FederalRegisterAgencyNotFoundError,
  FederalRegisterEffectiveDateRangeError,
  FederalRegisterEmptyJsonError,
  FederalRegisterEmptyBodyError,
  FederalRegisterRawResponseError,
  PublicInspectionIssueConditionError,
} from "../src/index";
import {
  decodePublicInspectionIssueFacetResponse,
  decodeTextResponse,
  decodeResponse,
} from "../src/core/transport";

describe("R2-03 Canonical Client & Core Contract Tests", () => {
  describe("Client Configuration & Isolation (F-CLIENT-01)", () => {
    test("CLIENT-01: Default instance uses default baseUrl and globalThis.fetch", () => {
      const client = new FederalRegisterClient();
      expect(client.baseUrl).toBe("https://www.federalregister.gov/api/v1");
    });

    test("CLIENT-02: Instances A and B with different configurations remain completely isolated", async () => {
      const callsA: string[] = [];
      const callsB: string[] = [];

      const fetchA: typeof fetch = jest.fn().mockImplementation(async (url: any) => {
        callsA.push(url.toString());
        return new Response(JSON.stringify({ client: "A" }), { status: 200 });
      });

      const fetchB: typeof fetch = jest.fn().mockImplementation(async (url: any) => {
        callsB.push(url.toString());
        return new Response(JSON.stringify({ client: "B" }), { status: 200 });
      });

      const clientA = new FederalRegisterClient({
        baseUrl: "https://api-a.example.com/v1/",
        fetch: fetchA,
      });

      const clientB = new FederalRegisterClient({
        baseUrl: "https://api-b.example.org/api",
        fetch: fetchB,
      });

      expect(clientA.baseUrl).toBe("https://api-a.example.com/v1");
      expect(clientB.baseUrl).toBe("https://api-b.example.org/api");

      const resA = await clientA.executeInternal({ pathOrUrl: "documents" });
      const resB = await clientB.executeInternal({ pathOrUrl: "public-inspection", queryString: "page=1" });

      expect(resA.client).toBe("A");
      expect(resB.client).toBe("B");
      expect(callsA).toEqual(["https://api-a.example.com/v1/documents"]);
      expect(callsB).toEqual(["https://api-b.example.org/api/public-inspection?page=1"]);
    });
  });

  describe("Response Body Decoding (JSON / Text / Empty)", () => {
    test("DECODE-01: Decodes valid JSON into json bodyKind", async () => {
      const res = new Response(JSON.stringify({ count: 10 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
      const decoded = await decodeResponse(res);
      expect(decoded.status).toBe(200);
      expect(decoded.bodyKind).toBe("json");
      expect(decoded.parsedJson).toEqual({ count: 10 });
    });

    test("DECODE-02: Decodes raw text / CSV / unparseable body into text bodyKind", async () => {
      const csvText = "document_number,title\n12345,Rule Title";
      const res = new Response(csvText, {
        status: 200,
        headers: { "content-type": "text/csv" },
      });
      const decoded = await decodeResponse(res);
      expect(decoded.status).toBe(200);
      expect(decoded.bodyKind).toBe("text");
      expect(decoded.parsedJson).toBeUndefined();
      expect(decoded.rawText).toBe(csvText);
    });

    test("DECODE-03: Decodes empty transport body into empty bodyKind", async () => {
      const res = new Response("", { status: 404 });
      const decoded = await decodeResponse(res);
      expect(decoded.status).toBe(404);
      expect(decoded.bodyKind).toBe("empty");
      expect(decoded.rawText).toBe("");
    });
  });

  describe("Error Hierarchy & Classification", () => {
    test("ERR-01: Throws FederalRegisterStatusMessageError for status+message payload", async () => {
      const mockFetch: typeof fetch = jest.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ status: 400, message: "Invalid query parameter" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          })
        )
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });

      await expect(client.executeInternal({ pathOrUrl: "test" })).rejects.toThrow(FederalRegisterStatusMessageError);
      try {
        await client.executeInternal({ pathOrUrl: "test" });
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterStatusMessageError);
        expect(err.status).toBe(400);
        expect(err.body.message).toBe("Invalid query parameter");
        expect(err.bodyKind).toBe("json");
      }
    });

    test("ERR-02: Throws FederalRegisterSearchValidationError for { errors: Record<string, string> }", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ errors: { term: "term too long" } }), {
          status: 400,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      await expect(client.executeInternal({ pathOrUrl: "test" })).rejects.toThrow(FederalRegisterSearchValidationError);
    });

    test("ERR-03: Throws FederalRegisterAgencyNotFoundError for { error: 404 }", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 404 }), {
          status: 404,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      await expect(client.executeInternal({ pathOrUrl: "agencies/99999" })).rejects.toThrow(FederalRegisterAgencyNotFoundError);
    });

    test("ERR-04: Throws FederalRegisterEffectiveDateRangeError for { error: string }", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Date range cannot exceed 366 days" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      await expect(client.executeInternal({ pathOrUrl: "effective-dates" })).rejects.toThrow(FederalRegisterEffectiveDateRangeError);
    });

    test("ERR-05: Throws FederalRegisterEmptyJsonError for non-2xx with {}", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response("{}", {
          status: 404,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      await expect(client.executeInternal({ pathOrUrl: "unknown" })).rejects.toThrow(FederalRegisterEmptyJsonError);
    });

    test("ERR-06: Throws FederalRegisterEmptyBodyError for non-2xx with empty transport body", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(new Response("", { status: 404 }));
      const client = new FederalRegisterClient({ fetch: mockFetch });
      await expect(client.executeInternal({ pathOrUrl: "empty" })).rejects.toThrow(FederalRegisterEmptyBodyError);
    });

    test("ERR-07: Throws FederalRegisterRawResponseError for 5xx HTML/text response preserving rawText", async () => {
      const errorHtml = "<html><body>502 Bad Gateway</body></html>";
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(errorHtml, {
          status: 502,
          headers: { "content-type": "text/html" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      try {
        await client.executeInternal({ pathOrUrl: "gateway" });
        fail("Expected error to be thrown");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterRawResponseError);
        expect(err.status).toBe(502);
        expect(err.bodyKind).toBe("text");
        expect(err.rawText).toBe(errorHtml);
      }
    });

    test("ERR-08: HTTP 405 Method Not Allowed preservation", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 405, message: "Method Not Allowed" }), {
          status: 405,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      try {
        await client.executeInternal({ pathOrUrl: "method" });
        fail("Expected error to be thrown");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterStatusMessageError);
        expect(err.status).toBe(405);
      }
    });
  });

  describe("Operation-Aware Error vs Global Guessing", () => {
    test("OP-ERR-01: HTTP 200 with { status: 400, error: string } is NOT thrown in standard JSON decoder", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 400, error: "Some notice" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      const res = await client.executeInternal({ pathOrUrl: "standard-op" });
      expect(res).toEqual({ status: 400, error: "Some notice" });
    });

    test("OP-ERR-02: PublicInspectionIssue facet decoder explicitly recognizes { status: 400, error: string }", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 400, error: "Invalid publication date condition" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      await expect(
        client.executeInternal({
          pathOrUrl: "public-inspection-issues/daily",
          decoder: decodePublicInspectionIssueFacetResponse,
        })
      ).rejects.toThrow(PublicInspectionIssueConditionError);
    });

    test("OP-ERR-03: HTTP 200 with {} is valid success", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      const res = await client.executeInternal({ pathOrUrl: "site_notifications/banner" });
      expect(res).toEqual({});
    });
  });

  describe("Format Decoders (CSV / RSS / JSONP)", () => {
    test("FMT-01: CSV text decoder returns raw text without row parsing", async () => {
      const rawCsv = "document_number,title\n1111,Sample Rule";
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(rawCsv, {
          status: 200,
          headers: { "content-type": "text/csv" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      const res = await client.executeInternal({
        pathOrUrl: "documents.csv",
        decoder: decodeTextResponse,
      });
      expect(res).toBe(rawCsv);
    });

    test("FMT-02: RSS text decoder returns raw XML text without XML parsing", async () => {
      const rawRss = "<?xml version=\"1.0\"?><rss><channel><title>FR</title></channel></rss>";
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(rawRss, {
          status: 200,
          headers: { "content-type": "application/rss+xml" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      const res = await client.executeInternal({
        pathOrUrl: "documents.rss",
        decoder: decodeTextResponse,
      });
      expect(res).toBe(rawRss);
    });

    test("FMT-03: JSONP text decoder returns raw JavaScript callback text", async () => {
      const rawJsonp = "callback({\"status\":\"ok\"});";
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(rawJsonp, {
          status: 200,
          headers: { "content-type": "application/javascript" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });
      const res = await client.executeInternal({
        pathOrUrl: "suggested_searches.jsonp",
        decoder: decodeTextResponse,
      });
      expect(res).toBe(rawJsonp);
    });
  });

  describe("Opaque Server-Navigation Exposure", () => {
    test("NAV-01: fetchOpaqueUrl executes opaque URL on originating client without parameter parsing/reconstruction", async () => {
      const serverNextUrl = "https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=energy&page=2";
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ count: 100, results: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
      const client = new FederalRegisterClient({ fetch: mockFetch });

      const page2 = await client.fetchOpaqueUrl(serverNextUrl);
      expect(page2).toEqual({ count: 100, results: [] });
      expect(mockFetch).toHaveBeenCalledWith(serverNextUrl);
    });
  });
});
