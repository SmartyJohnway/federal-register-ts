import { Client } from "./client";
import { Facet } from "./facet";
export declare class FacetResultSet<T extends Facet> extends Client implements Iterable<T> {
    conditions: Record<string, any>;
    results: T[];
    private resultClass;
    constructor(attributes: Record<string, any>, resultClass: new (attributes: Record<string, any>, options?: {
        result_set?: FacetResultSet<T>;
    }) => T, options?: {
        query?: Record<string, any>;
    });
    static fetch<T extends Facet>(urlPath: string, options: {
        query?: Record<string, any>;
        resultClass: new (attributes: Record<string, any>, options?: {
            result_set?: FacetResultSet<T>;
        }) => T;
    }): Promise<FacetResultSet<T>>;
    [Symbol.iterator](): Iterator<T>;
}
//# sourceMappingURL=facet_result_set.d.ts.map