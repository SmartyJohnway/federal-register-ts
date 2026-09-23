"use strict";
// Corresponds to federal_register/facet/document/monthly.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Monthly = void 0;
const frequency_1 = require("./frequency");
class Monthly extends frequency_1.Frequency {
    static getUrl() {
        return '/documents/facets/monthly';
    }
}
exports.Monthly = Monthly;
//# sourceMappingURL=monthly.js.map