/**
 * R0-07B / R2-06 Issues Service
 *
 * Implements:
 * 1. fr.issues.find(params: IssueFindParams): Promise<IssueToc>
 *    Path: /issues/{YYYY-MM-DD}.json
 * 2. fr.issues.current(): Promise<IssueToc>
 *    Path: /issues/current.json
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import { decodeJsonResponse } from "../core/transport";
import { QuerySerializer } from "../request/serializer";
import type { IssueFindParams, JsonpCallbackParams } from "../request/types";
import type { IssueToc, JsonpText } from "./models";

export class IssuesService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Find issue table of contents by publication date (FR-ISSUE-001).
   * Path: /issues/{YYYY-MM-DD}.json
   */
  async find(params: IssueFindParams): Promise<IssueToc> {
    const pubDate = QuerySerializer.serializeIssueFind(params);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<IssueToc>(
      `/issues/${encodeURIComponent(pubDate)}.json`,
      undefined,
      decodeJsonResponse
    );
  }

  /**
   * Get current issue table of contents (FR-ISSUE-002).
   * Path: /issues/current.json
   */
  async current(): Promise<IssueToc> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<IssueToc>(
      "/issues/current.json",
      undefined,
      decodeJsonResponse
    );
  }

  // --- FR-PROTO-003 JSONP Sibling Methods ---

  /**
   * Find issue TOC JSONP format companion (FR-PROTO-003 companion to FR-ISSUE-001).
   */
  async findJsonp(params: IssueFindParams & JsonpCallbackParams): Promise<JsonpText> {
    const pubDate = QuerySerializer.serializeIssueFind(params);
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>(
      `/issues/${encodeURIComponent(pubDate)}.json`,
      qs,
      (decoded) => {
        if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
        throw decodeJsonResponse(decoded);
      }
    );
  }

  /**
   * Current issue TOC JSONP format companion (FR-PROTO-003 companion to FR-ISSUE-002).
   */
  async currentJsonp(params: JsonpCallbackParams): Promise<JsonpText> {
    const entries: { key: string; value: string }[] = [];
    QuerySerializer.serializeJsonpCallback(params?.callback, entries);
    const qs = QuerySerializer.toQueryString(entries);
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<JsonpText>("/issues/current.json", qs, (decoded) => {
      if (decoded.status >= 200 && decoded.status < 300) return decoded.rawText ?? "";
      throw decodeJsonResponse(decoded);
    });
  }
}

