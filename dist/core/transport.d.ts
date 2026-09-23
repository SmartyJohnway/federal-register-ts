/**
 * R0-07D / R2-03 Transport and Response Decoder Core
 */
import { BodyKind, FederalRegisterHttpError } from "./errors";
export interface DecodedResponse {
    readonly status: number;
    readonly contentType: string | null;
    readonly bodyKind: BodyKind;
    readonly parsedJson: any;
    readonly rawText: string | null;
}
export type OperationScopedDecoder = (response: DecodedResponse) => any;
/**
 * Safely decodes any Response into explicit bodyKind, parsedJson, and rawText.
 */
export declare function decodeResponse(res: Response): Promise<DecodedResponse>;
/**
 * Fallback generic non-2xx HTTP error classifier.
 * Preserves status, contentType, bodyKind, parsed body (when JSON), and rawText.
 * Handles generic empty body and unparseable raw text without guessing operation semantics.
 */
export declare function classifyGenericHttpError(decoded: DecodedResponse): FederalRegisterHttpError;
/**
 * Backward-compatible generic classifier alias.
 * Does NOT perform cross-operation guessing (e.g. will NOT infer AgencyNotFoundError,
 * EffectiveDateRangeError, or SearchValidationError on generic endpoints).
 */
export declare const classifyHttpError: typeof classifyGenericHttpError;
/**
 * Operation-aware error classifier for Document and Public Inspection Search operations.
 * Recognizes SearchValidationError { errors: Record<string, string> }.
 */
export declare function classifySearchHttpError(decoded: DecodedResponse): FederalRegisterHttpError;
/**
 * Operation-aware error classifier for Agency show / individual lookup operations.
 * Recognizes AgencyNotFoundError { error: 404 } on HTTP 404.
 */
export declare function classifyAgencyHttpError(decoded: DecodedResponse): FederalRegisterHttpError;
/**
 * Operation-aware error classifier for Effective Dates endpoint operations.
 * Recognizes EffectiveDateRangeError { error: string }.
 */
export declare function classifyEffectiveDateHttpError(decoded: DecodedResponse): FederalRegisterHttpError;
/**
 * Operation-specific decoder for Public Inspection Issue facet operations.
 * Interprets HTTP 200 with {status:400, error:string} or {status:400, errors:string} as a failure.
 */
export declare function decodePublicInspectionIssueFacetResponse(decoded: DecodedResponse): any;
/**
 * Default JSON decoder. 2xx = success (valid object/array); throws integrity error if body is empty, text, null, or primitive.
 */
export declare function decodeJsonResponse(decoded: DecodedResponse): any;
/**
 * Raw text decoder for CSV, RSS, JSONP. 2xx = rawText; non-2xx throws generic classified error.
 */
export declare function decodeTextResponse(decoded: DecodedResponse): string | null;
//# sourceMappingURL=transport.d.ts.map