interface AttributeOptions {
    type?: "date" | "datetime" | "integer";
}
export declare class Base {
    protected attributes: Record<string, any>;
    private _full;
    constructor(attributes?: Record<string, any>, options?: {
        full?: boolean;
        result_set?: any;
        query?: any;
    });
    full(): boolean;
    protected getAttribute(attrName: string, options?: AttributeOptions): any;
}
export {};
//# sourceMappingURL=base.d.ts.map