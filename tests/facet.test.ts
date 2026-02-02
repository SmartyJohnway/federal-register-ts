// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\facet.test.ts

import { Facet, DocumentFacet, PublicInspectionIssueFacet } from '../src/facet';
import { Daily } from '../src/facets/public_inspection_issue/daily';
import { DailyFiling } from '../src/facets/public_inspection_issue/daily_filing';
import { FacetResultSet } from '../src/facet_result_set';
import { Client } from '../src/client';

// Mock Client.get method
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

describe('Facet', () => {
  const mockFacetAttributes = {
    count: 100,
    name: 'Test Facet',
    slug: 'test-facet',
  };

  // A concrete Facet implementation for testing
  class TestDocumentFacet extends DocumentFacet {
    public static getUrl(): string {
      return '/documents/facets/test';
    }
  }

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly and expose attributes via getters', () => {
    const facet = new TestDocumentFacet(mockFacetAttributes);
    expect(facet.count).toBe(mockFacetAttributes.count);
    expect(facet.name).toBe(mockFacetAttributes.name);
    expect(facet.slug).toBe(mockFacetAttributes.slug);
  });

  describe('search', () => {
    it('should call Client.get with correct URL and return a FacetResultSet', async () => {
      const mockResponse = {
        'test-facet-slug': mockFacetAttributes,
      };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { conditions: { term: 'test' } };
      const resultSet = await TestDocumentFacet.search(args, TestDocumentFacet);

      expect(mockClientGet).toHaveBeenCalledWith('/documents/facets/test', args);
      expect(resultSet).toBeInstanceOf(FacetResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(TestDocumentFacet);
      expect(resultSet.results[0].slug).toBe('test-facet-slug');
    });
  });
});

describe('FacetResultSet', () => {
  const mockFacetAttributes = {
    count: 100,
    name: 'Test Facet',
    slug: 'test-facet',
  };

  class TestFacet extends Facet {
    public static getUrl(): string {
      return '/facets/test';
    }
  }

  const mockApiResponse = {
    'facet1': { count: 50, name: 'Facet One' },
    'facet2': { count: 30, name: 'Facet Two' },
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly and map results to Facet instances', () => {
    const resultSet = new FacetResultSet(mockApiResponse, TestFacet);

    expect(resultSet.results.length).toBe(2);
    expect(resultSet.results[0]).toBeInstanceOf(TestFacet);
    expect(resultSet.results[0].slug).toBe('facet1');
    expect(resultSet.results[0].name).toBe('Facet One');
    expect(resultSet.results[1].slug).toBe('facet2');
  });

  it('should be iterable using for...of', () => {
    const resultSet = new FacetResultSet(mockApiResponse, TestFacet);
    const iteratedFacets: TestFacet[] = [];
    for (const facet of resultSet) {
      iteratedFacets.push(facet);
    }
    expect(iteratedFacets.length).toBe(2);
    expect(iteratedFacets[0]).toBeInstanceOf(TestFacet);
    expect(iteratedFacets[0].slug).toBe('facet1');
  });

  describe('fetch', () => {
    it('should call Client.get and return a new FacetResultSet', async () => {
      mockClientGet.mockResolvedValueOnce(mockApiResponse);

      const resultSet = await FacetResultSet.fetch('/facets/test', { query: { term: 'test' }, resultClass: TestFacet });

      expect(mockClientGet).toHaveBeenCalledWith('/facets/test', { term: 'test' });
      expect(resultSet).toBeInstanceOf(FacetResultSet);
      expect(resultSet.results.length).toBe(2);
    });
  });
});

describe('PublicInspectionIssueFacet', () => {
  class TestPublicInspectionIssueFacet extends PublicInspectionIssueFacet {
    public static getUrl(): string {
      return '/public-inspection-issues/facets/test';
    }

    protected filingClass(): new (attributes: Record<string, any>, conditions: Record<string, any>) => any {
      // Dummy implementation for testing purposes
      return class DummyFiling {};
    }
  }

  const mockApiResponse = {
    'test-issue-slug': { name: 'Test Issue', count: 50 },
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  describe('search', () => {
    it('should call Client.get and return an array of PublicInspectionIssueFacet instances', async () => {
      mockClientGet.mockResolvedValueOnce(mockApiResponse);

      const args = { conditions: { date: '2023-01-01' } };
      const facets = await TestPublicInspectionIssueFacet.search(args, TestPublicInspectionIssueFacet);

      expect(mockClientGet).toHaveBeenCalledWith('/public-inspection-issues/facets/test', args);
      expect(facets.length).toBe(1);
      expect(facets[0]).toBeInstanceOf(TestPublicInspectionIssueFacet);
      expect(facets[0].slug).toBe('test-issue-slug');
      expect(facets[0].name).toBe('Test Issue');
    });
  });

  describe('filings', () => {
    // Use the concrete Daily facet which provides a filingClass
    const mockFilingApiResponse = {
      '2023-01-01': {
        name: 'January 1, 2023',
        special_filings: { count: 1, documents: [{ title: 'Special Doc' }] },
        regular_filings: { count: 5, documents: [{ title: 'Regular Doc' }] },
      },
    };

    it('should return special filings with correct conditions', async () => {
      mockClientGet.mockResolvedValueOnce(mockFilingApiResponse);
      const facets = await Daily.search({ term: 'test' }, Daily);
      const facet = facets[0];

      const special = facet.specialFilings();
      expect(special).toBeInstanceOf(DailyFiling);
      expect(special.conditions).toEqual({ term: 'test', conditions: { special_filing: 1 } });
      expect(special.getAttribute('count')).toBe(1);
    });

    it('should return regular filings with correct conditions', async () => {
      mockClientGet.mockResolvedValueOnce(mockFilingApiResponse);
      const facets = await Daily.search({ term: 'test' }, Daily);
      const facet = facets[0];

      const regular = facet.regularFilings();
      expect(regular).toBeInstanceOf(DailyFiling);
      expect(regular.conditions).toEqual({ term: 'test', conditions: { special_filing: 0 } });
      expect(regular.getAttribute('count')).toBe(5);
    });

    it('should memoize the filing instances', async () => {
      mockClientGet.mockResolvedValueOnce(mockFilingApiResponse);
      const facets = await Daily.search({ term: 'test' }, Daily);
      const facet = facets[0];

      const special1 = facet.specialFilings();
      const special2 = facet.specialFilings();
      expect(special1).toBe(special2);

      const regular1 = facet.regularFilings();
      const regular2 = facet.regularFilings();
      expect(regular1).toBe(regular2);
    });
  });
});