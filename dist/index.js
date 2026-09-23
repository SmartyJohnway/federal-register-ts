"use strict";
// Canonical Federal Register TypeScript SDK
// R0-07 / R2-07 Canonical Public Surface
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInspectionIssueConditionError = exports.FederalRegisterRawResponseError = exports.FederalRegisterEmptyBodyError = exports.FederalRegisterEmptyJsonError = exports.FederalRegisterEffectiveDateRangeError = exports.FederalRegisterAgencyNotFoundError = exports.FederalRegisterSearchValidationError = exports.FederalRegisterStatusMessageError = exports.FederalRegisterHttpError = exports.FederalRegisterError = exports.FederalRegisterClient = exports.RequestValidationError = void 0;
// R0-07C / R2-02 Request Core (Types and validation error only; serializer machinery is internal)
__exportStar(require("./request/types"), exports);
var validation_1 = require("./request/validation");
Object.defineProperty(exports, "RequestValidationError", { enumerable: true, get: function () { return validation_1.RequestValidationError; } });
// R0-07A/B/D / R2-03 Client, Configuration, and Error Core
var client_1 = require("./core/client");
Object.defineProperty(exports, "FederalRegisterClient", { enumerable: true, get: function () { return client_1.FederalRegisterClient; } });
var errors_1 = require("./core/errors");
Object.defineProperty(exports, "FederalRegisterError", { enumerable: true, get: function () { return errors_1.FederalRegisterError; } });
Object.defineProperty(exports, "FederalRegisterHttpError", { enumerable: true, get: function () { return errors_1.FederalRegisterHttpError; } });
Object.defineProperty(exports, "FederalRegisterStatusMessageError", { enumerable: true, get: function () { return errors_1.FederalRegisterStatusMessageError; } });
Object.defineProperty(exports, "FederalRegisterSearchValidationError", { enumerable: true, get: function () { return errors_1.FederalRegisterSearchValidationError; } });
Object.defineProperty(exports, "FederalRegisterAgencyNotFoundError", { enumerable: true, get: function () { return errors_1.FederalRegisterAgencyNotFoundError; } });
Object.defineProperty(exports, "FederalRegisterEffectiveDateRangeError", { enumerable: true, get: function () { return errors_1.FederalRegisterEffectiveDateRangeError; } });
Object.defineProperty(exports, "FederalRegisterEmptyJsonError", { enumerable: true, get: function () { return errors_1.FederalRegisterEmptyJsonError; } });
Object.defineProperty(exports, "FederalRegisterEmptyBodyError", { enumerable: true, get: function () { return errors_1.FederalRegisterEmptyBodyError; } });
Object.defineProperty(exports, "FederalRegisterRawResponseError", { enumerable: true, get: function () { return errors_1.FederalRegisterRawResponseError; } });
Object.defineProperty(exports, "PublicInspectionIssueConditionError", { enumerable: true, get: function () { return errors_1.PublicInspectionIssueConditionError; } });
//# sourceMappingURL=index.js.map