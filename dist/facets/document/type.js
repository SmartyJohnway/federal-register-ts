"use strict";
// Corresponds to federal_register/facet/document/type.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
const facet_1 = require("../../facet");
class Type extends facet_1.DocumentFacet {
    static getUrl() {
        return '/documents/facets/type';
    }
}
exports.Type = Type;
//# sourceMappingURL=type.js.map