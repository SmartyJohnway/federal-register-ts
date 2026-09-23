"use strict";
// Corresponds to federal_register/suggested_search.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestedSearch = void 0;
const base_1 = require("./base");
const client_1 = require("./client");
class SuggestedSearch extends base_1.Base {
    get description() { return this.getAttribute("description"); }
    get documents_in_last_year() { return this.getAttribute("documents_in_last_year", { type: "integer" }); }
    get documents_with_open_comment_periods() { return this.getAttribute("documents_with_open_comment_periods", { type: "integer" }); }
    get position() { return this.getAttribute("position", { type: "integer" }); }
    get search_conditions() { return this.getAttribute("search_conditions"); }
    get section() { return this.getAttribute("section"); }
    get slug() { return this.getAttribute("slug"); }
    get title() { return this.getAttribute("title"); }
    // Corresponds to FederalRegister::SuggestedSearch.search
    static async search(args = {}) {
        const response = await client_1.Client.get("/suggested_searches", args);
        const searches = {};
        for (const sectionName in response) {
            if (response.hasOwnProperty(sectionName)) {
                searches[sectionName] = response[sectionName].map((attrs) => new SuggestedSearch(attrs));
            }
        }
        return searches;
    }
    // Corresponds to FederalRegister::SuggestedSearch.find
    static async find(slug) {
        const response = await client_1.Client.get(`/suggested_searches/${encodeURIComponent(slug)}`);
        return new SuggestedSearch(response);
    }
}
exports.SuggestedSearch = SuggestedSearch;
//# sourceMappingURL=suggested_search.js.map