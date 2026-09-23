"use strict";
// Corresponds to federal_register/base.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
class Base {
    constructor(attributes = {}, options = {}) {
        this.attributes = attributes;
        this._full = options.full || false;
    }
    full() {
        return this._full;
    }
    getAttribute(attrName, options) {
        let val = this.attributes[attrName];
        if (val === undefined || val === null)
            return val;
        switch (options?.type) {
            case "date":
                return val instanceof Date ? val : new Date(val);
            case "datetime":
                return val instanceof Date ? val : new Date(val);
            case "integer":
                return typeof val === "number" ? val : parseInt(val, 10);
            default:
                return val;
        }
    }
}
exports.Base = Base;
//# sourceMappingURL=base.js.map