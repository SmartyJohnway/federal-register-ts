
// Corresponds to federal_register/facet/document/yearly.rb

import { Frequency } from "./frequency";

export class Yearly extends Frequency {
  public static getUrl(): string {
    return '/documents/facets/yearly';
  }
}
