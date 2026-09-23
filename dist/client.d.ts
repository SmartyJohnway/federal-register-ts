export declare class ResponseError extends Error {
    statusCode: number;
    body: any;
    constructor(message: string, statusCode: number, body: any);
}
export declare class BadRequest extends ResponseError {
    constructor(body: any);
}
export declare class RecordNotFound extends ResponseError {
    constructor(body: any);
}
export declare class ServerError extends ResponseError {
    constructor(body: any);
}
export declare class ServiceUnavailable extends ResponseError {
    constructor(body: any);
}
export declare class GatewayTimeout extends ResponseError {
    constructor(body: any);
}
import { DocumentSearchDetails } from "./document_search_details";
import { PublicInspectionDocumentSearchDetails } from "./public_inspection_document_search_details";
export declare class Client {
    private static _BASE_URI;
    static get BASE_URI(): string;
    static get(urlPath: string, queryParams?: Record<string, any>): Promise<any>;
    static overrideBaseUri(uri: string): void;
    static getDocumentSearchDetails(args: Record<string, any>): Promise<DocumentSearchDetails>;
    static getPublicInspectionDocumentSearchDetails(args: Record<string, any>): Promise<PublicInspectionDocumentSearchDetails>;
}
//# sourceMappingURL=client.d.ts.map