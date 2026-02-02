// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\public_inspection_document.test.ts

import { PublicInspectionDocument, IPublicInspectionDocumentAttributes } from '../src/public_inspection_document';
import { ResultSet } from '../src/result_set';
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

describe('PublicInspectionDocument', () => {
  const mockDocAttributes: IPublicInspectionDocumentAttributes = {
    document_number: '2023-PI-00001',
    title: 'Test PI Document Title',
    type: 'NOTICE',
    publication_date: '2023-01-01',
    agencies: [{ name: 'Test PI Agency' }],
    html_url: 'http://example.com/pi_doc1',
    filed_at: '2023-01-01T10:00:00Z',
    pdf_url: 'http://example.com/pi_doc1.pdf',
    num_pages: 5,
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly and expose attributes via getters', () => {
    const doc = new PublicInspectionDocument(mockDocAttributes);
    expect(doc.document_number).toBe(mockDocAttributes.document_number);
    expect(doc.title).toBe(mockDocAttributes.title);
    expect(doc.type).toBe(mockDocAttributes.type);
    expect(doc.publication_date).toBeInstanceOf(Date);
    expect(doc.filed_at).toBeInstanceOf(Date);
    expect(doc.num_pages).toBe(mockDocAttributes.num_pages);
  });

  describe('search', () => {
    it('should call Client.get with correct parameters and return a ResultSet', async () => {
      const mockResultSet = {
        count: 1,
        total_pages: 1,
        results: [mockDocAttributes],
      };
      mockClientGet.mockResolvedValueOnce(mockResultSet);

      const args = { conditions: { term: 'test' }, per_page: 10 };
      const resultSet = await PublicInspectionDocument.search(args);

      expect(mockClientGet).toHaveBeenCalledWith('/public-inspection-documents.json', args);
      expect(resultSet).toBeInstanceOf(ResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(PublicInspectionDocument);
      expect(resultSet.results[0].document_number).toBe(mockDocAttributes.document_number);
    });
  });

  describe('find', () => {
    it('should call Client.get with document number and return a PublicInspectionDocument instance', async () => {
      mockClientGet.mockResolvedValueOnce(mockDocAttributes);

      const docNumber = '2023-PI-00001';
      const doc = await PublicInspectionDocument.find(docNumber);

      expect(mockClientGet).toHaveBeenCalledWith(`/public-inspection-documents/${docNumber}.json`);
      expect(doc).toBeInstanceOf(PublicInspectionDocument);
      expect(doc.document_number).toBe(docNumber);
      expect(doc.full()).toBe(true);
    });
  });

  describe('find_all', () => {
    it('should throw error if no document numbers are provided', async () => {
      await expect(PublicInspectionDocument.find_all([])).rejects.toThrow('No documents or citation numbers were provided');
    });

    it('should fetch multiple documents with batching logic', async () => {
      const docNumbers = ['2023-PI-00001', '2023-PI-00002'];
      const mockResponse = { results: [mockDocAttributes, { ...mockDocAttributes, document_number: '2023-PI-00002' }] };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const resultSet = await PublicInspectionDocument.find_all(docNumbers);

      expect(mockClientGet).toHaveBeenCalledWith('/public-inspection-documents/2023-PI-00001,2023-PI-00002.json', {});
      expect(resultSet.results.length).toBe(2);
      expect(resultSet.results[0]).toBeInstanceOf(PublicInspectionDocument);
    });
  });

  describe('availableOn', () => {
    it('should call Client.get with date and return a ResultSet', async () => {
      const mockResultSet = {
        count: 1,
        total_pages: 1,
        results: [mockDocAttributes],
      };
      mockClientGet.mockResolvedValueOnce(mockResultSet);

      const date = new Date('2023-01-01');
      const resultSet = await PublicInspectionDocument.availableOn(date);

      expect(mockClientGet).toHaveBeenCalledWith(
        '/public-inspection-documents.json',
        { conditions: { available_on: '2023-01-01' } }
      );
      expect(resultSet).toBeInstanceOf(ResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(PublicInspectionDocument);
    });
  });

  describe('current', () => {
    it('should call Client.get and return a ResultSet of current documents', async () => {
      const mockResultSet = {
        count: 1,
        total_pages: 1,
        results: [mockDocAttributes],
      };
      mockClientGet.mockResolvedValueOnce(mockResultSet);

      const resultSet = await PublicInspectionDocument.current();

      expect(mockClientGet).toHaveBeenCalledWith('/public-inspection-documents/current.json', undefined);
      expect(resultSet).toBeInstanceOf(ResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(PublicInspectionDocument);
    });
  });
});
