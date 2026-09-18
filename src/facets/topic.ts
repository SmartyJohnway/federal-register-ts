
// Corresponds to federal_register/facet/topic.rb

import { Facet } from "../facet";

export class Topic extends Facet {
  public static getUrl(): string {
    return '/documents/facets/topic';
  }
}
