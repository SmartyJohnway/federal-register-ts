// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\suggested_search.test.ts

import { SuggestedSearch, ISuggestedSearchAttributes } from '../src/suggested_search';
import { Client } from '../src/client';

jest.mock('../src/client', () => {
  const originalModule = jest.requireActual('../src/client');

  return {
    __esModule: true, // <-- Important for ES Modules
    ...originalModule,
    Client: class extends originalModule.Client {
      static get = jest.fn();
    },
  };
});

const mockClientGet = Client.get as jest.Mock;

describe('SuggestedSearch', () => {
  const mockSuggestedSearchAttributes: ISuggestedSearchAttributes = {
    slug: 'test-search',
    title: 'Test Suggested Search',
    description: 'A description',
    documents_in_last_year: 100,
    documents_with_open_comment_periods: 5,
    position: 1,
    section: 'environment',
    search_conditions: { term: 'test' },
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly and expose attributes via getters', () => {
    const search = new SuggestedSearch(mockSuggestedSearchAttributes);
    expect(search.slug).toBe(mockSuggestedSearchAttributes.slug);
    expect(search.title).toBe(mockSuggestedSearchAttributes.title);
    expect(search.documents_in_last_year).toBe(mockSuggestedSearchAttributes.documents_in_last_year);
  });

  describe('search', () => {
    it('should call Client.get and return a map of SuggestedSearch arrays', async () => {
      const mockResponse = {
        'environment': [mockSuggestedSearchAttributes],
        'health': [{ ...mockSuggestedSearchAttributes, slug: 'health-search', title: 'Health Search' }],
      };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { term: 'test' };
      const searches = await SuggestedSearch.search(args);

      expect(mockClientGet).toHaveBeenCalledWith('/suggested_searches', args);
      expect(Object.keys(searches).length).toBe(2);
      expect(searches['environment'][0]).toBeInstanceOf(SuggestedSearch);
      expect(searches['environment'][0].slug).toBe(mockSuggestedSearchAttributes.slug);
    });
  });

  describe('find', () => {
    it('should call Client.get with slug and return a SuggestedSearch instance', async () => {
      mockClientGet.mockResolvedValueOnce(mockSuggestedSearchAttributes);

      const searchSlug = 'test-search';
      const search = await SuggestedSearch.find(searchSlug);

      expect(mockClientGet).toHaveBeenCalledWith(`/suggested_searches/${searchSlug}`);
      expect(search).toBeInstanceOf(SuggestedSearch);
      expect(search.slug).toBe(searchSlug);
    });
  });
});
