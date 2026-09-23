import { Base } from "./base";
import { FacetResultSet } from "./facet_result_set";
export interface IFacetAttributes {
    count: number;
    name: string;
    slug: string;
}
export declare class Facet extends Base {
    get count(): number;
    get name(): string;
    get slug(): string;
    static getUrl(): string;
    static search<T extends Facet>(args: Record<string, any> | undefined, resultClass: new (attributes: Record<string, any>, options?: {
        full?: boolean;
        result_set?: any;
        query?: any;
    }) => T): Promise<FacetResultSet<T>>;
}
export declare class DocumentFacet extends Facet {
}
export declare class PublicInspectionDocumentFacet extends Facet {
}
export declare abstract class PublicInspectionIssueFacet extends Base {
    get slug(): string;
    get name(): string;
    conditions: Record<string, any>;
    private _specialFilings;
    private _regularFilings;
    constructor(attributes?: Record<string, any>, options?: {
        full?: boolean;
        result_set?: any;
        query?: Record<string, any>;
    });
    static getUrl(): string;
    protected abstract filingClass(): new (attributes: Record<string, any>, conditions: Record<string, any>) => any;
    static search<T extends PublicInspectionIssueFacet>(args: Record<string, any> | undefined, resultClass: new (attributes: Record<string, any>, options?: {
        full?: boolean;
        result_set?: any;
        query?: Record<string, any>;
    }) => T): Promise<T[]>;
    private deepMergeConditions;
    specialFilings(): any;
    regularFilings(): any;
}
//# sourceMappingURL=facet.d.ts.map