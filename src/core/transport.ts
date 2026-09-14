/**
 * R0-07D / R2-03 Transport and Response Decoder Core
 */

import {
  BodyKind,
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
  ApiStatusMessageError,
  SearchValidationError,
  AgencyNotFoundError,
  EffectiveDateRangeError,
  EmptyJsonObject,
  PublicInspectionIssueConditionErrorPayload,
} from "./errors";

export interface DecodedResponse {
  readonly status: number;
  readonly contentType: string | null;
  readonly bodyKind: BodyKind;
  readonly parsedJson: any;
  readonly rawText: string | null;
}


export type OperationScopedDecoder = (
  response: DecodedResponse
) => any;

/**
 * Safely decodes any Response into explicit bodyKind, parsedJson, and rawText.
 */
export async function decodeResponse(res: Response): Promise<DecodedResponse> {
  const status = res.status;
  const contentType = res.headers ? res.headers.get("content-type") : null;
  const rawText = await res.text();

  let bodyKind: BodyKind;
  let parsedJson: any = null;

  if (!rawText || rawText.trim().length === 0) {
    bodyKind = "empty";
  } else {
    try {
      parsedJson = JSON.parse(rawText);
      bodyKind = "json";
    } catch {
      bodyKind = "text";
    }
  }

  return {
    status,
    contentType,
    bodyKind,
    parsedJson,
    rawText: bodyKind === "empty" ? null : rawText,
  };
}

/**
 * Fallback generic non-2xx HTTP error classifier.
 * Preserves status, contentType, bodyKind, parsed body (when JSON), and rawText.
 * Handles generic empty body and unparseable raw text without guessing operation semantics.
 */
export function classifyGenericHttpError(decoded: DecodedResponse): FederalRegisterHttpError {
  const { status, contentType, bodyKind, parsedJson, rawText } = decoded;
  const statusText = `${status}`;

  if (bodyKind === "empty") {
    return new FederalRegisterEmptyBodyError(
      `HTTP ${statusText} returned empty body`,
      status,
      contentType,
      bodyKind,
      null,
      null
    );
  }

  if (bodyKind === "text") {
    return new FederalRegisterRawResponseError(
      `HTTP ${statusText} returned non-JSON/unparseable response body`,
      status,
      contentType,
      bodyKind,
      rawText || ""
    );
  }

  // bodyKind === "json"
  if (parsedJson && typeof parsedJson === "object") {
    // Empty JSON object: Record<string, never>
    if (Object.keys(parsedJson).length === 0) {
      return new FederalRegisterEmptyJsonError(
        `HTTP ${statusText} returned empty JSON object {}`,
        status,
        contentType,
        bodyKind,
        parsedJson as EmptyJsonObject,
        rawText
      );
    }

    // Status+message error payload: { status: 400|404|405|500, message: string }
    if (
      typeof parsedJson.message === "string" &&
      (typeof parsedJson.status === "number" || parsedJson.status == null)
    ) {
      return new FederalRegisterStatusMessageError(
        parsedJson.message,
        status,
        contentType,
        bodyKind,
        { status: parsedJson.status || status, message: parsedJson.message },
        rawText
      );
    }
  }

  // Fallback generic HTTP error preserving evidence
  return new FederalRegisterHttpError(
    `HTTP ${statusText} error`,
    status,
    contentType,
    bodyKind,
    parsedJson,
    rawText
  );
}

/**
 * Backward-compatible generic classifier alias.
 * Does NOT perform cross-operation guessing (e.g. will NOT infer AgencyNotFoundError,
 * EffectiveDateRangeError, or SearchValidationError on generic endpoints).
 */
export const classifyHttpError = classifyGenericHttpError;

/**
 * Operation-aware error classifier for Document and Public Inspection Search operations.
 * Recognizes SearchValidationError { errors: Record<string, string> }.
 */
export function classifySearchHttpError(decoded: DecodedResponse): FederalRegisterHttpError {
  if (
    decoded.bodyKind === "json" &&
    decoded.parsedJson &&
    typeof decoded.parsedJson === "object" &&
    decoded.parsedJson.errors &&
    typeof decoded.parsedJson.errors === "object" &&
    !Array.isArray(decoded.parsedJson.errors)
  ) {
    return new FederalRegisterSearchValidationError(
      `Search validation error (HTTP ${decoded.status})`,
      decoded.status,
      decoded.contentType,
      decoded.bodyKind,
      decoded.parsedJson as SearchValidationError,
      decoded.rawText
    );
  }
  return classifyGenericHttpError(decoded);
}

/**
 * Operation-aware error classifier for Agency show / individual lookup operations.
 * Recognizes AgencyNotFoundError { error: 404 } on HTTP 404.
 */
export function classifyAgencyHttpError(decoded: DecodedResponse): FederalRegisterHttpError {
  if (
    decoded.status === 404 &&
    decoded.bodyKind === "json" &&
    decoded.parsedJson &&
    decoded.parsedJson.error === 404
  ) {
    return new FederalRegisterAgencyNotFoundError(
      `Agency not found (HTTP 404)`,
      decoded.status,
      decoded.contentType,
      decoded.bodyKind,
      decoded.parsedJson as AgencyNotFoundError,
      decoded.rawText
    );
  }
  return classifyGenericHttpError(decoded);
}

/**
 * Operation-aware error classifier for Effective Dates endpoint operations.
 * Recognizes EffectiveDateRangeError { error: string }.
 */
export function classifyEffectiveDateHttpError(decoded: DecodedResponse): FederalRegisterHttpError {
  if (
    decoded.bodyKind === "json" &&
    decoded.parsedJson &&
    typeof decoded.parsedJson.error === "string"
  ) {
    return new FederalRegisterEffectiveDateRangeError(
      `Effective date range error: ${decoded.parsedJson.error}`,
      decoded.status,
      decoded.contentType,
      decoded.bodyKind,
      decoded.parsedJson as EffectiveDateRangeError,
      decoded.rawText
    );
  }
  return classifyGenericHttpError(decoded);
}

/**
 * Operation-specific decoder for Public Inspection Issue facet operations.
 * Only this decoder interprets HTTP 200 with {status:400, error:string} as a failure.
 */
export function decodePublicInspectionIssueFacetResponse(decoded: DecodedResponse): any {
  if (decoded.status >= 200 && decoded.status < 300) {
    if (
      decoded.bodyKind === "json" &&
      decoded.parsedJson &&
      decoded.parsedJson.status === 400 &&
      typeof decoded.parsedJson.error === "string"
    ) {
      throw new PublicInspectionIssueConditionError(
        decoded.parsedJson as PublicInspectionIssueConditionErrorPayload
      );
    }
    return decoded.parsedJson;
  }
  throw classifyGenericHttpError(decoded);
}

/**
 * Default JSON decoder. 2xx = success (despite any body.status); non-2xx throws generic classified error.
 */
export function decodeJsonResponse(decoded: DecodedResponse): any {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decoded.parsedJson;
  }
  throw classifyGenericHttpError(decoded);
}

/**
 * Raw text decoder for CSV, RSS, JSONP. 2xx = rawText; non-2xx throws generic classified error.
 */
export function decodeTextResponse(decoded: DecodedResponse): string | null {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decoded.rawText;
  }
  throw classifyGenericHttpError(decoded);
}

