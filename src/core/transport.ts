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
  EmptyBody,
  PublicInspectionIssueConditionErrorPayload,
} from "./errors";

export interface DecodedResponse {
  readonly status: number;
  readonly contentType: string | null;
  readonly bodyKind: BodyKind;
  readonly parsedJson: any;
  readonly rawText: string;
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
  let parsedJson: any = undefined;

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
    rawText,
  };
}

/**
 * Canonical non-2xx HTTP error classifier.
 * Maps well-known wire error shapes into typed FederalRegisterHttpError subclasses.
 */
export function classifyHttpError(decoded: DecodedResponse): FederalRegisterHttpError {
  const { status, contentType, bodyKind, parsedJson, rawText } = decoded;
  const statusText = `${status}`;

  if (bodyKind === "empty") {
    return new FederalRegisterEmptyBodyError(
      `HTTP ${statusText} returned empty body`,
      status,
      contentType,
      bodyKind,
      { kind: "empty-body" },
      rawText
    );
  }
	  if (bodyKind === "text") {
    return new FederalRegisterRawResponseError(
      `HTTP ${statusText} returned non-JSON/unparseable response body`,
      status,
      contentType,
      bodyKind,
      rawText
    );
  }

  // bodyKind === "json"
  if (parsedJson && typeof parsedJson === "object") {
    // 1. Empty JSON object: Record<string, never>
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

    // 2. AgencyNotFoundError: { error: 404 }
    if (parsedJson.error === 404) {
      return new FederalRegisterAgencyNotFoundError(
        `Agency not found (HTTP ${statusText})`,
        status,
        contentType,
        bodyKind,
        parsedJson as AgencyNotFoundError,
        rawText
      );
    }

    // 3. EffectiveDateRangeError: { error: string }
    if (typeof parsedJson.error === "string") {
      return new FederalRegisterEffectiveDateRangeError(
        `EFfective date range error: ${parsedJson.error}`,
        status,
        contentType,
        bodyKind,
        parsedJson as EffectiveDateRangeError,
        rawText
      );
    }

    // 4. SearchValidationError: {errors: Record<string, string> }
    if (
      parsedJson.errors &&
      typeof parsedJson.errors === "object" &&
      !Array.isArray(parsedJson.errors)
    ) {
      return new FederalRegisterSearchValidationError(
        `Search validation error (HTTP ${statusText})`,
        status,
        contentType,
        bodyKind,
        parsedJson as SearchValidationError,
        rawText
      );
    }

    // 5. ApiStatusMessageError: {status: 400|404|405|500, message: string }
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


  // Fallback to generic FederalRegisterHttpError
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
  throw classifyHttpError(decoded);
}

/**
 * Default JSON decoder. 2xx = success (despite any body.status); non-2xx throws classified error.
 */
export function decodeJsonResponse(decoded: DecodedResponse): any {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decoded.parsedJson;
  }
  throw classifyHttpError(decoded);
}

/**
 * Raw text decoder for CSV, RSS, JSONP. 2xx = rawText; non-2xx throws classified error.
 */
export function decodeTextResponse(decoded: DecodedResponse): string {
  if (decoded.status >= 200 && decoded.status < 300) {
    return decoded.rawText;
  }
  throw classifyHttpError(decoded);
}
