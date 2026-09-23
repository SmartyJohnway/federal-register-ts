"use strict";
// Corresponds to federal_register/facet/document/section.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const facet_1 = require("../../facet");
class Section extends facet_1.DocumentFacet {
    static getUrl() {
        return '/documents/facets/section';
    }
}
exports.Section = Section;
//# sourceMappingURL=section.js.map