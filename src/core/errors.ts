/**
 * R0-07D / R2-03 Canonical Error Hierarchy
 *
 * Implements the frozen error contract defined in:
 * - R0-07D_Response_Error_Format_Navigation_Contract_2026-09-12.md
 * - r0-07d_response_error_format_registry.json
 */

export type BodyKind = "json" | "text" | "empty";

export interface ApiStatusMessageError {
  readonly status: 400 | 404 | 405 | 500;
  readonly message: string;
}

export interface SearchValidationError {
  readonly errors: Record<string, string>;
}

export interface AgencyNotFoundError {
  readonly error: 404;
}

export interface EffectiveDateRangeError {
  readonly error: string;
}

export type EmptyJsonObject = Record<string, never>;

export interface EmptyBody {
  readonly kind: "empty-body";
}

export interface MultiLookupNotFoundErrors {
  readonly not_found: string[];
}

export interface PublicInspectionIssueConditionErrorPayload {
  readonly status: 400;
  readonly error: string;
}

/**
 * Base class for all thrown SDK failures.
 * Partial-success envelopes do NOT throw or inherit from this class.
 */
export class FederalRegisterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FederalRegisterError";
  }
}

/**
 * Base class for non-2xx HTTP transport failures.
 * Preserves status, contentType, bodyKind, parsed body (if available), and rawText.
 */
export class FederalRegisterHttpError<TBody = unknown> extends FederalRegisterError {
  public readonly status: number;
  public readonly contentType: string | null;
  public readonly bodyKind: BodyKind;
  public readonly body: TBody | undefined;
  public readonly rawText: string | undefined;

  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    body?: TBody,
    rawText?: string
  ) {
    super(message);
    this.name = "FederalRegisterHttpError";
    this.status = status;
    this.contentType = contentType;
    this.bodyKind = bodyKind;
    this.body = body;
    this.rawText = rawText;
  }
}

export class FederalRegisterStatusMessageError extends FederalRegisterHttpError<ApiStatusMessageError> {
  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    body: ApiStatusMessageError,
    rawText?: string
  ) {
    super(message, status, contentType, bodyKind, body, rawText);
    this.name = "FederalRegisterStatusMessageError";
  }
}

export class FederalRegisterSearchValidationError extends FederalRegisterHttpError<SearchValidationError> {
  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    body: SearchValidationError,
    rawText?: string
  ) {
    super(message, status, contentType, bodyKind, body, rawText);
    this.name = "FederalRegisterSearchValidationError";
  }
}

export class FederalRegisterAgencyNotFoundError extends FederalRegisterHttpError<AgencyNotFoundError> {
  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    body: AgencyNotFoundError,
    rawText?: string
  ) {
    super(message, status, contentType, bodyKind, body, rawText);
    this.name = "FederalRegisterAgencyNotFoundError";
  }
}

export class FederalRegisterEffectiveDateRangeError extends FederalRegisterHttpError<EffectiveDateRangeError> {
  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    body: EffectiveDateRangeError,
    rawText?: string
  ) {
    super(message, status, contentType, bodyKind, body, rawText);
    this.name = "FederalRegisterEffectiveDateRangeError";
  }
}

export class FederalRegisterEmptyJsonError extends FederalRegisterHttpError<EmptyJsonObject> {
  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    body: EmptyJsonObject,
    rawText?: string
  ) {
    super(message, status, contentType, bodyKind, body, rawText);
    this.name = "FederalRegisterEmptyJsonError";
  }
}

export class FederalRegisterEmptyBodyError extends FederalRegisterHttpError<EmptyBody> {
  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    body?: EmptyBody,
    rawText?: string
  ) {
    super(message, status, contentType, bodyKind, body || { kind: "empty-body" }, rawText);
    this.name = "FederalRegisterEmptyBodyError";
  }
}

export class FederalRegisterRawResponseError extends FederalRegisterHttpError<string> {
  constructor(
    message: string,
    status: number,
    contentType: string | null,
    bodyKind: BodyKind,
    rawText: string
  ) {
    super(message, status, contentType, bodyKind, rawText, rawText);
    this.name = "FederalRegisterRawResponseError";
  }
}

/**
 * Thrown only when an explicit Public Inspection Issue facet operation decoder
 * encounters HTTP 200 with { status: 400, error: string }.
 * Not thrown by global body heuristic.
 */
export class PublicInspectionIssueConditionError extends FederalRegisterError {
  public readonly status = 200;
  public readonly payload: PublicInspectionIssueConditionErrorPayload;

  constructor(payload: PublicInspectionIssueConditionErrorPayload) {
    super(`Public Inspection Issue condition error: ${payload.error}`);
    this.name = "PublicInspectionIssueConditionError";
    this.payload = payload;
  }
}
