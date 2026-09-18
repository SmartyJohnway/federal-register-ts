
// Corresponds to federal_register/facet/public_inspection_issue/daily.rb

import { PublicInspectionIssueFacet } from "../../facet";
import { DailyFiling } from "./daily_filing";

export class Daily extends PublicInspectionIssueFacet {
  public static getUrl(): string {
    return '/public-inspection-issues/facets/daily';
  }

  protected filingClass(): new (attributes: Record<string, any>, conditions: Record<string, any>) => DailyFiling {
    return DailyFiling;
  }
}
