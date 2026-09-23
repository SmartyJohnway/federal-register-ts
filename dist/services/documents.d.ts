/**
 * R0-07B / R2-04 Documents Service
 *
 * Implements the 7 frozen core JSON Document operations:
 * 1. fr.documents.search(params?: DocumentSearchParams): Promise<SearchResultEnvelope<DocumentSearchItem<K>>>
 * 2. fr.documents.find(params: DocumentFindParams): Promise<DocumentShow<K>>
 * 3. fr.documents.findMany(params: DocumentFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K>>>
 * 4. fr.documents.findByCitation(params: DocumentCitationFindParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>
 * 5. fr.documents.findManyByCitation(params: DocumentCitationFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>
 * 6. fr.documents.autocomplete(params: DocumentAutocompleteParams): Promise<DocumentAutocompleteSuggestion[]>
 * 7. fr.documents.searchDetails(params?: DocumentSearchDetailsParams): Promise<DocumentSearchDetails>
 */
import type { FederalRegisterClient } from "../core/client";
import type { DocumentSearchParams, DocumentFindParams, DocumentFindManyParams, DocumentCitationFindParams, DocumentCitationFindManyParams, DocumentAutocompleteParams, DocumentSearchDetailsParams, DocumentFindCsvParams, DocumentSearchRssParams, DocumentSearchCsvParams, DocumentField, JsonpCallbackParams } from "../request/types";
import type { SearchResultEnvelope, DocumentSearchItem, DocumentShow, MultiLookupEnvelope, DocumentAutocompleteSuggestion, DocumentSearchDetails, DocumentSearchDefaultField, DocumentShowDefaultField, DocumentCsvText, DocumentRssXmlText, JsonpText } from "./models";
import { DocumentFacetsService } from "./facets";
export declare class DocumentsService {
    #private;
    /**
     * Document Facets sub-namespace (fr.documents.facets.*)
     */
    readonly facets: DocumentFacetsService;
    constructor(client: FederalRegisterClient);
    /**
     * 1. Search documents with structured conditions and full-text search.
     * Path: /documents
     */
    search<K extends DocumentField = DocumentSearchDefaultField>(params?: DocumentSearchParams): Promise<SearchResultEnvelope<DocumentSearchItem<K>>>;
    /**
     * 2. Single document lookup by document number.
     * Path: /documents/{documentNumber}
     */
    find<K extends DocumentField = DocumentShowDefaultField>(params: DocumentFindParams): Promise<DocumentShow<K>>;
    /**
     * 3. Multiple document lookup by comma-separated document numbers.
     * Path: /documents/{documentNumbers}
     * Returns MultiLookupEnvelope. Partial success with not_found errors is resolved, NOT thrown.
     */
    findMany<K extends DocumentField = DocumentShowDefaultField>(params: DocumentFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K>>>;
    /**
     * 4. Single citation lookup.
     * Path: /documents/{volume}%20FR%20{page}
     * Upstream returns MultiLookupEnvelope for citation lookups.
     */
    findByCitation<K extends DocumentField = DocumentShowDefaultField>(params: DocumentCitationFindParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>;
    /**
     * 5. Multiple citation lookup.
     * Path: /documents/{citations}
     * Wire format: comma-separated {volume}%20FR%20{page} citations
     */
    findManyByCitation<K extends DocumentField = DocumentShowDefaultField>(params: DocumentCitationFindManyParams): Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>;
    /**
     * 6. Document autocomplete suggestions.
     * Path: /documents/autocomplete-suggestions
     */
    autocomplete(params: DocumentAutocompleteParams): Promise<DocumentAutocompleteSuggestion[]>;
    /**
     * 7. Document search details.
     * Path: /documents/search-details
     */
    searchDetails(params?: DocumentSearchDetailsParams): Promise<DocumentSearchDetails>;
    /**
     * 8. Document show CSV export (FR-DOC-007).
     * Path: /documents/{ids}.csv
     */
    findCsv(params: DocumentFindCsvParams): Promise<DocumentCsvText>;
    /**
     * 9. Document search RSS feed (FR-DOC-008).
     * Path: /documents.rss
     */
    searchRss(params?: DocumentSearchRssParams): Promise<DocumentRssXmlText>;
    /**
     * 10. Document search CSV export (FR-DOC-009).
     * Path: /documents.csv
     */
    searchCsv(params?: DocumentSearchCsvParams): Promise<DocumentCsvText>;
    /**
     * Document search JSONP format companion (FR-PROTO-003 companion to FR-DOC-001).
     */
    searchJsonp(params: (DocumentSearchParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Single document lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-002).
     */
    findJsonp(params: DocumentFindParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Multiple document lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-003).
     */
    findManyJsonp(params: DocumentFindManyParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Single citation lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-004).
     */
    findByCitationJsonp(params: DocumentCitationFindParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Multiple citation lookup JSONP format companion (FR-PROTO-003 companion to FR-DOC-005).
     */
    findManyByCitationJsonp(params: DocumentCitationFindManyParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Document autocomplete JSONP format companion (FR-PROTO-003 companion to FR-DOC-010).
     */
    autocompleteJsonp(params: DocumentAutocompleteParams & JsonpCallbackParams): Promise<JsonpText>;
    /**
     * Document search details JSONP format companion (FR-PROTO-003 companion to FR-DOC-011).
     */
    searchDetailsJsonp(params: (DocumentSearchDetailsParams | undefined) & JsonpCallbackParams): Promise<JsonpText>;
}
//# sourceMappingURL=documents.d.ts.map