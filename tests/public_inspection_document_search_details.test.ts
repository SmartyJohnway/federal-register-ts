// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\public_inspection_document_search_details.test.ts

import { Client } from '../src/client';
import { PublicInspectionDocumentSearchDetails } from '../src/public_inspection_document_search_details';
import { Filter, Suggestion } from '../src/interfaces/document_search_details_interfaces';

const mockFetch = jest.fn();

// @ts-ignore
global.fetch = mockFetch;

describe('PublicInspectionDocumentSearchDetails', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch public inspection document search details and return an instance', async () => {
    const mockResponse = {
      filters: [
        { name: 'agency_id', type: 'checkbox', options: [{ value: '1', count: 10 }] },
      ],
      suggestions: [
        { text: 'suggestion 1', url: 'http://example.com/s1' },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const searchDetails = await Client.getPublicInspectionDocumentSearchDetails({});

    expect(searchDetails).toBeInstanceOf(PublicInspectionDocumentSearchDetails);
    expect(searchDetails.filters).toEqual(mockResponse.filters);
    expect(searchDetails.suggestions).toEqual(mockResponse.suggestions);
    expect(mockFetch).toHaveBeenCalledWith('https://www.federalregister.gov/api/v1/public-inspection-documents/search-details');
  });

  it('should correctly type filters and suggestions', async () => {
    const mockResponse = {
      filters: [
        { name: 'agency_id', type: 'checkbox', options: [{ value: '1', count: 10 }] },
      ],
      suggestions: [
        { text: 'suggestion 1', url: 'http://example.com/s1' },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const searchDetails = await Client.getPublicInspectionDocumentSearchDetails({});

    expect(searchDetails.filters[0].name).toBe('agency_id');
    expect(searchDetails.filters[0].options[0].value).toBe('1');
    expect(searchDetails.suggestions[0].text).toBe('suggestion 1');

    // Type checking (runtime check for demonstration, TypeScript handles compile-time)
    const filter: Filter = searchDetails.filters[0];
    const suggestion: Suggestion = searchDetails.suggestions[0];

    expect(filter).toHaveProperty('name');
    expect(filter).toHaveProperty('type');
    expect(filter).toHaveProperty('options');
    expect(suggestion).toHaveProperty('text');
    expect(suggestion).toHaveProperty('url');
  });

  it('should handle empty filters and suggestions', async () => {
    const mockResponse = {
      filters: [],
      suggestions: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const searchDetails = await Client.getPublicInspectionDocumentSearchDetails({});

    expect(searchDetails.filters).toEqual([]);
    expect(searchDetails.suggestions).toEqual([]);
  });

  it('should pass query parameters to the API call', async () => {
    const mockResponse = {
      filters: [],
      suggestions: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const queryParams = { 'conditions[term]': 'test' };
    await Client.getPublicInspectionDocumentSearchDetails(queryParams);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.federalregister.gov/api/v1/public-inspection-documents/search-details?conditions%5Bterm%5D=test'
    );
  });
});