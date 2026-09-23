"use strict";
// Corresponds to federal_register/facet/document/daily.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Daily = void 0;
const frequency_1 = require("./frequency");
class Daily extends frequency_1.Frequency {
    static getUrl() {
        return '/documents/facets/daily';
    }
}
exports.Daily = Daily;
//# sourceMappingURL=daily.js.map