"use strict";
// Corresponds to federal_register/agency.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agency = void 0;
const base_1 = require("./base");
const client_1 = require("./client");
class Agency extends base_1.Base {
    get agency_url() { return this.getAttribute("agency_url"); }
    get child_ids() { return this.getAttribute("child_ids"); }
    get description() { return this.getAttribute("description"); }
    get json_url() { return this.getAttribute("json_url"); }
    get logo() { return this.getAttribute("logo"); }
    get name() { return this.getAttribute("name"); }
    get raw_name() { return this.getAttribute("raw_name"); }
    get recent_articles_url() { return this.getAttribute("recent_articles_url"); }
    get short_name() { return this.getAttribute("short_name"); }
    get slug() { return this.getAttribute("slug"); }
    get url() { return this.getAttribute("url"); }
    get id() { return this.getAttribute("id", { type: "integer" }); }
    get parent_id() { return this.getAttribute("parent_id", { type: "integer" }); }
    // Corresponds to FederalRegister::Agency.all
    static async all(options = {}) {
        const query = {};
        if (options.fields) {
            query.fields = options.fields;
        }
        const response = await client_1.Client.get("/agencies.json", query);
        return response.map((hsh) => new Agency(hsh, { full: true }));
    }
    // Corresponds to FederalRegister::Agency.find
    static async find(idOrSlug, options = {}) {
        const slug = encodeURIComponent(idOrSlug.toString());
        const query = {};
        if (options.fields) {
            query.fields = options.fields;
        }
        const response = await client_1.Client.get(`/agencies/${slug}.json`, query);
        if (Array.isArray(response)) {
            return response.map((hsh) => new Agency(hsh, { full: true }));
        }
        else {
            return new Agency(response, { full: true });
        }
    }
    // Corresponds to FederalRegister::Agency.suggestions
    static async suggestions(args = {}) {
        const response = await client_1.Client.get("/agencies/suggestions", args);
        return response.map((hsh) => new Agency(hsh, { full: true }));
    }
    // Corresponds to FederalRegister::Agency#logo_url
    logoUrl(size) {
        if (this.attributes.logo) {
            return this.attributes.logo[`${size}_url`];
        }
        return undefined;
    }
}
exports.Agency = Agency;
//# sourceMappingURL=agency.js.map