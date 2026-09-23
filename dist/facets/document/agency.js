"use strict";
// Corresponds to federal_register/facet/document/agency.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agency = void 0;
const facet_1 = require("../../facet");
class Agency extends facet_1.DocumentFacet {
    static getUrl() {
        return '/documents/facets/agency';
    }
}
exports.Agency = Agency;
//# sourceMappingURL=agency.js.map