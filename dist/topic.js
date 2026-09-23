"use strict";
// Corresponds to federal_register/topic.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = void 0;
const base_1 = require("./base");
const client_1 = require("./client");
class Topic extends base_1.Base {
    get name() { return this.getAttribute("name"); }
    get slug() { return this.getAttribute("slug"); }
    get url() { return this.getAttribute("url"); }
    // Corresponds to FederalRegister::Topic.suggestions
    static async suggestions(args = {}) {
        const response = await client_1.Client.get("/topics/suggestions", args);
        return response.map((hsh) => new Topic(hsh, { full: true }));
    }
}
exports.Topic = Topic;
//# sourceMappingURL=topic.js.map