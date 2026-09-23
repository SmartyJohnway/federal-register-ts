import { Base } from "./base";
import { ResultSet } from "./result_set";
import { DocumentImage } from "./document_image";
import { Agency } from "./agency";
interface IRawAgency {
    id?: number;
    name: string;
    raw_name?: string;
    slug?: string;
    url?: string;
}
export interface IFRDocAttributes {
    document_number: string;
    title: string;
    type: string;
    publication_date: string | Date;
    agencies: IRawAgency[];
    html_url: string;
    body_html_url: string | null;
    abstract?: string;
    action?: string;
    agency_names?: string[];
    cfr_references?: any[];
    citation?: string;
    comment_url?: string;
    corrections?: any[];
    correction_of?: any;
    dates?: any[];
    disposition_notes?: string;
    docket_id?: string;
    docket_ids?: string[];
    end_page?: number;
    excerpts?: string;
    executive_order_notes?: string;
    executive_order_number?: number;
    full_text_xml_url?: string;
    images?: any[];
    json_url?: string;
    mods_url?: string;
    page_views?: {
        count: number;
        last_updated: Date | null;
    };
    pdf_url?: string;
    president?: string;
    proclamation_number?: number;
    public_inspection_pdf_url?: string;
    regulation_id_number_info?: any;
    regulation_id_numbers?: string[];
    regulations_dot_gov_info?: any;
    regulations_dot_gov_url?: string;
    significant?: boolean;
    start_page?: number;
    subtype?: string;
    raw_text_url?: string;
    toc_subject?: string;
    toc_doc?: string;
    volume?: number;
    comments_close_on?: string | Date;
    effective_on?: string | Date;
    signing_date?: string | Date;
}
export declare class Document extends Base {
    get document_number(): string;
    get title(): string;
    get type(): string;
    get publication_date(): Date;
    get html_url(): string;
    get body_html_url(): string | null;
    get abstract(): string | undefined;
    get action(): string | undefined;
    get agency_names(): string[] | undefined;
    get cfr_references(): any[] | undefined;
    get citation(): string | undefined;
    get comment_url(): string | undefined;
    get corrections(): any[] | undefined;
    get correction_of(): any | undefined;
    get dates(): any[] | undefined;
    get disposition_notes(): string | undefined;
    get docket_id(): string | undefined;
    get docket_ids(): string[] | undefined;
    get end_page(): number | undefined;
    get excerpts(): string | undefined;
    get executive_order_notes(): string | undefined;
    get executive_order_number(): number | undefined;
    get full_text_xml_url(): string | undefined;
    get images(): DocumentImage[];
    get json_url(): string | undefined;
    get mods_url(): string | undefined;
    get page_views(): {
        count: number;
        last_updated: Date | null;
    } | undefined;
    get pdf_url(): string | undefined;
    get president(): string | undefined;
    get proclamation_number(): number | undefined;
    get public_inspection_pdf_url(): string | undefined;
    get regulation_id_number_info(): any | undefined;
    get regulation_id_numbers(): string[] | undefined;
    get regulations_dot_gov_info(): any | undefined;
    get regulations_dot_gov_url(): string | undefined;
    get significant(): boolean | undefined;
    get start_page(): number | undefined;
    get subtype(): string | undefined;
    get raw_text_url(): string | undefined;
    get toc_subject(): string | undefined;
    get toc_doc(): string | undefined;
    get volume(): number | undefined;
    get comments_close_on(): Date | undefined;
    get effective_on(): Date | undefined;
    get signing_date(): Date | undefined;
    static search(args: Record<string, any>): Promise<ResultSet<Document>>;
    static find(documentNumber: string, options?: {
        publication_date?: string | Date;
        fields?: string[];
    }): Promise<Document>;
    static find_all(documentNumbers: string[], options?: {
        fields?: string[];
    }): Promise<ResultSet<Document>>;
    fullTextXml(): Promise<string | null>;
    get agencies(): Agency[];
    getPageViews(): {
        count: number;
        last_updated: Date | null;
    } | undefined;
}
export {};
//# sourceMappingURL=document.d.ts.map