"use strict";
// Corresponds to federal_register/highlighted_document.rb
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightedDocument = exports.PhotoCredit = exports.InvalidPhotoSize = void 0;
const base_1 = require("./base");
class InvalidPhotoSize extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidPhotoSize";
    }
}
exports.InvalidPhotoSize = InvalidPhotoSize;
class PhotoCredit {
    constructor(attributes) {
        this.name = attributes['name'];
        this.url = attributes['url'];
    }
}
exports.PhotoCredit = PhotoCredit;
class HighlightedDocument extends base_1.Base {
    get curated_abstract() { return this.getAttribute("curated_abstract"); }
    get curated_title() { return this.getAttribute("curated_title"); }
    get document_number() { return this.getAttribute("document_number"); }
    get html_url() { return this.getAttribute("html_url"); }
    get photo() { return this.getAttribute("photo"); }
    photoUrl(size) {
        if (!HighlightedDocument.VALID_PHOTO_SIZES.includes(size)) {
            throw new InvalidPhotoSize(`Valid photo sizes are ${HighlightedDocument.VALID_PHOTO_SIZES.join(', ')}`);
        }
        if (this.attributes.photo) {
            return this.attributes.photo.urls[size];
        }
        return undefined;
    }
    get photoCredit() {
        if (this._photoCredit) {
            return this._photoCredit;
        }
        if (this.attributes.photo && this.attributes.photo.credit) {
            this._photoCredit = new PhotoCredit(this.attributes.photo.credit);
        }
        return this._photoCredit;
    }
}
exports.HighlightedDocument = HighlightedDocument;
HighlightedDocument.VALID_PHOTO_SIZES = [
    'full_size',
    'homepage',
    'large',
    'medium',
    'navigation',
    'small'
];
//# sourceMappingURL=highlighted_document.js.map