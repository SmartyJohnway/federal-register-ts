// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\src\client.ts

// Corresponds to federal_register/client.rb

export class ResponseError extends Error {
  constructor(message: string, public statusCode: number, public body: any) {
    super(message);
    this.name = "ResponseError";
  }
}

export class BadRequest extends ResponseError {
  constructor(body: any) { super("Bad Request", 400, body); }
}
export class RecordNotFound extends ResponseError {
  constructor(body: any) { super("Record Not Found", 404, body); }
}
export class ServerError extends ResponseError {
  constructor(body: any) { super("Server Error", 500, body); }
}
export class ServiceUnavailable extends ResponseError {
  constructor(body: any) { super("Service Unavailable", 503, body); }
}
export class GatewayTimeout extends ResponseError {
  constructor(body: any) { super("Gateway Timeout", 504, body); }
}

import { buildParams } from "./utilities";
import { DocumentSearchDetails } from "./document_search_details";
import { PublicInspectionDocumentSearchDetails } from "./public_inspection_document_search_details";

export class Client {
  private static _BASE_URI = "https://www.federalregister.gov/api/v1";

  public static get BASE_URI(): string {
    return this._BASE_URI;
  }

  public static async get(urlPath: string, queryParams?: Record<string, any>): Promise<any> {
    let url: URL;

    // 1. Handle full URLs (e.g. from next_page_url)
    if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
      url = new URL(urlPath);
    } else {
      const base = new URL(Client.BASE_URI);
      // Normalize base path (remove trailing slash for comparison)
      const basePath = base.pathname.endsWith('/') ? base.pathname.slice(0, -1) : base.pathname;

      // 2. Smart path handling:
      // If urlPath already starts with the base path (e.g. /api/v1/...), treat it as relative to origin.
      // We check basePath.length > 1 to avoid matching root '/' trivially.
      if (basePath.length > 1 && urlPath.startsWith(basePath)) {
        url = new URL(urlPath, base.origin);
      } else {
        // Otherwise, append to BASE_URI
        const baseString = Client.BASE_URI.endsWith('/') ? Client.BASE_URI.slice(0, -1) : Client.BASE_URI;
        const pathString = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
        url = new URL(baseString + pathString);
      }
    }

    if (queryParams) {
      // Append to existing params instead of replacing
      Object.entries(queryParams).forEach(([key, value]) => {
        buildParams(url.searchParams, key, value);
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

  public static overrideBaseUri(uri: string): void {
    Client._BASE_URI = uri;
  }

  public static async getDocumentSearchDetails(args: Record<string, any>): Promise<DocumentSearchDetails> {
    const response = await Client.get('/documents/search-details', args);
    return new DocumentSearchDetails(response);
  }

  public static async getPublicInspectionDocumentSearchDetails(args: Record<string, any>): Promise<PublicInspectionDocumentSearchDetails> {
    const response = await Client.get('/public-inspection-documents/search-details', args);
    return new PublicInspectionDocumentSearchDetails(response);
  }
}
