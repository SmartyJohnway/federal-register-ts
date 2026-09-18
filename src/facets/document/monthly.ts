
// Corresponds to federal_register/facet/document/monthly.rb

import { Frequency } from "./frequency";

export class Monthly extends Frequency {
  public static getUrl(): string {
    return '/documents/facets/monthly';
  }
}
