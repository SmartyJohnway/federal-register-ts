"use strict";
// Corresponds to federal_register/result_set.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultSet = void 0;
const client_1 = require("./client");
class ResultSet extends client_1.Client {
    constructor(attributes, resultClass) {
        super();
        this.resultClass = resultClass;
        this.count = attributes['count'];
        this.total_pages = attributes['total_pages'];
        this.results = (attributes['results'] || []).map((result) => new this.resultClass(result));
        this.description = attributes['description'];
        this.prev_url = attributes['previous_page_url'];
        this.next_url = attributes['next_page_url'];
        this.errors = attributes['errors'];
    }
    async next() {
        if (this.next_url) {
            // The Ruby gem's fetch method takes a full URL, so we need to extract the path and query params
            const url = new URL(this.next_url);
            const path = url.pathname;
            const query = {};
            url.searchParams.forEach((value, key) => {
                // Handle array parameters like fields[]
                if (key.endsWith('[]')) {
                    const baseKey = key.slice(0, -2);
                    if (!query[baseKey]) {
                        query[baseKey] = [];
                    }
                    query[baseKey].push(value);
                }
                else {
                    query[key] = value;
                }
            });
            return this.constructor.fetch(path, { query: query, resultClass: this.resultClass });
        }
        return undefined;
    }
    async previous() {
        if (this.prev_url) {
            const url = new URL(this.prev_url);
            const path = url.pathname;
            const query = {};
            url.searchParams.forEach((value, key) => {
                if (key.endsWith('[]')) {
                    const baseKey = key.slice(0, -2);
                    if (!query[baseKey]) {
                        query[baseKey] = [];
                    }
                    query[baseKey].push(value);
                }
                else {
                    query[key] = value;
                }
            });
            return this.constructor.fetch(path, { query: query, resultClass: this.resultClass });
        }
        return undefined;
    }
    static async fetch(urlPath, options) {
        const { query, resultClass } = options;
        const response = await client_1.Client.get(urlPath, query);
        return new ResultSet(response, resultClass);
    }
    // Implement Iterable interface to allow for...of loops
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
exports.ResultSet = ResultSet;
//# sourceMappingURL=result_set.js.map