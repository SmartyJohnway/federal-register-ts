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
import type { DocumentTypeCategoryCountCsvText, PageCountCategoryCountCsvText } from "./models";
export declare class CategoryCountsService {
    #private;
    constructor(client: FederalRegisterClient);
    /**
     * Document-type category count raw CSV report (FR-CATCOUNT-001).
     * Path: /category_counts/document_type.csv
     */
    documentTypeCsv(): Promise<DocumentTypeCategoryCountCsvText>;
    /**
     * Page-count category count raw CSV report (FR-CATCOUNT-002).
     * Path: /category_counts/page_count.csv
     */
    pageCountCsv(): Promise<PageCountCategoryCountCsvText>;
}
//# sourceMappingURL=category_counts.d.ts.map