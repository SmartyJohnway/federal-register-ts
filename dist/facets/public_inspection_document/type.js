"use strict";
// Corresponds to federal_register/facet/public_inspection_document/type.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
const facet_1 = require("../../facet");
class Type extends facet_1.PublicInspectionDocumentFacet {
    static getUrl() {
        return '/public-inspection-documents/facets/type';
    }
}
exports.Type = Type;
//# sourceMappingURL=type.js.map