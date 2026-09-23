import { PublicInspectionIssueFacet } from "../../facet";
import { DailyFiling } from "./daily_filing";
export declare class Daily extends PublicInspectionIssueFacet {
    static getUrl(): string;
    protected filingClass(): new (attributes: Record<string, any>, conditions: Record<string, any>) => DailyFiling;
}
//# sourceMappingURL=daily.d.ts.map