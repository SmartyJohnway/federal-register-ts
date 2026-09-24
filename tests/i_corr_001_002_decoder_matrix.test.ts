/**
 * R3-POSTGA-02-I I-CORR-001 & I-CORR-002 Decoder Matrix Regression Tests
 *
 * Verifies 2xx JSON decoder integrity for:
 * 1. client.effectiveDates.calculate()
 * 2. client.siteNotifications.find()
 *
 * Matrix per operation:
 * - valid structured body
 * - {}
 * - []
 * - empty body
 * - whitespace-only body
 * - malformed JSON
 * - HTML
 * - ordinary text
 * - JSON null
 * - JSON string
 * - JSON number
 * - JSON boolean
 */

import {
  FederalRegisterClient,
  FederalRegisterEmptyBodyError,
  FederalRegisterRawResponseError,
  FederalRegisterHttpError,
  FederalRegisterEffectiveDateRangeError,
} from "../src";

function createMockClient(body: string, status = 200, contentType = "application/json"): {
  client: FederalRegisterClient;
  fetchCalls: { url: string; options?: RequestInit }[];
} {
  const fetchCalls: { url: string; options?: RequestInit }[] = [];
  const mockFetch: typeof fetch = async (input, init) => {
    fetchCalls.push({ url: String(input), options: init });
    return new Response(body, {
      status,
      headers: { "Content-Type": contentType },
    });
  };
  const client = new FederalRegisterClient({ fetch: mockFetch });
  return { client, fetchCalls };
}

describe("I-CORR-001 — Effective Dates calculate() 2xx Decoder Integrity", () => {
  const validParams = { startDate: "2026-01-01", endDate: "2026-01-10" };

  test("1. valid structured body -> SUCCESS", async () => {
    const payload = JSON.stringify({
      "2026-01-01": { current: "2026-01-01", delayed: "2026-01-05" },
    });
    const { client } = createMockClient(payload);
    const result = await client.effectiveDates.calculate(validParams);
    expect(result).toEqual({
      "2026-01-01": { current: "2026-01-01", delayed: "2026-01-05" },
    });
  });

  test("2. {} empty object -> SUCCESS", async () => {
    const { client } = createMockClient("{}");
    const result = await client.effectiveDates.calculate(validParams);
    expect(result).toEqual({});
  });

  test("3. [] empty array -> SUCCESS", async () => {
    const { client } = createMockClient("[]");
    const result = await client.effectiveDates.calculate(validParams);
    expect(result).toEqual([]);
  });

  test("4. empty body -> throws FederalRegisterEmptyBodyError", async () => {
    const { client } = createMockClient("");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterEmptyBodyError
    );
  });

  test("5. whitespace-only body -> throws FederalRegisterEmptyBodyError", async () => {
    const { client } = createMockClient("   \n\t   ");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterEmptyBodyError
    );
  });

  test("6. malformed JSON -> throws FederalRegisterRawResponseError", async () => {
    const { client } = createMockClient("{ invalid json ");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterRawResponseError
    );
  });

  test("7. HTML -> throws FederalRegisterRawResponseError", async () => {
    const { client } = createMockClient("<html><body>500 Internal Error</body></html>", 200, "text/html");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterRawResponseError
    );
  });

  test("8. ordinary text -> throws FederalRegisterRawResponseError", async () => {
    const { client } = createMockClient("plain text error", 200, "text/plain");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterRawResponseError
    );
  });

  test("9. JSON null -> throws FederalRegisterHttpError (never silent null)", async () => {
    const { client } = createMockClient("null");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("10. JSON string primitive root -> throws FederalRegisterHttpError", async () => {
    const { client } = createMockClient('"primitive string"');
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("11. JSON number primitive root -> throws FederalRegisterHttpError", async () => {
    const { client } = createMockClient("12345");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("12. JSON boolean primitive root -> throws FederalRegisterHttpError", async () => {
    const { client } = createMockClient("true");
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("13. Non-2xx 400 with range error -> throws FederalRegisterEffectiveDateRangeError", async () => {
    const { client } = createMockClient(JSON.stringify({ error: "Date range exceeds maximum" }), 400);
    await expect(client.effectiveDates.calculate(validParams)).rejects.toThrow(
      FederalRegisterEffectiveDateRangeError
    );
  });
});

describe("I-CORR-002 — Site Notifications find() 2xx Decoder Integrity", () => {
  const validParams = { identifier: "notice-42" };

  test("1. valid structured object -> SUCCESS (ActiveSiteNotification)", async () => {
    const payload = JSON.stringify({
      id: "notice-42",
      message: "Scheduled Maintenance Tonight",
      active: true,
    });
    const { client } = createMockClient(payload);
    const result = await client.siteNotifications.find(validParams);
    expect(result).toEqual({
      id: "notice-42",
      message: "Scheduled Maintenance Tonight",
      active: true,
    });
  });

  test("2. {} empty object -> SUCCESS (InactiveSiteNotification)", async () => {
    const { client } = createMockClient("{}");
    const result = await client.siteNotifications.find(validParams);
    expect(result).toEqual({});
  });

  test("3. [] empty array -> throws FederalRegisterHttpError (array root invalid for site notification)", async () => {
    const { client } = createMockClient("[]");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("4. empty body -> throws FederalRegisterEmptyBodyError", async () => {
    const { client } = createMockClient("");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterEmptyBodyError
    );
  });

  test("5. whitespace-only body -> throws FederalRegisterEmptyBodyError", async () => {
    const { client } = createMockClient("   \n\t   ");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterEmptyBodyError
    );
  });

  test("6. malformed JSON -> throws FederalRegisterRawResponseError", async () => {
    const { client } = createMockClient("{ invalid json ");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterRawResponseError
    );
  });

  test("7. HTML -> throws FederalRegisterRawResponseError", async () => {
    const { client } = createMockClient("<html><body>502 Bad Gateway</body></html>", 200, "text/html");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterRawResponseError
    );
  });

  test("8. ordinary text -> throws FederalRegisterRawResponseError", async () => {
    const { client } = createMockClient("Service maintenance", 200, "text/plain");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterRawResponseError
    );
  });

  test("9. JSON null -> throws FederalRegisterHttpError (never silent null)", async () => {
    const { client } = createMockClient("null");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("10. JSON string primitive root -> throws FederalRegisterHttpError", async () => {
    const { client } = createMockClient('"maintenance notice"');
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("11. JSON number primitive root -> throws FederalRegisterHttpError", async () => {
    const { client } = createMockClient("42");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("12. JSON boolean primitive root -> throws FederalRegisterHttpError", async () => {
    const { client } = createMockClient("true");
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterHttpError
    );
  });

  test("13. Non-2xx 404 with empty body -> throws FederalRegisterEmptyBodyError (tri-state missing notice contract)", async () => {
    const { client } = createMockClient("", 404);
    await expect(client.siteNotifications.find(validParams)).rejects.toThrow(
      FederalRegisterEmptyBodyError
    );
  });
});
