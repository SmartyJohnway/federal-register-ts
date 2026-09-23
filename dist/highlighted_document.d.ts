import { Base } from "./base";
export declare class InvalidPhotoSize extends Error {
    constructor(message: string);
}
export declare class PhotoCredit {
    name?: string;
    url?: string;
    constructor(attributes: Record<string, any>);
}
export declare class HighlightedDocument extends Base {
    get curated_abstract(): string | undefined;
    get curated_title(): string | undefined;
    get document_number(): string | undefined;
    get html_url(): string | undefined;
    get photo(): any | undefined;
    private static VALID_PHOTO_SIZES;
    photoUrl(size: string): string | undefined;
    private _photoCredit;
    get photoCredit(): PhotoCredit | undefined;
}
//# sourceMappingURL=highlighted_document.d.ts.map