"use strict";
// Corresponds to federal_register/client.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.GatewayTimeout = exports.ServiceUnavailable = exports.ServerError = exports.RecordNotFound = exports.BadRequest = exports.ResponseError = void 0;
class ResponseError extends Error {
    constructor(message, statusCode, body) {
        super(message);
        this.statusCode = statusCode;
        this.body = body;
        this.name = "ResponseError";
    }
}
exports.ResponseError = ResponseError;
class BadRequest extends ResponseError {
    constructor(body) { super("Bad Request", 400, body); }
}
exports.BadRequest = BadRequest;
class RecordNotFound extends ResponseError {
    constructor(body) { super("Record Not Found", 404, body); }
}
exports.RecordNotFound = RecordNotFound;
class ServerError extends ResponseError {
    constructor(body) { super("Server Error", 500, body); }
}
exports.ServerError = ServerError;
class ServiceUnavailable extends ResponseError {
    constructor(body) { super("Service Unavailable", 503, body); }
}
exports.ServiceUnavailable = ServiceUnavailable;
class GatewayTimeout extends ResponseError {
    constructor(body) { super("Gateway Timeout", 504, body); }
}
exports.GatewayTimeout = GatewayTimeout;
const utilities_1 = require("./utilities");
const document_search_details_1 = require("./document_search_details");
const public_inspection_document_search_details_1 = require("./public_inspection_document_search_details");
class Client {
    static get BASE_URI() {
        return this._BASE_URI;
    }
    static async get(urlPath, queryParams) {
        let url;
        // 1. Handle full URLs (e.g. from next_page_url)
        if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
            url = new URL(urlPath);
        }
        else {
            const base = new URL(Client.BASE_URI);
            // Normalize base path (remove trailing slash for comparison)
            const basePath = base.pathname.endsWith('/') ? base.pathname.slice(0, -1) : base.pathname;
            // 2. Smart path handling:
            // If urlPath already starts with the base path (e.g. /api/v1/...), treat it as relative to origin.
            // We check basePath.length > 1 to avoid matching root '/' trivially.
            if (basePath.length > 1 && urlPath.startsWith(basePath)) {
                url = new URL(urlPath, base.origin);
            }
            else {
                // Otherwise, append to BASE_URI
                const baseString = Client.BASE_URI.endsWith('/') ? Client.BASE_URI.slice(0, -1) : Client.BASE_URI;
                const pathString = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
                url = new URL(baseString + pathString);
            }
        }
        if (queryParams) {
            // Append to existing params instead of replacing
            Object.entries(queryParams).forEach(([key, value]) => {
                (0, utilities_1.buildParams)(url.searchParams, key, value);
            });
        }
        const response = await fetch(url.toString());
        const body = await response.json(); // Assuming all responses are JSON
        switch (response.status) {
            case 200:
                return body;
            case 400:
                throw new BadRequest(body);
            case 404:
                throw new RecordNotFound(body);
            case 500:
                throw new ServerError(body);
            case 503:
                throw new ServiceUnavailable(body);
            case 504:
                throw new GatewayTimeout(body);
            default:
                throw new ResponseError(`HTTP Error: ${response.status}`, response.status, body);
        }
    }
    static overrideBaseUri(uri) {
        Client._BASE_URI = uri;
    }
    static async getDocumentSearchDetails(args) {
        const response = await Client.get('/documents/search-details', args);
        return new document_search_details_1.DocumentSearchDetails(response);
    }
    static async getPublicInspectionDocumentSearchDetails(args) {
        const response = await Client.get('/public-inspection-documents/search-details', args);
        return new public_inspection_document_search_details_1.PublicInspectionDocumentSearchDetails(response);
    }
}
exports.Client = Client;
Client._BASE_URI = "https://www.federalregister.gov/api/v1";
//# sourceMappingURL=client.js.map