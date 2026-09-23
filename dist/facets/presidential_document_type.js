"use strict";
// Corresponds to federal_register/facet/presidential_document_type.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresidentialDocumentType = void 0;
const facet_1 = require("../facet");
class PresidentialDocumentType extends facet_1.Facet {
    static getUrl() {
        return '/documents/facets/subtype';
    }
}
exports.PresidentialDocumentType = PresidentialDocumentType;
//# sourceMappingURL=presidential_document_type.js.map