/**
 * R0-07B / R2-06 Category Counts Service
 *
 * Implements:
 * 1. fr.categoryCounts.documentTypeCsv(): Promise<DocumentTypeCategoryCountCsvText>
 *    Path: /category_counts/document_type.csv
 * 2. fr.categoryCounts.pageCountCsv(): Promise<PageCountCategoryCountCsvText>
 *    Path: /category_counts/page_count.csv
 */

import type { FederalRegisterClient } from "../core/client";
import { getInternalClientRuntime } from "../core/internal/runtime";
import {
  classifyGenericHttpError,
  type DecodedResponse,
} from "../core/transport";
import type {
  DocumentTypeCategoryCountCsvText,
  PageCountCategoryCountCsvText,
} from "./models";

export class CategoryCountsService {
  readonly #client: FederalRegisterClient;

  constructor(client: FederalRegisterClient) {
    this.#client = client;
  }

  /**
   * Document-type category count raw CSV report (FR-CATCOUNT-001).
   * Path: /category_counts/document_type.csv
   */
  async documentTypeCsv(): Promise<DocumentTypeCategoryCountCsvText> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<DocumentTypeCategoryCountCsvText>(
      "/category_counts/document_type.csv",
      undefined,
      (decoded: DecodedResponse) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifyGenericHttpError(decoded);
      }
    );
  }

  /**
   * Page-count category count raw CSV report (FR-CATCOUNT-002).
   * Path: /category_counts/page_count.csv
   */
  async pageCountCsv(): Promise<PageCountCategoryCountCsvText> {
    const runtime = getInternalClientRuntime(this.#client);
    return runtime.execute<PageCountCategoryCountCsvText>(
      "/category_counts/page_count.csv",
      undefined,
      (decoded: DecodedResponse) => {
        if (decoded.status >= 200 && decoded.status < 300) {
          return decoded.rawText ?? "";
        }
        throw classifyGenericHttpError(decoded);
      }
    );
  }
}
