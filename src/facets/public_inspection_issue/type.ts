
// Corresponds to federal_register/facet/public_inspection_issue/type.rb

import { PublicInspectionIssueFacet } from "../../facet";
import { TypeFiling } from "./type_filing";

export class Type extends PublicInspectionIssueFacet {
  public static getUrl(): string {
    return '/public-inspection-issues/facets/type';
  }

  protected filingClass(): new (attributes: Record<string, any>, conditions: Record<string, any>) => TypeFiling {
    return TypeFiling;
  }
}
