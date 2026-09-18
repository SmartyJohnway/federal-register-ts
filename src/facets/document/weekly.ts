
// Corresponds to federal_register/facet/document/weekly.rb

import { Frequency } from "./frequency";

export class Weekly extends Frequency {
  public static getUrl(): string {
    return '/documents/facets/weekly';
  }
}
