"use strict";
// Corresponds to federal_register/facet/public_inspection_issue/type.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
const facet_1 = require("../../facet");
const type_filing_1 = require("./type_filing");
class Type extends facet_1.PublicInspectionIssueFacet {
    static getUrl() {
        return '/public-inspection-issues/facets/type';
    }
    filingClass() {
        return type_filing_1.TypeFiling;
    }
}
exports.Type = Type;
//# sourceMappingURL=type.js.map