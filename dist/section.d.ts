import { Base } from "./base";
import { HighlightedDocument } from "./highlighted_document";
export interface ISectionAttributes {
    name: string;
    slug?: string;
    highlighted_documents?: any[];
}
export declare class Section extends Base {
    get name(): string;
    get slug(): string | undefined;
    static search(args?: Record<string, any>): Promise<Record<string, Section>>;
    getHighlightedDocuments(): HighlightedDocument[];
}
//# sourceMappingURL=section.d.ts.map