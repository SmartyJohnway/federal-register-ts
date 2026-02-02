// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\result_set.test.ts

import { ResultSet } from '../src/result_set';
import { Document } from '../src/document';
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

describe('ResultSet', () => {
  const mockDocumentAttributes = {
    document_number: '2023-00001',
    title: 'Test Document',
    type: 'RULE',
    publication_date: '2023-01-01',
    agencies: [{ name: 'Test Agency' }],
    html_url: 'http://example.com/doc1',
    body_html_url: null,
  };

  const mockResultSetAttributes = {
    count: 2,
    total_pages: 1,
    results: [mockDocumentAttributes, { ...mockDocumentAttributes, document_number: '2023-00002' }],
    previous_page_url: null,
    next_page_url: 'https://www.federalregister.gov/api/v1/documents.json?page=2',
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly with attributes and resultClass', () => {
    const resultSet = new ResultSet(mockResultSetAttributes, Document);

    expect(resultSet.count).toBe(mockResultSetAttributes.count);
    expect(resultSet.total_pages).toBe(mockResultSetAttributes.total_pages);
    expect(resultSet.results.length).toBe(mockResultSetAttributes.results.length);
    expect(resultSet.results[0]).toBeInstanceOf(Document);
    expect(resultSet.results[0].document_number).toBe(mockDocumentAttributes.document_number);
  });

  describe('fetch', () => {
    it('should call Client.get and return a new ResultSet', async () => {
      mockClientGet.mockResolvedValueOnce(mockResultSetAttributes);

      const resultSet = await ResultSet.fetch('/documents.json', { query: { term: 'test' }, resultClass: Document });

      expect(mockClientGet).toHaveBeenCalledWith('/documents.json', { term: 'test' });
      expect(resultSet).toBeInstanceOf(ResultSet);
      expect(resultSet.count).toBe(mockResultSetAttributes.count);
    });
  });

  describe('next', () => {
    it('should fetch the next page if next_url is present', async () => {
      const nextPageAttributes = { ...mockResultSetAttributes, count: 1, results: [{ ...mockDocumentAttributes, document_number: '2023-00003' }], previous_page_url: mockResultSetAttributes.next_page_url, next_page_url: null };
      mockClientGet.mockResolvedValueOnce(nextPageAttributes);

      const resultSet = new ResultSet(mockResultSetAttributes, Document);
      const nextResultSet = await resultSet.next();

      expect(mockClientGet).toHaveBeenCalledWith('/api/v1/documents.json', { page: '2' });
      expect(nextResultSet).toBeInstanceOf(ResultSet);
      expect(nextResultSet?.count).toBe(1);
      expect(nextResultSet?.results[0].document_number).toBe('2023-00003');
    });

    it('should return undefined if next_url is not present', async () => {
      const lastPageAttributes = { ...mockResultSetAttributes, next_page_url: null };
      const resultSet = new ResultSet(lastPageAttributes, Document);
      const nextResultSet = await resultSet.next();
      expect(nextResultSet).toBeUndefined();
    });
  });

  describe('previous', () => {
    it('should fetch the previous page if prev_url is present', async () => {
      const prevPageAttributes = { ...mockResultSetAttributes, count: 1, results: [{ ...mockDocumentAttributes, document_number: '2023-00000' }], previous_page_url: null, next_page_url: mockResultSetAttributes.next_page_url };
      mockClientGet.mockResolvedValueOnce(prevPageAttributes);

      const resultSetWithPrev = { ...mockResultSetAttributes, previous_page_url: 'https://www.federalregister.gov/api/v1/documents.json?page=0' };
      const resultSet = new ResultSet(resultSetWithPrev, Document);
      const prevResultSet = await resultSet.previous();

      expect(mockClientGet).toHaveBeenCalledWith('/api/v1/documents.json', { page: '0' });
      expect(prevResultSet).toBeInstanceOf(ResultSet);
      expect(prevResultSet?.count).toBe(1);
      expect(prevResultSet?.results[0].document_number).toBe('2023-00000');
    });

    it('should return undefined if prev_url is not present', async () => {
      const firstPageAttributes = { ...mockResultSetAttributes, previous_page_url: null };
      const resultSet = new ResultSet(firstPageAttributes, Document);
      const prevResultSet = await resultSet.previous();
      expect(prevResultSet).toBeUndefined();
    });
  });

  describe('iteration', () => {
    it('should be iterable using for...of', () => {
      const resultSet = new ResultSet(mockResultSetAttributes, Document);
      const iteratedDocs: Document[] = [];
      for (const doc of resultSet) {
        iteratedDocs.push(doc);
      }
      expect(iteratedDocs.length).toBe(mockResultSetAttributes.results.length);
      expect(iteratedDocs[0]).toBeInstanceOf(Document);
      expect(iteratedDocs[1].document_number).toBe('2023-00002');
    });

    it('should yield correct Document instances', () => {
      const resultSet = new ResultSet(mockResultSetAttributes, Document);
      const docs = Array.from(resultSet);
      expect(docs[0].document_number).toBe(mockDocumentAttributes.document_number);
      expect(docs[1].document_number).toBe('2023-00002');
    });
  });
});
