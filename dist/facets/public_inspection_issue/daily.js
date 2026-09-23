"use strict";
// Corresponds to federal_register/facet/public_inspection_issue/daily.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Daily = void 0;
const facet_1 = require("../../facet");
const daily_filing_1 = require("./daily_filing");
class Daily extends facet_1.PublicInspectionIssueFacet {
    static getUrl() {
        return '/public-inspection-issues/facets/daily';
    }
    filingClass() {
        return daily_filing_1.DailyFiling;
    }
}
exports.Daily = Daily;
//# sourceMappingURL=daily.js.map