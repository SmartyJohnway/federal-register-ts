"use strict";
// Corresponds to federal_register/document_image.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentImage = void 0;
const base_1 = require("./base");
/**
 * Represents an image associated with a document.
 * The attributes for this class are an array: [identifier, {size: url, ...}]
 */
class DocumentImage extends base_1.Base {
    get rawIdentifier() {
        return this.attributes[0];
    }
    get rawSizes() {
        return this.attributes[1] || {};
    }
    /**
     * The identifier for the image.
     */
    identifier() {
        return this.rawIdentifier;
    }
    /**
     * An array of available image sizes (e.g., 'original', 'large', 'small').
     */
    sizes() {
        return Object.keys(this.rawSizes);
    }
    /**
     * Get the URL for a specific image size.
     * @param size The desired image size.
     * @returns The URL for the image, or undefined if the size is not available.
     */
    urlFor(size) {
        return this.rawSizes[size];
    }
    /**
     * Get the default URL for the image, preferring 'original_png' if available.
     * @returns The default image URL.
     */
    defaultUrl() {
        return this.sizes().includes('original_png') ? this.urlFor('original_png') : this.urlFor('original');
    }
}
exports.DocumentImage = DocumentImage;
//# sourceMappingURL=document_image.js.map