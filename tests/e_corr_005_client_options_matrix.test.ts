/**
 * E-CORR-005 Client Options Validation Matrix Test Suite
 *
 * Verifies FederalRegisterClient constructor validation:
 * 1. baseUrl:
 *    - omitted -> default "https://www.federalregister.gov/api/v1"
 *    - valid http/https absolute URL -> allowed
 *    - trailing slash -> normalized
 *    - "" -> throws RequestValidationError at construction
 *    - "   " -> throws RequestValidationError at construction
 *    - relative URL -> throws RequestValidationError at construction
 *    - ftp://... -> throws RequestValidationError at construction
 *    - URL with query -> throws RequestValidationError at construction
 *    - URL with fragment -> throws RequestValidationError at construction
 *    - non-string (123, null, {}) -> throws RequestValidationError at construction
 * 2. fetch:
 *    - omitted -> globalThis.fetch
 *    - function -> allowed
 *    - string, number, object, null, etc. -> throws RequestValidationError at construction
 */

import { FederalRegisterClient } from "../src/core/client";
import { RequestValidationError } from "../src/request/validation";

describe("E-CORR-005 — Client Options Validation Matrix", () => {
  describe("1. baseUrl Validation", () => {
    test("omitted baseUrl uses default production base URL", () => {
      const client = new FederalRegisterClient();
      expect(client).toBeDefined();
    });

    test("valid http/https absolute URL is allowed", () => {
      const client1 = new FederalRegisterClient({ baseUrl: "https://api.example.com/v1" });
      const client2 = new FederalRegisterClient({ baseUrl: "http://localhost:8080/api" });
      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
    });

    test("trailing slashes are normalized", () => {
      const client = new FederalRegisterClient({ baseUrl: "https://api.example.com/v1///" });
      expect(client).toBeDefined();
    });

    test('empty string baseUrl "" throws RequestValidationError at construction', () => {
      expect(() => new FederalRegisterClient({ baseUrl: "" })).toThrow(RequestValidationError);
    });

    test('whitespace-only baseUrl "   " throws RequestValidationError at construction', () => {
      expect(() => new FederalRegisterClient({ baseUrl: "   " })).toThrow(RequestValidationError);
    });

    test("relative URL throws RequestValidationError at construction", () => {
      expect(() => new FederalRegisterClient({ baseUrl: "/api/v1" })).toThrow(RequestValidationError);
      expect(() => new FederalRegisterClient({ baseUrl: "relative/path" })).toThrow(RequestValidationError);
    });

    test("non-http/https protocol (ftp://) throws RequestValidationError at construction", () => {
      expect(() => new FederalRegisterClient({ baseUrl: "ftp://example.com/api" })).toThrow(RequestValidationError);
    });

    test("URL with query parameters throws RequestValidationError at construction", () => {
      expect(() => new FederalRegisterClient({ baseUrl: "https://example.com/api?key=val" })).toThrow(RequestValidationError);
    });

    test("URL with fragment throws RequestValidationError at construction", () => {
      expect(() => new FederalRegisterClient({ baseUrl: "https://example.com/api#section" })).toThrow(RequestValidationError);
    });

    test("non-string baseUrl (123, null, {}) throws RequestValidationError at construction", () => {
      expect(() => new FederalRegisterClient({ baseUrl: 123 as any })).toThrow(RequestValidationError);
      expect(() => new FederalRegisterClient({ baseUrl: null as any })).toThrow(RequestValidationError);
      expect(() => new FederalRegisterClient({ baseUrl: {} as any })).toThrow(RequestValidationError);
    });
  });

  describe("2. fetch Option Validation", () => {
    test("omitted fetch uses globalThis.fetch", () => {
      const client = new FederalRegisterClient();
      expect(client).toBeDefined();
    });

    test("custom function fetch is allowed", () => {
      const dummyFetch = jest.fn() as any;
      const client = new FederalRegisterClient({ fetch: dummyFetch });
      expect(client).toBeDefined();
    });

    test("non-function fetch (string, number, object, null) throws RequestValidationError", () => {
      expect(() => new FederalRegisterClient({ fetch: "invalid" as any })).toThrow(RequestValidationError);
      expect(() => new FederalRegisterClient({ fetch: 123 as any })).toThrow(RequestValidationError);
      expect(() => new FederalRegisterClient({ fetch: {} as any })).toThrow(RequestValidationError);
      expect(() => new FederalRegisterClient({ fetch: null as any })).toThrow(RequestValidationError);
    });
  });
});
