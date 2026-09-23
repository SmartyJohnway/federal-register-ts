"use strict";
/**
 * R0-07D / R2-03 Canonical Error Hierarchy
 *
 * Implements the frozen error contract defined in:
 * - R0-07D_Response_Error_Format_Navigation_Contract_2026-09-12.md
 * - r0-07d_response_error_format_registry.json
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInspectionIssueConditionError = exports.FederalRegisterRawResponseError = exports.FederalRegisterEmptyBodyError = exports.FederalRegisterEmptyJsonError = exports.FederalRegisterEffectiveDateRangeError = exports.FederalRegisterAgencyNotFoundError = exports.FederalRegisterSearchValidationError = exports.FederalRegisterStatusMessageError = exports.FederalRegisterHttpError = exports.FederalRegisterError = void 0;
/**
 * Base class for server/API errors thrown by the SDK.
 * Partial-success envelopes do NOT throw or inherit from this class.
 * Note: Client-side parameter validation errors (`RequestValidationError`) extend native `Error`
 * directly and are thrown prior to dispatching HTTP requests. Raw `fetch` network transport errors
 * propagate directly from the underlying `fetch` implementation without SDK wrapping.
 */
class FederalRegisterError extends Error {
    constructor(message) {
        super(message);
        this.name = "FederalRegisterError";
    }
}
exports.FederalRegisterError = FederalRegisterError;
/**
 * Base class for non-2xx HTTP transport failures as well as 2xx response body anomalies
 * (e.g. FederalRegisterEmptyJsonError, FederalRegisterEmptyBodyError, FederalRegisterRawResponseError).
 * Preserves status, contentType, bodyKind, parsed body (if available), and rawText.
 * Absences are strictly represented by null.
 */
class FederalRegisterHttpError extends FederalRegisterError {
    constructor(message, status, contentType, bodyKind, body, rawText) {
        super(message);
        this.name = "FederalRegisterHttpError";
        this.status = status;
        this.contentType = contentType;
        this.bodyKind = bodyKind;
        this.body = body;
        this.rawText = rawText;
    }
}
exports.FederalRegisterHttpError = FederalRegisterHttpError;
class FederalRegisterStatusMessageError extends FederalRegisterHttpError {
    constructor(message, status, contentType, bodyKind, body, rawText) {
        super(message, status, contentType, bodyKind, body, rawText);
        this.name = "FederalRegisterStatusMessageError";
    }
}
exports.FederalRegisterStatusMessageError = FederalRegisterStatusMessageError;
class FederalRegisterSearchValidationError extends FederalRegisterHttpError {
    constructor(message, status, contentType, bodyKind, body, rawText) {
        super(message, status, contentType, bodyKind, body, rawText);
        this.name = "FederalRegisterSearchValidationError";
    }
}
exports.FederalRegisterSearchValidationError = FederalRegisterSearchValidationError;
class FederalRegisterAgencyNotFoundError extends FederalRegisterHttpError {
    constructor(message, status, contentType, bodyKind, body, rawText) {
        super(message, status, contentType, bodyKind, body, rawText);
        this.name = "FederalRegisterAgencyNotFoundError";
    }
}
exports.FederalRegisterAgencyNotFoundError = FederalRegisterAgencyNotFoundError;
class FederalRegisterEffectiveDateRangeError extends FederalRegisterHttpError {
    constructor(message, status, contentType, bodyKind, body, rawText) {
        super(message, status, contentType, bodyKind, body, rawText);
        this.name = "FederalRegisterEffectiveDateRangeError";
    }
}
exports.FederalRegisterEffectiveDateRangeError = FederalRegisterEffectiveDateRangeError;
class FederalRegisterEmptyJsonError extends FederalRegisterHttpError {
    constructor(message, status, contentType, bodyKind, body, rawText) {
        super(message, status, contentType, bodyKind, body, rawText);
        this.name = "FederalRegisterEmptyJsonError";
    }
}
exports.FederalRegisterEmptyJsonError = FederalRegisterEmptyJsonError;
class FederalRegisterEmptyBodyError extends FederalRegisterHttpError {
    constructor(message, status, contentType, bodyKind, body = null, rawText = null) {
        super(message, status, contentType, bodyKind, null, null);
        this.name = "FederalRegisterEmptyBodyError";
    }
}
exports.FederalRegisterEmptyBodyError = FederalRegisterEmptyBodyError;
class FederalRegisterRawResponseError extends FederalRegisterHttpError {
    constructor(message, status, contentType, bodyKind, rawText) {
        super(message, status, contentType, bodyKind, null, rawText);
        this.name = "FederalRegisterRawResponseError";
    }
}
exports.FederalRegisterRawResponseError = FederalRegisterRawResponseError;
/**
 * Thrown only when an explicit Public Inspection Issue facet operation decoder
 * encounters HTTP 200 with { status: 400, error: string } or { status: 400, errors: string }.
 * Not thrown by global body heuristic.
 */
class PublicInspectionIssueConditionError extends FederalRegisterError {
    constructor(payload) {
        const errorMsg = payload.error || payload.errors || "Unknown condition error";
        super(`Public Inspection Issue condition error: ${errorMsg}`);
        this.httpStatus = 200;
        this.name = "PublicInspectionIssueConditionError";
        this.payload = payload;
    }
}
exports.PublicInspectionIssueConditionError = PublicInspectionIssueConditionError;
//# sourceMappingURL=errors.js.map