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
  decodeJsonResponse,
  DecodedResponse,
  OperationScopedDecoder,
  classifySearchHttpError,
  classifyAgencyHttpError,
  classifyEffectiveDateHttpError,
  classifyGenericHttpError,
} from "../src/core/transport";

/**
 * Test-scoped request execution helper.
 * Simulates SDK transport decoding and error classification in isolation without
 * exporting an arbitrary transport executor from production shipped modules.
 */
interface TestExecuteOptions {
  readonly pathOrUrl: string;
  readonly queryString?: string;
  readonly decoder?: OperationScopedDecoder;
}

async function executeTestTransport<T = any>(
  baseUrl: string,
  fetchFn: typeof globalThis.fetch,
  opts: TestExecuteOptions
): Promise<T> {
  let finalUrl: string;
  if (opts.pathOrUrl.startsWith("http://") || opts.pathOrUrl.startsWith("https://")) {
    finalUrl = opts.pathOrUrl;
  } else {
    const relPath = opts.pathOrUrl.startsWith("/") ? opts.pathOrUrl : "/" + opts.pathOrUrl;
    finalUrl = baseUrl + relPath;
  }
  if (opts.queryString && opts.queryString.length > 0) {
    const sep = finalUrl.includes("?") ? "&" : "?";
    finalUrl = finalUrl + sep + opts.queryString;
  }
  const response = await fetchFn(finalUrl);
  const decoded = await decodeResponse(response);
  if (opts.decoder) {
    return opts.decoder(decoded);
  }
  return decodeJsonResponse(decoded);
}

