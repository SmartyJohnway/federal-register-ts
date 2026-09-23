"use strict";
// Corresponds to federal_register/facet_result_set.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacetResultSet = void 0;
const client_1 = require("./client");
class FacetResultSet extends client_1.Client {
    constructor(attributes, resultClass, options = {}) {
        super();
        this.resultClass = resultClass;
        this.conditions = options.query || {};
        this.results = Object.entries(attributes || {}).map(([slug, attr]) => {
            attr.slug = slug;
            return new this.resultClass(attr, { result_set: this });
        });
    }
    static async fetch(urlPath, options) {
        const { query, resultClass } = options;
        const response = await client_1.Client.get(urlPath, query);
        return new FacetResultSet(response, resultClass, { query: query });
    }
    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.results.length) {
                    return { value: this.results[index++], done: false };
                }
                else {
                    return { done: true, value: undefined };
                }
            }
        };
    }
}
exports.FacetResultSet = FacetResultSet;
//# sourceMappingURL=facet_result_set.js.map