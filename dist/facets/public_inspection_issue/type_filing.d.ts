import { Base } from "../../base";
declare class DocumentTypeFacet {
    count: number;
    name: string;
    search_conditions: Record<string, any>;
    constructor(type: string, attributes: Record<string, any>, searchConditions: Record<string, any>);
}
export declare class TypeFiling extends Base {
    document_types: DocumentTypeFacet[];
    search_conditions: Record<string, any>;
    conditions: Record<string, any>;
    constructor(attributes: Record<string, any>, conditions: Record<string, any>);
}
export {};
//# sourceMappingURL=type_filing.d.ts.map