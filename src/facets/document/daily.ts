
// Corresponds to federal_register/facet/document/daily.rb

import { Frequency } from "./frequency";

export class Daily extends Frequency {
  public static getUrl(): string {
    return '/documents/facets/daily';
  }
}
