/**
 * E-CORR-006 Public Inspection Issue Facet Decoder Test Suite
 *
 * Verifies operation-specific PI issue facet decoder rules:
 * - HTTP 200 + valid facet object -> SUCCESS
 * - HTTP 200 + {status: 400, error: "x"} -> PublicInspectionIssueConditionError
 * - HTTP 200 + {status: 400, errors: "x"} -> PublicInspectionIssueConditionError
 * - HTTP 200 + {status: 400, error: "x", errors: "y"} -> PublicInspectionIssueConditionError
 * - HTTP 200 + unrelated object containing status (e.g. {status: "ok", results: []}) -> SUCCESS
 * - Representative non-2xx response (e.g. 500) -> throws generic classified error
 */

import {
  decodeResponse,
  decodePublicInspectionIssueFacetResponse,
} from "../src/core/transport";
import {
  PublicInspectionIssueConditionError,
  FederalRegisterHttpError,
} from "../src/core/errors";

function makeResponse(bodyText: string, status = 200, headers: Record<string, string> = { "content-type": "application/json" }): Response {
  return new Response(bodyText, { status, headers });
}

describe("E-CORR-006 — Public Inspection Issue Facet Decoder Matrix", () => {
  test("HTTP 200 + valid facet object -> SUCCESS", async () => {
    const payload = { "2026-09-16": 12, "2026-09-17": 5 };
    const res = makeResponse(JSON.stringify(payload));
    const decoded = await decodeResponse(res);
    const result = decodePublicInspectionIssueFacetResponse(decoded);
    expect(result).toEqual(payload);
  });

  test('HTTP 200 + {"status":400,"error":"x"} -> throws PublicInspectionIssueConditionError', async () => {
    const payload = { status: 400, error: "Publication date is required" };
    const res = makeResponse(JSON.stringify(payload));
    const decoded = await decodeResponse(res);
    expect(() => decodePublicInspectionIssueFacetResponse(decoded)).toThrow(
      PublicInspectionIssueConditionError
    );
  });

  test('HTTP 200 + {"status":400,"errors":"x"} -> throws PublicInspectionIssueConditionError', async () => {
    const payload = { status: 400, errors: "Invalid date format" };
    const res = makeResponse(JSON.stringify(payload));
    const decoded = await decodeResponse(res);
    expect(() => decodePublicInspectionIssueFacetResponse(decoded)).toThrow(
      PublicInspectionIssueConditionError
    );
  });

  test('HTTP 200 + {"status":400,"error":"x","errors":"y"} -> throws PublicInspectionIssueConditionError', async () => {
    const payload = { status: 400, error: "Main error", errors: "Sub error" };
    const res = makeResponse(JSON.stringify(payload));
    const decoded = await decodeResponse(res);
    expect(() => decodePublicInspectionIssueFacetResponse(decoded)).toThrow(
      PublicInspectionIssueConditionError
    );
  });

  test('HTTP 200 + unrelated object containing status {"status":"ok","count":5} -> SUCCESS', async () => {
    const payload = { status: "ok", count: 5 };
    const res = makeResponse(JSON.stringify(payload));
    const decoded = await decodeResponse(res);
    const result = decodePublicInspectionIssueFacetResponse(decoded);
    expect(result).toEqual(payload);
  });

  test("Representative non-2xx response (500) -> throws generic classified FederalRegisterHttpError", async () => {
    const payload = { error: "Internal Server Error" };
    const res = makeResponse(JSON.stringify(payload), 500);
    const decoded = await decodeResponse(res);
    expect(() => decodePublicInspectionIssueFacetResponse(decoded)).toThrow(
      FederalRegisterHttpError
    );
  });
});
