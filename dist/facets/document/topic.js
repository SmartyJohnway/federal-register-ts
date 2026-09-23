"use strict";
// Corresponds to federal_register/facet/document/topic.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = void 0;
const facet_1 = require("../../facet");
class Topic extends facet_1.DocumentFacet {
    static getUrl() {
        return '/documents/facets/topic';
    }
}
exports.Topic = Topic;
//# sourceMappingURL=topic.js.map