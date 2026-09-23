"use strict";
// Corresponds to federal_register/facet/public_inspection_document/agency.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agency = void 0;
const facet_1 = require("../../facet");
class Agency extends facet_1.PublicInspectionDocumentFacet {
    static getUrl() {
        return '/public-inspection-documents/facets/agency';
    }
}
exports.Agency = Agency;
//# sourceMappingURL=agency.js.map