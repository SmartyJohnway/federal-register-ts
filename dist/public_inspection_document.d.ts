import { Base } from "./base";
import { ResultSet } from "./result_set";
export interface IPublicInspectionDocumentAttributes {
    agencies?: any[];
    docket_numbers?: string[];
    document_number: string;
    editorial_note?: string;
    excerpts?: string;
    html_url?: string;
    filing_type?: string;
    pdf_url?: string;
    pdf_file_size?: number;
    num_pages?: number;
    title: string;
    toc_doc?: string;
    toc_subject?: string;
    type: string;
    publication_date?: string | Date;
    filed_at?: string | Date;
    pdf_update_at?: string | Date;
}
export declare class PublicInspectionDocument extends Base {
    get agencies(): any[] | undefined;
    get docket_numbers(): string[] | undefined;
    get document_number(): string;
    get editorial_note(): string | undefined;
    get excerpts(): string | undefined;
    get html_url(): string | undefined;
    get filing_type(): string | undefined;
    get pdf_url(): string | undefined;
    get pdf_file_size(): number | undefined;
    get num_pages(): number | undefined;
    get title(): string;
    get toc_doc(): string | undefined;
    get toc_subject(): string | undefined;
    get type(): string;
    get publication_date(): Date | undefined;
    get filed_at(): Date | undefined;
    get pdf_update_at(): Date | undefined;
    static search(args: Record<string, any>): Promise<ResultSet<PublicInspectionDocument>>;
    static searchMetadata(args: Record<string, any>): Promise<ResultSet<PublicInspectionDocument>>;
    static find(documentNumber: string): Promise<PublicInspectionDocument>;
    static find_all(documentNumbers: string[], options?: {
        fields?: string[];
    }): Promise<ResultSet<PublicInspectionDocument>>;
    static availableOn(date: Date | string): Promise<ResultSet<PublicInspectionDocument>>;
    static current(): Promise<ResultSet<PublicInspectionDocument>>;
}
//# sourceMappingURL=public_inspection_document.d.ts.map