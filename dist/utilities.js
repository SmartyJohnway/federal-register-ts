"use strict";
// Corresponds to federal_register/utilities.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildParams = exports.Utilities = void 0;
class Utilities {
    // Ruby's extract_options is often used to separate a hash of options
    // from a list of other arguments. In TypeScript, this is typically
    // handled by function overloads or by explicitly defining the options
    // as the last parameter.
    // For now, we'll provide a simple utility that assumes options are the last argument if it's an object.
    static extractOptions(args) {
        const lastArg = args[args.length - 1];
        if (typeof lastArg === 'object' && lastArg !== null && !Array.isArray(lastArg)) {
            const options = args.pop();
            return [options, args];
        }
        else {
            return [{}, args];
        }
    }
}
exports.Utilities = Utilities;
/**
 * Recursively builds URLSearchParams for nested objects and arrays.
 * @param formData The URLSearchParams instance to append to.
 * @param key The current key.
 * @param data The data to append.
 */
const buildParams = (formData, key, data) => {
    if (Array.isArray(data)) {
        data.forEach(item => (0, exports.buildParams)(formData, `${key}[]`, item));
    }
    else if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([nestedKey, nestedValue]) => {
            (0, exports.buildParams)(formData, `${key}[${nestedKey}]`, nestedValue);
        });
    }
    else {
        formData.append(key, data);
    }
};
exports.buildParams = buildParams;
//# sourceMappingURL=utilities.js.map