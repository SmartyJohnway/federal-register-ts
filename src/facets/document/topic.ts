
// Corresponds to federal_register/facet/document/topic.rb

import { DocumentFacet } from "../../facet";

export class Topic extends DocumentFacet {
  public static getUrl(): string {
    return '/documents/facets/topic';
  }
}
