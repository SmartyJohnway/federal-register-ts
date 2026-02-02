// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\aggregator.test.ts

import { FederalRegister, AggregatedQuery, AggregatedResponse } from '../src/aggregator';
import { Document, DocumentAgencyFacet, DocumentDailyFacet, ResultSet, FacetResultSet } from '../src/index';

// Mock the underlying adapters
const mockDocumentSearch = jest.spyOn(Document, 'search');
const mockAgencyFacetSearch = jest.spyOn(DocumentAgencyFacet, 'search');
const mockDailyFacetSearch = jest.spyOn(DocumentDailyFacet, 'search');

describe('FederalRegister Aggregator', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockDocumentSearch.mockClear();
    mockAgencyFacetSearch.mockClear();
    mockDailyFacetSearch.mockClear();
  });

  it('should call Document.search and the correct Facet searches', async () => {
    // 1. SETUP
    // Mock the return values of the underlying adapters
    const mockDocResultSet = new ResultSet({ count: 1, results: [{ document_number: '1' }] }, Document);
    const mockAgencyFacetResultSet = new FacetResultSet({ 'test-agency': { count: 10 } }, DocumentAgencyFacet);
    const mockDailyFacetResultSet = new FacetResultSet({ '2023-01-01': { count: 5 } }, DocumentDailyFacet);

    mockDocumentSearch.mockResolvedValue(mockDocResultSet);
    mockAgencyFacetSearch.mockResolvedValue(mockAgencyFacetResultSet as any);
    mockDailyFacetSearch.mockResolvedValue(mockDailyFacetResultSet as any);

    // Define the aggregated query
    const query: AggregatedQuery = {
      term: 'climate change',
      conditions: { agencies: ['environmental-protection-agency'] },
      facets: ['agency', 'daily'],
      per_page: 20,
    };

    // 2. EXECUTE
    const response: AggregatedResponse = await FederalRegister.search(query);

    // 3. ASSERT
    // Check that Document.search was called correctly
    expect(mockDocumentSearch).toHaveBeenCalledTimes(1);
    expect(mockDocumentSearch).toHaveBeenCalledWith(query);

    // Check that the Facet searches were called correctly
    expect(mockAgencyFacetSearch).toHaveBeenCalledTimes(1);
    expect(mockAgencyFacetSearch).toHaveBeenCalledWith(query, DocumentAgencyFacet);

    expect(mockDailyFacetSearch).toHaveBeenCalledTimes(1);
    expect(mockDailyFacetSearch).toHaveBeenCalledWith(query, DocumentDailyFacet);

    // Check the final aggregated response structure
    expect(response.documents).toBe(mockDocResultSet);
    expect(response.facets.agency).toBe(mockAgencyFacetResultSet);
    expect(response.facets.daily).toBe(mockDailyFacetResultSet);
    expect(response.documents.results[0].document_number).toBe('1');
  });

  it('should not call any facet searches if facets are not requested', async () => {
    // 1. SETUP
    const mockDocResultSet = new ResultSet({ count: 1, results: [{ document_number: '1' }] }, Document);
    mockDocumentSearch.mockResolvedValue(mockDocResultSet);

    const query: AggregatedQuery = {
      term: 'climate change',
    };

    // 2. EXECUTE
    const response: AggregatedResponse = await FederalRegister.search(query);

    // 3. ASSERT
    expect(mockDocumentSearch).toHaveBeenCalledTimes(1);
    expect(mockAgencyFacetSearch).not.toHaveBeenCalled();
    expect(mockDailyFacetSearch).not.toHaveBeenCalled();

    expect(response.documents).toBe(mockDocResultSet);
    expect(Object.keys(response.facets).length).toBe(0);
  });
});
