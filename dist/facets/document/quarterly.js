"use strict";
// Corresponds to federal_register/facet/document/quarterly.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quarterly = void 0;
const frequency_1 = require("./frequency");
class Quarterly extends frequency_1.Frequency {
    static getUrl() {
        return '/documents/facets/quarterly';
    }
}
exports.Quarterly = Quarterly;
//# sourceMappingURL=quarterly.js.map