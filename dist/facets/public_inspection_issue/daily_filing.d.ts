import { Base } from "../../base";
export declare class DailyFiling extends Base {
    get agencies(): any[] | undefined;
    get documents(): any[] | undefined;
    get last_updated_at(): Date | undefined;
    conditions: Record<string, any>;
    constructor(attributes: Record<string, any>, conditions: Record<string, any>);
}
//# sourceMappingURL=daily_filing.d.ts.map