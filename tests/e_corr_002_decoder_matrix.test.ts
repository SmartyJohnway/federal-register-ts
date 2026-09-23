/**
 * E-CORR-002 2xx Decoder Matrix Test Suite
 *
 * Verifies exact 2xx JSON contract:
 * - HTTP 2xx + valid JSON object -> SUCCESS ({})
 * - HTTP 2xx + valid JSON array -> SUCCESS ([])
 * - HTTP 2xx + valid non-empty object -> SUCCESS
 * - HTTP 2xx + valid non-empty array -> SUCCESS
 * - HTTP 2xx + empty body -> FederalRegisterEmptyBodyError
 * - HTTP 2xx + whitespace-only body -> FederalRegisterEmptyBodyError
 * - HTTP 2xx + malformed JSON -> FederalRegisterRawResponseError
 * - HTTP 2xx + non-JSON text -> FederalRegisterRawResponseError
 * - HTTP 2xx + JSON null -> FederalRegisterHttpError
 * - HTTP 2xx + JSON primitive root (string / number / boolean) -> FederalRegisterHttpError
 */

import {
  decodeResponse,
  decodeJsonResponse,
} from "../src/core/transport";
import {
  FederalRegisterEmptyBodyError,
  FederalRegisterRawResponseError,
  FederalRegisterHttpError,
} from "../src/core/errors";

function makeResponse(bodyText: string, status = 200, headers: Record<string, string> = { "content-type": "application/json" }): Response {
  return new Response(bodyText, { status, headers });
}

describe("E-CORR-002 — 2xx Decoder Matrix", () => {
  test("HTTP 200 + valid empty JSON object {} -> SUCCESS", async () => {
    const res = makeResponse("{}");
    const decoded = await decodeResponse(res);
    const result = decodeJsonResponse(decoded);
    expect(result).toEqual({});
  });

  test("HTTP 200 + valid empty JSON array [] -> SUCCESS", async () => {
    const res = makeResponse("[]");
    const decoded = await decodeResponse(res);
    const result = decodeJsonResponse(decoded);
    expect(result).toEqual([]);
  });

  test("HTTP 200 + valid non-empty JSON object -> SUCCESS", async () => {
    const res = makeResponse('{"count": 10, "results": ["a"]}');
    const decoded = await decodeResponse(res);
    const result = decodeJsonResponse(decoded);
    expect(result).toEqual({ count: 10, results: ["a"] });
  });

  test("HTTP 200 + valid non-empty JSON array -> SUCCESS", async () => {
    const res = makeResponse('[{"id": 1}]');
    const decoded = await decodeResponse(res);
    const result = decodeJsonResponse(decoded);
    expect(result).toEqual([{ id: 1 }]);
  });

  test("HTTP 200 + empty body -> throws FederalRegisterEmptyBodyError", async () => {
    const res = makeResponse("");
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterEmptyBodyError);
  });

  test("HTTP 200 + whitespace-only body -> throws FederalRegisterEmptyBodyError", async () => {
    const res = makeResponse("   \n\t   ");
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterEmptyBodyError);
  });

  test("HTTP 200 + malformed JSON -> throws FederalRegisterRawResponseError", async () => {
    const res = makeResponse("{ invalid json ");
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterRawResponseError);
  });

  test("HTTP 200 + non-JSON text -> throws FederalRegisterRawResponseError", async () => {
    const res = makeResponse("<html><body>404 Not Found</body></html>", 200, { "content-type": "text/html" });
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterRawResponseError);
  });

  test("HTTP 200 + JSON null -> throws FederalRegisterHttpError", async () => {
    const res = makeResponse("null");
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterHttpError);
  });

  test("HTTP 200 + JSON primitive string root -> throws FederalRegisterHttpError", async () => {
    const res = makeResponse('"just a string"');
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterHttpError);
  });

  test("HTTP 200 + JSON primitive number root -> throws FederalRegisterHttpError", async () => {
    const res = makeResponse("12345");
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterHttpError);
  });

  test("HTTP 200 + JSON primitive boolean root -> throws FederalRegisterHttpError", async () => {
    const res = makeResponse("true");
    const decoded = await decodeResponse(res);
    expect(() => decodeJsonResponse(decoded)).toThrow(FederalRegisterHttpError);
  });
});
