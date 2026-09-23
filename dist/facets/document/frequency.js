"use strict";
// Corresponds to federal_register/facet/document/frequency.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frequency = void 0;
const facet_1 = require("../../facet");
const client_1 = require("../../client");
const utilities_1 = require("../../utilities");
class Frequency extends facet_1.DocumentFacet {
    static getUrl() {
        return '/documents/facets/frequency';
    }
    static chartUrl(args = {}) {
        const uriParts = [client_1.Client.BASE_URI, this.getUrl(), ".png"];
        if (Object.keys(args).length > 0) {
            const params = new URLSearchParams();
            Object.entries(args).forEach(([key, value]) => {
                (0, utilities_1.buildParams)(params, key, value);
            });
            uriParts.push("?");
            uriParts.push(params.toString());
        }
        return uriParts.join("");
    }
}
exports.Frequency = Frequency;
//# sourceMappingURL=frequency.js.map