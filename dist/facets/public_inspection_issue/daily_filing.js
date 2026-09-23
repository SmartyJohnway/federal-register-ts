"use strict";
// Corresponds to federal_register/facet/public_inspection_issue/daily_filing.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyFiling = void 0;
const base_1 = require("../../base");
class DailyFiling extends base_1.Base {
    get agencies() { return this.getAttribute("agencies"); }
    get documents() { return this.getAttribute("documents"); }
    get last_updated_at() { return this.getAttribute("last_updated_at", { type: "datetime" }); }
    constructor(attributes, conditions) {
        super(attributes, { query: conditions });
        this.conditions = conditions;
    }
}
exports.DailyFiling = DailyFiling;
//# sourceMappingURL=daily_filing.js.map