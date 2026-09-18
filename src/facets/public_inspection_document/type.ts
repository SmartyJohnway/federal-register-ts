
// Corresponds to federal_register/facet/public_inspection_document/type.rb

import { PublicInspectionDocumentFacet } from "../../facet";

export class Type extends PublicInspectionDocumentFacet {
  public static getUrl(): string {
    return '/public-inspection-documents/facets/type';
  }
}
