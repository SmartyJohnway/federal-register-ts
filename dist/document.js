"use strict";
// Corresponds to federal_register/document.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const base_1 = require("./base");
const result_set_1 = require("./result_set");
const client_1 = require("./client");
const document_image_1 = require("./document_image");
const agency_1 = require("./agency");
class Document extends base_1.Base {
    // Dynamically defined attributes from Ruby's add_attribute
    get document_number() { return this.getAttribute("document_number"); }
    get title() { return this.getAttribute("title"); }
    get type() { return this.getAttribute("type"); }
    get publication_date() { return this.getAttribute("publication_date", { type: "date" }); }
    get html_url() { return this.getAttribute("html_url"); }
    get body_html_url() { return this.getAttribute("body_html_url"); }
    get abstract() { return this.getAttribute("abstract"); }
    get action() { return this.getAttribute("action"); }
    get agency_names() { return this.getAttribute("agency_names"); }
    get cfr_references() { return this.getAttribute("cfr_references"); }
    get citation() { return this.getAttribute("citation"); }
    get comment_url() { return this.getAttribute("comment_url"); }
    get corrections() { return this.getAttribute("corrections"); }
    get correction_of() { return this.getAttribute("correction_of"); }
    get dates() { return this.getAttribute("dates"); }
    get disposition_notes() { return this.getAttribute("disposition_notes"); }
    get docket_id() { return this.getAttribute("docket_id"); }
    get docket_ids() { return this.getAttribute("docket_ids"); }
    get end_page() { return this.getAttribute("end_page", { type: "integer" }); }
    get excerpts() { return this.getAttribute("excerpts"); }
    get executive_order_notes() { return this.getAttribute("executive_order_notes"); }
    get executive_order_number() { return this.getAttribute("executive_order_number", { type: "integer" }); }
    get full_text_xml_url() { return this.getAttribute("full_text_xml_url"); }
    get images() {
        const rawImages = this.getAttribute("images");
        if (Array.isArray(rawImages)) {
            return rawImages.map(attrs => new document_image_1.DocumentImage(attrs));
        }
        return [];
    }
    get json_url() { return this.getAttribute("json_url"); }
    get mods_url() { return this.getAttribute("mods_url"); }
    get page_views() { return this.getAttribute("page_views"); }
    get pdf_url() { return this.getAttribute("pdf_url"); }
    get president() { return this.getAttribute("president"); }
    get proclamation_number() { return this.getAttribute("proclamation_number", { type: "integer" }); }
    get public_inspection_pdf_url() { return this.getAttribute("public_inspection_pdf_url"); }
    get regulation_id_number_info() { return this.getAttribute("regulation_id_number_info"); }
    get regulation_id_numbers() { return this.getAttribute("regulation_id_numbers"); }
    get regulations_dot_gov_info() { return this.getAttribute("regulations_dot_gov_info"); }
    get regulations_dot_gov_url() { return this.getAttribute("regulations_dot_gov_url"); }
    get significant() { return this.getAttribute("significant"); }
    get start_page() { return this.getAttribute("start_page", { type: "integer" }); }
    get subtype() { return this.getAttribute("subtype"); }
    get raw_text_url() { return this.getAttribute("raw_text_url"); }
    get toc_subject() { return this.getAttribute("toc_subject"); }
    get toc_doc() { return this.getAttribute("toc_doc"); }
    get volume() { return this.getAttribute("volume", { type: "integer" }); }
    get comments_close_on() { return this.getAttribute("comments_close_on", { type: "date" }); }
    get effective_on() { return this.getAttribute("effective_on", { type: "date" }); }
    get signing_date() { return this.getAttribute("signing_date", { type: "date" }); }
    // Corresponds to FederalRegister::Document.search
    static async search(args) {
        return result_set_1.ResultSet.fetch("/documents.json", { query: args, resultClass: Document });
    }
    // Corresponds to FederalRegister::Document.find
    static async find(documentNumber, options = {}) {
        const query = {};
        if (options.publication_date) {
            query.publication_date = options.publication_date instanceof Date ? options.publication_date.toISOString().split('T')[0] : options.publication_date;
        }
        if (options.fields) {
            query.fields = options.fields;
        }
        const attributes = await client_1.Client.get(`/documents/${encodeURIComponent(documentNumber)}.json`, query);
        return new Document(attributes, { full: true });
    }
    // Corresponds to FederalRegister::DocumentUtilities.find_all
    static async find_all(documentNumbers, options = {}) {
        if (documentNumbers.length === 0) {
            throw new Error("No documents or citation numbers were provided");
        }
        // Ensure unique document numbers
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
            const url = `/documents/${params}.json`;
            const response = await client_1.Client.get(url, fetchOptions);
            allResults = allResults.concat(response.results || []);
        }
        return new result_set_1.ResultSet({ count: allResults.length, results: allResults }, Document);
    }
    // Helper to get full text XML, etc.
    async fullTextXml() {
        if (this.full_text_xml_url) {
            try {
                const response = await fetch(this.full_text_xml_url);
                if (response.ok) {
                    return response.text();
                }
                else {
                    return null;
                }
            }
            catch (e) {
                console.error("Error fetching full text XML:", e);
                return null;
            }
        }
        return null;
    }
    get agencies() {
        const rawAgencies = this.getAttribute("agencies");
        if (Array.isArray(rawAgencies)) {
            return rawAgencies.map(attrs => new agency_1.Agency(attrs));
        }
        return [];
    }
    // Implement page_views parsing similar to Ruby gem
    getPageViews() {
        const pageViewsData = this.getAttribute("page_views");
        if (pageViewsData) {
            return {
                count: pageViewsData.count,
                last_updated: pageViewsData.last_updated ? new Date(pageViewsData.last_updated) : null,
            };
        }
        return undefined;
    }
}
exports.Document = Document;
//# sourceMappingURL=document.js.map