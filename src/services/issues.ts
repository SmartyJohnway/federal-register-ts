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
import type { IssueFindParams } from "../request/types";
import type { IssueToc } from "./models";

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
}
