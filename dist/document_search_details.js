"use strict";
// Corresponds to federal_register/document_search_details.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSearchDetails = void 0;
const base_1 = require("./base");
class DocumentSearchDetails extends base_1.Base {
    /**
     * A list of filter objects provided by the API.
     */
    get filters() {
        return this.getAttribute("filters");
    }
    /**
     * A list of suggestion objects provided by the API.
     */
    get suggestions() {
        return this.getAttribute("suggestions");
    }
}
exports.DocumentSearchDetails = DocumentSearchDetails;
//# sourceMappingURL=document_search_details.js.map