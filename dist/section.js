"use strict";
// Corresponds to federal_register/section.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const base_1 = require("./base");
const client_1 = require("./client");
const highlighted_document_1 = require("./highlighted_document");
class Section extends base_1.Base {
    get name() { return this.getAttribute("name"); }
    get slug() { return this.getAttribute("slug"); }
    // Corresponds to FederalRegister::Section.search
    static async search(args = {}) {
        const response = await client_1.Client.get("/sections", args);
        const sections = {};
        for (const sectionName in response) {
            if (response.hasOwnProperty(sectionName)) {
                sections[sectionName] = new Section(response[sectionName]);
            }
        }
        return sections;
    }
    // Corresponds to FederalRegister::Section#highlighted_documents
    getHighlightedDocuments() {
        const highlightedDocsData = this.getAttribute("highlighted_documents");
        if (Array.isArray(highlightedDocsData)) {
            return highlightedDocsData.map(attrs => new highlighted_document_1.HighlightedDocument(attrs));
        }
        return [];
    }
}
exports.Section = Section;
//# sourceMappingURL=section.js.map