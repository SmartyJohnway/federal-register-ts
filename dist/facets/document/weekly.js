"use strict";
// Corresponds to federal_register/facet/document/weekly.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Weekly = void 0;
const frequency_1 = require("./frequency");
class Weekly extends frequency_1.Frequency {
    static getUrl() {
        return '/documents/facets/weekly';
    }
}
exports.Weekly = Weekly;
//# sourceMappingURL=weekly.js.map