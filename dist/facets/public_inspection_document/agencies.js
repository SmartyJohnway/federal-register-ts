"use strict";
// Corresponds to federal_register/facet/public_inspection_document/agencies.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agencies = void 0;
const facet_1 = require("../../facet");
class Agencies extends facet_1.PublicInspectionDocumentFacet {
    static getUrl() {
        return '/public-inspection-documents/facets/agencies';
    }
}
exports.Agencies = Agencies;
//# sourceMappingURL=agencies.js.map