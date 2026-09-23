"use strict";
// Corresponds to federal_register/public_inspection_document.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInspectionDocument = void 0;
const base_1 = require("./base");
const result_set_1 = require("./result_set");
const client_1 = require("./client");
class PublicInspectionDocument extends base_1.Base {
    get agencies() { return this.getAttribute("agencies"); }
    get docket_numbers() { return this.getAttribute("docket_numbers"); }
    get document_number() { return this.getAttribute("document_number"); }
    get editorial_note() { return this.getAttribute("editorial_note"); }
    get excerpts() { return this.getAttribute("excerpts"); }
    get html_url() { return this.getAttribute("html_url"); }
    get filing_type() { return this.getAttribute("filing_type"); }
    get pdf_url() { return this.getAttribute("pdf_url"); }
    get pdf_file_size() { return this.getAttribute("pdf_file_size", { type: "integer" }); }
    get num_pages() { return this.getAttribute("num_pages", { type: "integer" }); }
    get title() { return this.getAttribute("title"); }
    get toc_doc() { return this.getAttribute("toc_doc"); }
    get toc_subject() { return this.getAttribute("toc_subject"); }
    get type() { return this.getAttribute("type"); }
    get publication_date() { return this.getAttribute("publication_date", { type: "date" }); }
    get filed_at() { return this.getAttribute("filed_at", { type: "datetime" }); }
    get pdf_update_at() { return this.getAttribute("pdf_update_at", { type: "datetime" }); }
    // Corresponds to FederalRegister::PublicInspectionDocument.search
    static async search(args) {
        return result_set_1.ResultSet.fetch("/public-inspection-documents.json", { query: args, resultClass: PublicInspectionDocument });
    }
    // Corresponds to FederalRegister::PublicInspectionDocument.search_metadata
    static async searchMetadata(args) {
        return result_set_1.ResultSet.fetch("/public-inspection-documents.json", { query: args.merge({ metadata_only: '1' }), resultClass: PublicInspectionDocument });
    }
    // Corresponds to FederalRegister::PublicInspectionDocument.find
    static async find(documentNumber) {
        const attributes = await client_1.Client.get(`/public-inspection-documents/${encodeURIComponent(documentNumber)}.json`);
        return new PublicInspectionDocument(attributes, { full: true });
    }
    // Corresponds to FederalRegister::PublicInspectionDocument.find_all
    // Re-using the batching logic from Document.find_all
    static async find_all(documentNumbers, options = {}) {
        if (documentNumbers.length === 0) {
            throw new Error("No documents or citation numbers were provided");
        }
        const uniqueDocumentNumbers = Array.from(new Set(documentNumbers));
        const fetchOptions = {};
        if (options.fields) {
            fetchOptions.fields = options.fields;
        }
        const URL_CHARACTER_LIMIT = 2000; // From Ruby gem
        const calculateRequestBatches = (docs, currentFetchOptions) => {
            const fetchOptionUrlCharacterCount = new URLSearchParams(currentFetchOptions).toString().length;
            const charactersAvailable = URL_CHARACTER_LIMIT - fetchOptionUrlCharacterCount;
            const docNumberCharacterCount = encodeURIComponent(docs.join(',')).length;
            if (charactersAvailable > docNumberCharacterCount) {
                return 1;
            }
            else {
                return Math.ceil(docNumberCharacterCount / charactersAvailable);
            }
        };
        const httpRequestBatches = calculateRequestBatches(uniqueDocumentNumbers, fetchOptions);
        const sliceSize = Math.ceil(uniqueDocumentNumbers.length / httpRequestBatches);
        let allResults = [];
        for (let i = 0; i < uniqueDocumentNumbers.length; i += sliceSize) {
            const slice = uniqueDocumentNumbers.slice(i, i + sliceSize);
            const params = slice.map(num => encodeURIComponent(num)).join(',');
            const url = `/public-inspection-documents/${params}.json`;
            const response = await client_1.Client.get(url, fetchOptions);
            allResults = allResults.concat(response.results || []);
        }
        return new result_set_1.ResultSet({ count: allResults.length, results: allResults }, PublicInspectionDocument);
    }
    // Corresponds to FederalRegister::PublicInspectionDocument.available_on
    static async availableOn(date) {
        const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
        return result_set_1.ResultSet.fetch("/public-inspection-documents.json", {
            query: { conditions: { available_on: dateString } },
            resultClass: PublicInspectionDocument
        });
    }
    // Corresponds to FederalRegister::PublicInspectionDocument.current
    static async current() {
        return result_set_1.ResultSet.fetch("/public-inspection-documents/current.json", { resultClass: PublicInspectionDocument });
    }
}
exports.PublicInspectionDocument = PublicInspectionDocument;
//# sourceMappingURL=public_inspection_document.js.map