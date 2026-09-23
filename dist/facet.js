"use strict";
// Corresponds to federal_register/facet.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInspectionIssueFacet = exports.PublicInspectionDocumentFacet = exports.DocumentFacet = exports.Facet = void 0;
const base_1 = require("./base");
const facet_result_set_1 = require("./facet_result_set");
const client_1 = require("./client");
class Facet extends base_1.Base {
    get count() { return this.getAttribute("count", { type: "integer" }); }
    get name() { return this.getAttribute("name"); }
    get slug() { return this.getAttribute("slug"); }
    // This will be overridden by subclasses to provide specific URLs
    static getUrl() {
        throw new Error("Facet subclasses must implement getUrl()");
    }
    static async search(args = {}, resultClass) {
        return facet_result_set_1.FacetResultSet.fetch(this.getUrl(), { query: args, resultClass: resultClass });
    }
}
exports.Facet = Facet;
// Corresponds to federal_register/facet/document.rb
class DocumentFacet extends Facet {
}
exports.DocumentFacet = DocumentFacet;
// Corresponds to federal_register/facet/public_inspection_document.rb
class PublicInspectionDocumentFacet extends Facet {
}
exports.PublicInspectionDocumentFacet = PublicInspectionDocumentFacet;
// Corresponds to federal_register/facet/public_inspection_issue.rb
class PublicInspectionIssueFacet extends base_1.Base {
    get slug() { return this.getAttribute("slug"); }
    get name() { return this.getAttribute("name"); }
    constructor(attributes = {}, options = {}) {
        super(attributes, options);
        this.conditions = options.query || {};
    }
    static getUrl() {
        throw new Error("PublicInspectionIssueFacet subclasses must implement getUrl()");
    }
    static async search(args = {}, resultClass) {
        const response = await client_1.Client.get(this.getUrl(), args);
        return Object.entries(response).map(([slug, attributes]) => {
            attributes.slug = slug;
            return new resultClass(attributes, { query: args });
        });
    }
    deepMergeConditions(target, source) {
        const output = { ...target };
        if (output.conditions && source.conditions) {
            output.conditions = { ...output.conditions, ...source.conditions };
        }
        else {
            output.conditions = source.conditions || output.conditions;
        }
        return output;
    }
    specialFilings() {
        if (this._specialFilings)
            return this._specialFilings;
        const filingData = this.getAttribute('special_filings');
        const newConditions = this.deepMergeConditions(this.conditions, {
            conditions: { special_filing: 1 },
        });
        const FilingClass = this.filingClass();
        this._specialFilings = new FilingClass(filingData, newConditions);
        return this._specialFilings;
    }
    regularFilings() {
        if (this._regularFilings)
            return this._regularFilings;
        const filingData = this.getAttribute('regular_filings');
        const newConditions = this.deepMergeConditions(this.conditions, {
            conditions: { special_filing: 0 },
        });
        const FilingClass = this.filingClass();
        this._regularFilings = new FilingClass(filingData, newConditions);
        return this._regularFilings;
    }
}
exports.PublicInspectionIssueFacet = PublicInspectionIssueFacet;
//# sourceMappingURL=facet.js.map