
// Corresponds to federal_register/facet/document/section.rb

import { DocumentFacet } from "../../facet";

export class Section extends DocumentFacet {
  public static getUrl(): string {
    return '/documents/facets/section';
  }
}
