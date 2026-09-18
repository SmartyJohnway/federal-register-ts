
// Corresponds to federal_register/facet/document/agency.rb

import { DocumentFacet } from "../../facet";

export class Agency extends DocumentFacet {
  public static getUrl(): string {
    return '/documents/facets/agency';
  }
}
