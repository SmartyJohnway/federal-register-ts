
// Corresponds to federal_register/facet/public_inspection_document/agency.rb

import { PublicInspectionDocumentFacet } from "../../facet";

export class Agency extends PublicInspectionDocumentFacet {
  public static getUrl(): string {
    return '/public-inspection-documents/facets/agency';
  }
}
