import { Base } from "./base";
export interface IAgencyAttributes {
    agency_url?: string;
    child_ids?: number[];
    description?: string;
    json_url?: string;
    logo?: any;
    name: string;
    raw_name?: string;
    recent_articles_url?: string;
    short_name?: string;
    slug?: string;
    url?: string;
    id?: number;
    parent_id?: number;
}
export declare class Agency extends Base {
    get agency_url(): string | undefined;
    get child_ids(): number[] | undefined;
    get description(): string | undefined;
    get json_url(): string | undefined;
    get logo(): any | undefined;
    get name(): string;
    get raw_name(): string | undefined;
    get recent_articles_url(): string | undefined;
    get short_name(): string | undefined;
    get slug(): string | undefined;
    get url(): string | undefined;
    get id(): number | undefined;
    get parent_id(): number | undefined;
    static all(options?: {
        fields?: string[];
    }): Promise<Agency[]>;
    static find(idOrSlug: string | number, options?: {
        fields?: string[];
    }): Promise<Agency | Agency[]>;
    static suggestions(args?: Record<string, any>): Promise<Agency[]>;
    logoUrl(size: string): string | undefined;
}
//# sourceMappingURL=agency.d.ts.map