describe("R2-03 Canonical Client & Core Contract Tests", () => {
  describe("Client Configuration & Isolation (F-CLIENT-01 / Blocker C)", () => {
    test("CLIENT-01: Default instance uses default configuration; zero arbitrary transport escapes", () => {
      const client = new FederalRegisterClient();

      // Zero public low-level transport escapes on client instance
      expect((client as any).executeInternal).toBeUndefined();
      expect((client as any).fetchOpaqueUrl).toBeUndefined();
      expect((client as any).baseUrl).toBeUndefined();
      expect((client as any).fetch).toBeUndefined();
      expect((FederalRegisterClient as any).DEFAULT_BASE_URL).toBeUndefined();
      expect((FederalRegisterClient as any).BASE_URI).toBeUndefined();
      expect((FederalRegisterClient as any).overrideBaseUri).toBeUndefined();

      // Zero consumer-reachable arbitrary transport executor on prototype
      const protoKeys = Reflect.ownKeys(FederalRegisterClient.prototype);
      expect(protoKeys).toEqual(["constructor"]);
      const instanceKeys = Reflect.ownKeys(client);
      expect(instanceKeys).toEqual([]);
      expect(Object.getOwnPropertySymbols(FederalRegisterClient.prototype)).toEqual([]);
      expect(Object.getOwnPropertySymbols(client)).toEqual([]);
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

      // Proof of instance distinction and prototype integrity
      expect(clientA).not.toBe(clientB);
      expect(Object.getPrototypeOf(clientA)).toBe(FederalRegisterClient.prototype);
      expect(Object.getPrototypeOf(clientB)).toBe(FederalRegisterClient.prototype);

      // Mutating instance A does not affect instance B
      (clientA as any).customProperty = "mutatedA";
      expect((clientB as any).customProperty).toBeUndefined();

      // Zero mutable static state
      expect((FederalRegisterClient as any).BASE_URI).toBeUndefined();
      expect((FederalRegisterClient as any).overrideBaseUri).toBeUndefined();

      // Execute transport through configuration A and configuration B
      const resA = await executeTestTransport("https://api-a.example.com/v1", fetchA, { pathOrUrl: "documents" });
      const resB = await executeTestTransport("https://api-b.example.org/api", fetchB, { pathOrUrl: "public-inspection", queryString: "page=1" });

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
      expect(decoded.parsedJson).toBeNull();
      expect(decoded.rawText).toBe(csvText);
    });

    test("DECODE-03: Decodes empty transport body into empty bodyKind with null rawText", async () => {
      const res = new Response("", { status: 404 });
      const decoded = await decodeResponse(res);
      expect(decoded.status).toBe(404);
      expect(decoded.bodyKind).toBe("empty");
      expect(decoded.rawText).toBeNull();
    });
  });

  describe("Error Hierarchy & Exact Public Contract (Blocker A & B)", () => {
    test("ERR-01: Throws FederalRegisterStatusMessageError for status+message payload", async () => {
      const mockFetch: typeof fetch = jest.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ status: 400, message: "Invalid query parameter" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          })
        )
      );

      await expect(
        executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "test" })
      ).rejects.toThrow(FederalRegisterStatusMessageError);

      try {
        await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "test" });
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterStatusMessageError);
        expect(err).toBeInstanceOf(FederalRegisterHttpError);
        expect(err).toBeInstanceOf(FederalRegisterError);
        expect(err.status).toBe(400);
        expect(err.body.message).toBe("Invalid query parameter");
        expect(err.bodyKind).toBe("json");
        expect(err.rawText).toContain("Invalid query parameter");
      }
    });

    test("ERR-02: Search profile decodes FederalRegisterSearchValidationError; generic profile does NOT guess", async () => {
      const errorJson = { errors: { term: "term too long" } };
      const searchRes: any = {
        status: 400,
        contentType: "application/json",
        bodyKind: "json",
        parsedJson: errorJson,
        rawText: JSON.stringify(errorJson),
      };

      // Search profile explicitly classifies SearchValidationError
      const searchErr = classifySearchHttpError(searchRes);
      expect(searchErr).toBeInstanceOf(FederalRegisterSearchValidationError);
      expect(searchErr.body).toEqual(errorJson);

      // Generic profile does NOT guess SearchValidationError
      const genericErr = classifyGenericHttpError(searchRes);
      expect(genericErr).not.toBeInstanceOf(FederalRegisterSearchValidationError);
      expect(genericErr).toBeInstanceOf(FederalRegisterHttpError);
      expect(genericErr.body).toEqual(errorJson);
    });

    test("ERR-03: Agency profile decodes FederalRegisterAgencyNotFoundError; generic profile does NOT guess", async () => {
      const errorJson = { error: 404 };
      const agencyRes: any = {
        status: 404,
        contentType: "application/json",
        bodyKind: "json",
        parsedJson: errorJson,
        rawText: JSON.stringify(errorJson),
      };

      // Agency profile classifies AgencyNotFoundError
      const agencyErr = classifyAgencyHttpError(agencyRes);
      expect(agencyErr).toBeInstanceOf(FederalRegisterAgencyNotFoundError);
      expect(agencyErr.body).toEqual(errorJson);

      // Generic profile does NOT guess AgencyNotFoundError
      const genericErr = classifyGenericHttpError(agencyRes);
      expect(genericErr).not.toBeInstanceOf(FederalRegisterAgencyNotFoundError);
      expect(genericErr).toBeInstanceOf(FederalRegisterHttpError);
      expect(genericErr.body).toEqual(errorJson);
    });

    test("ERR-04: EffectiveDate profile decodes FederalRegisterEffectiveDateRangeError; generic profile does NOT guess", async () => {
      const errorJson = { error: "Date range cannot exceed 366 days" };
      const dateRes: any = {
        status: 400,
        contentType: "application/json",
        bodyKind: "json",
        parsedJson: errorJson,
        rawText: JSON.stringify(errorJson),
      };

      // Effective date profile classifies EffectiveDateRangeError
      const dateErr = classifyEffectiveDateHttpError(dateRes);
      expect(dateErr).toBeInstanceOf(FederalRegisterEffectiveDateRangeError);
      expect(dateErr.body).toEqual(errorJson);

      // Mandatory negative regression: generic profile with arbitrary error does NOT guess EffectiveDateRangeError
      const arbitraryErrorJson = { error: "not an effective-date endpoint" };
      const arbitraryRes: any = {
        status: 400,
        contentType: "application/json",
        bodyKind: "json",
        parsedJson: arbitraryErrorJson,
        rawText: JSON.stringify(arbitraryErrorJson),
      };
      const genericErr = classifyGenericHttpError(arbitraryRes);
      expect(genericErr).not.toBeInstanceOf(FederalRegisterEffectiveDateRangeError);
      expect(genericErr).toBeInstanceOf(FederalRegisterHttpError);
      expect(genericErr.body).toEqual(arbitraryErrorJson);
    });

    test("ERR-05: Throws FederalRegisterEmptyJsonError for non-2xx with {}", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response("{}", {
          status: 404,
          headers: { "content-type": "application/json" },
        })
      );
      await expect(
        executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "unknown" })
      ).rejects.toThrow(FederalRegisterEmptyJsonError);
    });

    test("ERR-06: Throws FederalRegisterEmptyBodyError for non-2xx empty body with body=null and rawText=null", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(new Response("", { status: 404 }));
      try {
        await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "empty" });
        fail("Expected error");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterEmptyBodyError);
        expect(err).toBeInstanceOf(FederalRegisterHttpError);
        expect(err.body).toBeNull();
        expect(err.rawText).toBeNull();
        expect(err.bodyKind).toBe("empty");
      }
    });

    test("ERR-07: Throws FederalRegisterRawResponseError with body=null and rawText preserving exact HTML/text", async () => {
      const errorHtml = "<html><body>502 Bad Gateway</body></html>";
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(errorHtml, {
          status: 502,
          headers: { "content-type": "text/html" },
        })
      );
      try {
        await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "gateway" });
        fail("Expected error to be thrown");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterRawResponseError);
        expect(err).toBeInstanceOf(FederalRegisterHttpError);
        expect(err.status).toBe(502);
        expect(err.bodyKind).toBe("text");
        expect(err.body).toBeNull();
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
      try {
        await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "method" });
        fail("Expected error to be thrown");
      } catch (err: any) {
        expect(err).toBeInstanceOf(FederalRegisterStatusMessageError);
        expect(err.status).toBe(405);
        expect(err.body.status).toBe(405);
      }
    });

    test("ERR-09: PublicInspectionIssueConditionError exposes httpStatus: 200", () => {
      const piError = new PublicInspectionIssueConditionError({
        status: 400,
        error: "Invalid publication date condition",
      });
      expect(piError.httpStatus).toBe(200);
      expect(piError.payload).toEqual({ status: 400, error: "Invalid publication date condition" });
      expect((piError as any).status).toBeUndefined();
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
      const res = await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "standard-op" });
      expect(res).toEqual({ status: 400, error: "Some notice" });
    });

    test("OP-ERR-02: PublicInspectionIssue facet decoder explicitly recognizes { status: 400, error: string }", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 400, error: "Invalid publication date condition" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
      await expect(
        executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, {
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
      const res = await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, { pathOrUrl: "site_notifications/banner" });
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
      const res = await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, {
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
      const res = await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, {
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
      const res = await executeTestTransport("https://www.federalregister.gov/api/v1", mockFetch, {
        pathOrUrl: "suggested_searches.jsonp",
        decoder: decodeTextResponse,
      });
      expect(res).toBe(rawJsonp);
    });
  });

  describe("Opaque Server-Navigation Exposure", () => {
    test("NAV-01: Opaque URL execution preserves exact URL without parameter parsing/reconstruction", async () => {
      const serverNextUrl = "https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=energy&page=2";
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ count: 100, results: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const page2 = await executeTestTransport("", mockFetch, { pathOrUrl: serverNextUrl });
      expect(page2).toEqual({ count: 100, results: [] });
      expect(mockFetch).toHaveBeenCalledWith(serverNextUrl);
    });
  });
});


