"use strict";
/**
 * R0-07D / R2-03 Transport and Response Decoder Core
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyHttpError = void 0;
exports.decodeResponse = decodeResponse;
exports.classifyGenericHttpError = classifyGenericHttpError;
exports.classifySearchHttpError = classifySearchHttpError;
exports.classifyAgencyHttpError = classifyAgencyHttpError;
exports.classifyEffectiveDateHttpError = classifyEffectiveDateHttpError;
exports.decodePublicInspectionIssueFacetResponse = decodePublicInspectionIssueFacetResponse;
exports.decodeJsonResponse = decodeJsonResponse;
exports.decodeTextResponse = decodeTextResponse;
const errors_1 = require("./errors");
/**
 * Safely decodes any Response into explicit bodyKind, parsedJson, and rawText.
 */
async function decodeResponse(res) {
    const status = res.status;
    const contentType = res.headers ? res.headers.get("content-type") : null;
    const rawText = await res.text();
    let bodyKind;
    let parsedJson = null;
    if (!rawText || rawText.trim().length === 0) {
        bodyKind = "empty";
    }
    else {
        try {
            parsedJson = JSON.parse(rawText);
            bodyKind = "json";
        }
        catch {
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
function classifyGenericHttpError(decoded) {
    const { status, contentType, bodyKind, parsedJson, rawText } = decoded;
    const statusText = `${status}`;
    if (bodyKind === "empty") {
        return new errors_1.FederalRegisterEmptyBodyError(`HTTP ${statusText} returned empty body`, status, contentType, bodyKind, null, null);
    }
    if (bodyKind === "text") {
        return new errors_1.FederalRegisterRawResponseError(`HTTP ${statusText} returned non-JSON/unparseable response body`, status, contentType, bodyKind, rawText || "");
    }
    // bodyKind === "json"
    if (parsedJson && typeof parsedJson === "object") {
        // Empty JSON object: Record<string, never>
        if (Object.keys(parsedJson).length === 0) {
            return new errors_1.FederalRegisterEmptyJsonError(`HTTP ${statusText} returned empty JSON object {}`, status, contentType, bodyKind, parsedJson, rawText);
        }
        // Status+message error payload: { status: 400|404|405|500, message: string }
        if (typeof parsedJson.message === "string" &&
            (typeof parsedJson.status === "number" || parsedJson.status == null)) {
            return new errors_1.FederalRegisterStatusMessageError(parsedJson.message, status, contentType, bodyKind, { status: parsedJson.status || status, message: parsedJson.message }, rawText);
        }
    }
    // Fallback generic HTTP error preserving evidence
    return new errors_1.FederalRegisterHttpError(`HTTP ${statusText} error`, status, contentType, bodyKind, parsedJson, rawText);
}
/**
 * Backward-compatible generic classifier alias.
 * Does NOT perform cross-operation guessing (e.g. will NOT infer AgencyNotFoundError,
 * EffectiveDateRangeError, or SearchValidationError on generic endpoints).
 */
exports.classifyHttpError = classifyGenericHttpError;
/**
 * Operation-aware error classifier for Document and Public Inspection Search operations.
 * Recognizes SearchValidationError { errors: Record<string, string> }.
 */
function classifySearchHttpError(decoded) {
    if (decoded.bodyKind === "json" &&
        decoded.parsedJson &&
        typeof decoded.parsedJson === "object" &&
        decoded.parsedJson.errors &&
        typeof decoded.parsedJson.errors === "object" &&
        !Array.isArray(decoded.parsedJson.errors)) {
        return new errors_1.FederalRegisterSearchValidationError(`Search validation error (HTTP ${decoded.status})`, decoded.status, decoded.contentType, decoded.bodyKind, decoded.parsedJson, decoded.rawText);
    }
    return classifyGenericHttpError(decoded);
}
/**
 * Operation-aware error classifier for Agency show / individual lookup operations.
 * Recognizes AgencyNotFoundError { error: 404 } on HTTP 404.
 */
function classifyAgencyHttpError(decoded) {
    if (decoded.status === 404 &&
        decoded.bodyKind === "json" &&
        decoded.parsedJson &&
        decoded.parsedJson.error === 404) {
        return new errors_1.FederalRegisterAgencyNotFoundError(`Agency not found (HTTP 404)`, decoded.status, decoded.contentType, decoded.bodyKind, decoded.parsedJson, decoded.rawText);
    }
    return classifyGenericHttpError(decoded);
}
/**
 * Operation-aware error classifier for Effective Dates endpoint operations.
 * Recognizes EffectiveDateRangeError { error: string }.
 */
function classifyEffectiveDateHttpError(decoded) {
    if (decoded.bodyKind === "json" &&
        decoded.parsedJson &&
        typeof decoded.parsedJson.error === "string") {
        return new errors_1.FederalRegisterEffectiveDateRangeError(`Effective date range error: ${decoded.parsedJson.error}`, decoded.status, decoded.contentType, decoded.bodyKind, decoded.parsedJson, decoded.rawText);
    }
    return classifyGenericHttpError(decoded);
}
/**
 * Operation-specific decoder for Public Inspection Issue facet operations.
 * Interprets HTTP 200 with {status:400, error:string} or {status:400, errors:string} as a failure.
 */
function decodePublicInspectionIssueFacetResponse(decoded) {
    if (decoded.status >= 200 && decoded.status < 300) {
        if (decoded.bodyKind === "empty") {
            throw new errors_1.FederalRegisterEmptyBodyError(`HTTP ${decoded.status} returned empty response body for JSON request`, decoded.status, decoded.contentType, decoded.bodyKind, null, null);
        }
        if (decoded.bodyKind === "text") {
            throw new errors_1.FederalRegisterRawResponseError(`HTTP ${decoded.status} returned non-JSON response body`, decoded.status, decoded.contentType, decoded.bodyKind, decoded.rawText || "");
        }
        if (decoded.bodyKind === "json" &&
            decoded.parsedJson &&
            decoded.parsedJson.status === 400 &&
            (typeof decoded.parsedJson.error === "string" || typeof decoded.parsedJson.errors === "string")) {
            throw new errors_1.PublicInspectionIssueConditionError(decoded.parsedJson);
        }
        if (decoded.parsedJson == null || typeof decoded.parsedJson !== "object") {
            throw new errors_1.FederalRegisterHttpError(`HTTP ${decoded.status} returned non-object JSON root: ${JSON.stringify(decoded.parsedJson)}`, decoded.status, decoded.contentType, decoded.bodyKind, decoded.parsedJson, decoded.rawText);
        }
        return decoded.parsedJson;
    }
    throw classifyGenericHttpError(decoded);
}
/**
 * Default JSON decoder. 2xx = success (valid object/array); throws integrity error if body is empty, text, null, or primitive.
 */
function decodeJsonResponse(decoded) {
    if (decoded.status >= 200 && decoded.status < 300) {
        if (decoded.bodyKind === "empty") {
            throw new errors_1.FederalRegisterEmptyBodyError(`HTTP ${decoded.status} returned empty response body for JSON request`, decoded.status, decoded.contentType, decoded.bodyKind, null, null);
        }
        if (decoded.bodyKind === "text") {
            throw new errors_1.FederalRegisterRawResponseError(`HTTP ${decoded.status} returned non-JSON response body`, decoded.status, decoded.contentType, decoded.bodyKind, decoded.rawText || "");
        }
        if (decoded.parsedJson == null || typeof decoded.parsedJson !== "object") {
            throw new errors_1.FederalRegisterHttpError(`HTTP ${decoded.status} returned non-object JSON root: ${JSON.stringify(decoded.parsedJson)}`, decoded.status, decoded.contentType, decoded.bodyKind, decoded.parsedJson, decoded.rawText);
        }
        return decoded.parsedJson;
    }
    throw classifyGenericHttpError(decoded);
}
/**
 * Raw text decoder for CSV, RSS, JSONP. 2xx = rawText; non-2xx throws generic classified error.
 */
function decodeTextResponse(decoded) {
    if (decoded.status >= 200 && decoded.status < 300) {
        return decoded.rawText;
    }
    throw classifyGenericHttpError(decoded);
}
//# sourceMappingURL=transport.js.map