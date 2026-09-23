"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FederalRegister = void 0;
const document_1 = require("./document");
// Import facets directly to avoid circular dependency with index.ts
const agency_1 = require("./facets/document/agency");
const daily_1 = require("./facets/document/daily");
const monthly_1 = require("./facets/document/monthly");
const yearly_1 = require("./facets/document/yearly");
// A map to resolve facet names to their corresponding classes
const facetMap = {
    agency: agency_1.Agency,
    daily: daily_1.Daily,
    monthly: monthly_1.Monthly,
    yearly: yearly_1.Yearly,
    // Add other document facets here as needed
};
/**
 * The FederalRegister class acts as an aggregator to orchestrate calls
 * to various microservice adapters (Document, Facet, etc.).
 */
class FederalRegister {
    /**
     * Performs a comprehensive search that can include document results and facet counts.
     * @param query The aggregated query object.
     * @returns A promise that resolves to an AggregatedResponse containing documents and facets.
     */
    static async search(query) {
        const documentResults = await document_1.Document.search(query);
        const facetPromises = [];
        if (query.facets) {
            for (const facetName of query.facets) {
                const FacetClass = facetMap[facetName];
                if (FacetClass) {
                    const facetPromise = FacetClass.search(query, FacetClass).then((resultSet) => [facetName, resultSet]);
                    facetPromises.push(facetPromise);
                }
            }
        }
        const facetResultsArray = await Promise.all(facetPromises);
        const facets = Object.fromEntries(facetResultsArray);
        return {
            documents: documentResults,
            facets: facets,
        };
    }
}
exports.FederalRegister = FederalRegister;
//# sourceMappingURL=aggregator.js.map