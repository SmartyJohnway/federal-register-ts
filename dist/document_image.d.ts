import { Base } from "./base";
/**
 * Represents an image associated with a document.
 * The attributes for this class are an array: [identifier, {size: url, ...}]
 */
export declare class DocumentImage extends Base {
    private get rawIdentifier();
    private get rawSizes();
    /**
     * The identifier for the image.
     */
    identifier(): string;
    /**
     * An array of available image sizes (e.g., 'original', 'large', 'small').
     */
    sizes(): string[];
    /**
     * Get the URL for a specific image size.
     * @param size The desired image size.
     * @returns The URL for the image, or undefined if the size is not available.
     */
    urlFor(size: string): string | undefined;
    /**
     * Get the default URL for the image, preferring 'original_png' if available.
     * @returns The default image URL.
     */
    defaultUrl(): string | undefined;
}
//# sourceMappingURL=document_image.d.ts.map