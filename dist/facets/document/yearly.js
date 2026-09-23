"use strict";
// Corresponds to federal_register/facet/document/yearly.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yearly = void 0;
const frequency_1 = require("./frequency");
class Yearly extends frequency_1.Frequency {
    static getUrl() {
        return '/documents/facets/yearly';
    }
}
exports.Yearly = Yearly;
//# sourceMappingURL=yearly.js.map