import { Base } from "./base";
export interface ISuggestedSearchAttributes {
    description?: string;
    documents_in_last_year?: number;
    documents_with_open_comment_periods?: number;
    position?: number;
    search_conditions?: any;
    section?: string;
    slug: string;
    title: string;
}
export declare class SuggestedSearch extends Base {
    get description(): string | undefined;
    get documents_in_last_year(): number | undefined;
    get documents_with_open_comment_periods(): number | undefined;
    get position(): number | undefined;
    get search_conditions(): any | undefined;
    get section(): string | undefined;
    get slug(): string;
    get title(): string;
    static search(args?: Record<string, any>): Promise<Record<string, SuggestedSearch[]>>;
    static find(slug: string): Promise<SuggestedSearch>;
}
//# sourceMappingURL=suggested_search.d.ts.map