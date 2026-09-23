import { Base } from "./base";
import { Filter, Suggestion } from "./interfaces/document_search_details_interfaces";
export declare class PublicInspectionDocumentSearchDetails extends Base {
    /**
     * A list of filter objects provided by the API.
     */
    get filters(): Filter[];
    /**
     * A list of suggestion objects provided by the API.
     */
    get suggestions(): Suggestion[];
}
//# sourceMappingURL=public_inspection_document_search_details.d.ts.map