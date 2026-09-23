import { PublicInspectionIssueFacet } from "../../facet";
import { TypeFiling } from "./type_filing";
export declare class Type extends PublicInspectionIssueFacet {
    static getUrl(): string;
    protected filingClass(): new (attributes: Record<string, any>, conditions: Record<string, any>) => TypeFiling;
}
//# sourceMappingURL=type.d.ts.map