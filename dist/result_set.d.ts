import { Client } from "./client";
import { Base } from "./base";
export declare class ResultSet<T extends Base> extends Client implements Iterable<T> {
    count: number;
    total_pages: number;
    results: T[];
    errors?: any;
    description?: string;
    private resultClass;
    private prev_url?;
    private next_url?;
    constructor(attributes: Record<string, any>, resultClass: new (attributes: Record<string, any>, options?: {
        full?: boolean;
    }) => T);
    next(): Promise<ResultSet<T> | undefined>;
    previous(): Promise<ResultSet<T> | undefined>;
    static fetch<T extends Base>(urlPath: string, options: {
        query?: Record<string, any>;
        resultClass: new (attributes: Record<string, any>, options?: {
            full?: boolean;
        }) => T;
    }): Promise<ResultSet<T>>;
    [Symbol.iterator](): Iterator<T>;
}
//# sourceMappingURL=result_set.d.ts.map