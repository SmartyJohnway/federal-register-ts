
// Corresponds to federal_register/facet/presidential_document_type.rb

import { Facet } from "../facet";

export class PresidentialDocumentType extends Facet {
  public static getUrl(): string {
    return '/documents/facets/subtype';
  }
}
