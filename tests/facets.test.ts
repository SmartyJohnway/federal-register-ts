// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\facets.test.ts

import { Client } from '../src/client';
import { Facet, DocumentFacet, PublicInspectionDocumentFacet, PublicInspectionIssueFacet } from '../src/facet';
import { Agency as DocumentAgencyFacet } from '../src/facets/document/agency';
import { Daily as DocumentDailyFacet } from '../src/facets/document/daily';
import { Agency as PublicInspectionDocumentAgencyFacet } from '../src/facets/public_inspection_document/agency';
import { Daily as PublicInspectionIssueDailyFacet } from '../src/facets/public_inspection_issue/daily';
import { FacetResultSet } from '../src/facet_result_set';

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

describe('Facet Types', () => {
  beforeEach(() => {
    mockClientGet.mockClear();
  });

  // Test a Document Facet
  describe('DocumentAgencyFacet', () => {
    it('should have the correct URL', () => {
      expect((DocumentAgencyFacet as any).getUrl()).toBe('/documents/facets/agency');
    });

    it('should search correctly', async () => {
      const mockResponse = { 'test-agency': { count: 10, name: 'Test Agency' } };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { conditions: { term: 'test' } };
      const resultSet = await DocumentAgencyFacet.search(args, DocumentAgencyFacet);

      expect(mockClientGet).toHaveBeenCalledWith('/documents/facets/agency', args);
      expect(resultSet).toBeInstanceOf(FacetResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(DocumentAgencyFacet);
      expect(resultSet.results[0].slug).toBe('test-agency');
    });
  });

  // Test a time-based Document Facet
  describe('DocumentDailyFacet', () => {
    it('should have the correct URL', () => {
      expect((DocumentDailyFacet as any).getUrl()).toBe('/documents/facets/daily');
    });

    it('should search correctly', async () => {
      const mockResponse = { '2023-01-01': { count: 5, name: '2023-01-01' } };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { conditions: { year: '2023' } };
      const resultSet = await DocumentDailyFacet.search(args, DocumentDailyFacet);

      expect(mockClientGet).toHaveBeenCalledWith('/documents/facets/daily', args);
      expect(resultSet).toBeInstanceOf(FacetResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(DocumentDailyFacet);
      expect(resultSet.results[0].slug).toBe('2023-01-01');
    });

    it('should generate a correct chartUrl with nested params', () => {
      const args = { conditions: { term: 'test', agencies: ['test-agency'] } };
      const url = DocumentDailyFacet.chartUrl(args);
      const expectedParams = 'conditions%5Bterm%5D=test&conditions%5Bagencies%5D%5B%5D=test-agency';
      expect(url).toContain('/documents/facets/daily.png');
      expect(url).toContain(expectedParams);
    });
  });

  // Test a Public Inspection Document Facet
  describe('PublicInspectionDocumentAgencyFacet', () => {
    it('should have the correct URL', () => {
      expect((PublicInspectionDocumentAgencyFacet as any).getUrl()).toBe('/public-inspection-documents/facets/agency');
    });

    it('should search correctly', async () => {
      const mockResponse = { 'test-pi-agency': { count: 7, name: 'Test PI Agency' } };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { conditions: { date: '2023-01-01' } };
      const resultSet = await PublicInspectionDocumentAgencyFacet.search(args, PublicInspectionDocumentAgencyFacet);

      expect(mockClientGet).toHaveBeenCalledWith('/public-inspection-documents/facets/agency', args);
      expect(resultSet).toBeInstanceOf(FacetResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(PublicInspectionDocumentAgencyFacet);
      expect(resultSet.results[0].slug).toBe('test-pi-agency');
    });
  });

  // Test a Public Inspection Issue Facet
  describe('PublicInspectionIssueDailyFacet', () => {
    it('should have the correct URL', () => {
      expect((PublicInspectionIssueDailyFacet as any).getUrl()).toBe('/public-inspection-issues/facets/daily');
    });

    it('should search correctly', async () => {
      const mockResponse = {
        '2023-01-01': { name: '2023-01-01', count: 15, regular_filings: {}, special_filings: {} },
      };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { conditions: { year: '2023' } };
      const facets = await PublicInspectionIssueDailyFacet.search(args, PublicInspectionIssueDailyFacet);

      expect(mockClientGet).toHaveBeenCalledWith('/public-inspection-issues/facets/daily', args);
      expect(facets.length).toBe(1);
      expect(facets[0]).toBeInstanceOf(PublicInspectionIssueDailyFacet);
      expect(facets[0].slug).toBe('2023-01-01');
    });
  });
});
