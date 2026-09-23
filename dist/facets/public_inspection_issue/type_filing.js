"use strict";
// Corresponds to federal_register/facet/public_inspection_issue/type_filing.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeFiling = void 0;
const base_1 = require("../../base");
class DocumentTypeFacet {
    constructor(type, attributes, searchConditions) {
        this.count = attributes['count'];
        this.name = attributes['name'];
        // Ruby's deep_merge for conditions is complex. For now, a simple merge.
        this.search_conditions = { ...searchConditions, conditions: { type: [type] } };
    }
}
class TypeFiling extends base_1.Base {
    constructor(attributes, conditions) {
        super(attributes, { query: conditions });
        this.conditions = conditions;
        this.search_conditions = conditions;
        this.document_types = Object.entries(attributes || {}).map(([type, attrs]) => new DocumentTypeFacet(type, attrs, this.search_conditions));
    }
}
exports.TypeFiling = TypeFiling;
//# sourceMappingURL=type_filing.js.map