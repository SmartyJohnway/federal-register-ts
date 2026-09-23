import { Document } from './document';
import { ResultSet } from './result_set';
import { Facet } from './facet';
import { FacetResultSet } from './facet_result_set';
export interface AggregatedQuery {
    term?: string;
    conditions?: Record<string, any>;
    facets?: string[];
    per_page?: number;
    page?: number;
    order?: string;
}
export interface AggregatedResponse {
    documents: ResultSet<Document>;
    facets: Record<string, FacetResultSet<Facet>>;
}
/**
 * The FederalRegister class acts as an aggregator to orchestrate calls
 * to various microservice adapters (Document, Facet, etc.).
 */
export declare class FederalRegister {
    /**
     * Performs a comprehensive search that can include document results and facet counts.
     * @param query The aggregated query object.
     * @returns A promise that resolves to an AggregatedResponse containing documents and facets.
     */
    static search(query: AggregatedQuery): Promise<AggregatedResponse>;
}
//# sourceMappingURL=aggregator.d.ts.map