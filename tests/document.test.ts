// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\document.test.ts

import { Document, IFRDocAttributes } from '../src/document';
import { ResultSet } from '../src/result_set';
import { Client } from '../src/client';
import { Agency } from '../src/agency';
import { DocumentImage } from '../src/document_image';

const mockFetch = jest.fn();

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

// @ts-ignore
global.fetch = mockFetch;

const mockClientGet = Client.get as jest.Mock;

describe('Document', () => {
  const mockDocAttributes: IFRDocAttributes = {
    document_number: '2023-00001',
    title: 'Test Document Title',
    type: 'RULE',
    publication_date: '2023-01-01',
    agencies: [{ name: 'Test Agency', id: 1 }],
    html_url: 'http://example.com/doc1',
    body_html_url: 'http://example.com/doc1_body',
    abstract: 'This is an abstract.',
    start_page: 100,
    end_page: 105,
    volume: 88,
    comments_close_on: '2023-02-01',
    effective_on: '2023-03-01',
    signing_date: '2022-12-31',
    full_text_xml_url: 'http://example.com/doc1.xml',
    page_views: { count: 100, last_updated: '2023-01-05T10:00:00Z' as any },
    images: [
      [
        'test-image-id',
        {
          'original': 'http://example.com/original.jpg',
          'large': 'http://example.com/large.jpg',
        },
      ],
    ],
  };

  beforeEach(() => {
    mockClientGet.mockClear();
    mockFetch.mockClear();
  });

  it('should initialize correctly and expose attributes via getters', () => {
    const doc = new Document(mockDocAttributes);
    expect(doc.document_number).toBe(mockDocAttributes.document_number);
    expect(doc.title).toBe(mockDocAttributes.title);
    expect(doc.type).toBe(mockDocAttributes.type);
    expect(doc.publication_date).toBeInstanceOf(Date);
    expect(doc.html_url).toBe(mockDocAttributes.html_url);
    expect(doc.abstract).toBe(mockDocAttributes.abstract);
    expect(doc.start_page).toBe(mockDocAttributes.start_page);
  });

  describe('Instance Getters', () => {
    it('should return an array of Agency instances for agencies', () => {
      const doc = new Document(mockDocAttributes);
      const agencies = doc.agencies;
      expect(agencies.length).toBe(1);
      expect(agencies[0]).toBeInstanceOf(Agency);
      expect(agencies[0].name).toBe('Test Agency');
    });

    it('should return an array of DocumentImage instances for images', () => {
      const doc = new Document(mockDocAttributes);
      const images = doc.images;
      expect(images.length).toBe(1);
      expect(images[0]).toBeInstanceOf(DocumentImage);
      expect(images[0].identifier()).toBe('test-image-id');
    });

    it('should return page views data', () => {
      const doc = new Document(mockDocAttributes);
      const pageViews = doc.getPageViews();
      expect(pageViews?.count).toBe(mockDocAttributes.page_views?.count);
      expect(pageViews?.last_updated).toBeInstanceOf(Date);
    });
  });

  describe('search', () => {
    it('should call Client.get with correct parameters and return a ResultSet of Documents', async () => {
      const mockResultSet = {
        count: 1,
        total_pages: 1,
        results: [mockDocAttributes],
      };
      mockClientGet.mockResolvedValueOnce(mockResultSet);

      const args = { conditions: { term: 'test' }, per_page: 10 };
      const resultSet = await Document.search(args);

      expect(mockClientGet).toHaveBeenCalledWith('/documents.json', args);
      expect(resultSet).toBeInstanceOf(ResultSet);
      expect(resultSet.results[0]).toBeInstanceOf(Document);
      expect(resultSet.results[0].document_number).toBe(mockDocAttributes.document_number);
    });
  });

  describe('find', () => {
    it('should call Client.get with document number and return a Document instance', async () => {
      mockClientGet.mockResolvedValueOnce(mockDocAttributes);

      const docNumber = '2023-00001';
      const doc = await Document.find(docNumber);

      expect(mockClientGet).toHaveBeenCalledWith(`/documents/${docNumber}.json`, {});
      expect(doc).toBeInstanceOf(Document);
      expect(doc.document_number).toBe(docNumber);
      expect(doc.full()).toBe(true);
    });

    it('should include publication_date and fields in query if provided', async () => {
      mockClientGet.mockResolvedValueOnce(mockDocAttributes);

      const docNumber = '2023-00001';
      const options = { publication_date: '2023-01-01', fields: ['title', 'abstract'] };
      await Document.find(docNumber, options);

      expect(mockClientGet).toHaveBeenCalledWith(
        `/documents/${docNumber}.json`,
        { publication_date: '2023-01-01', fields: ['title', 'abstract'] }
      );
    });
  });

  describe('find_all', () => {
    it('should throw error if no document numbers are provided', async () => {
      await expect(Document.find_all([])).rejects.toThrow('No documents or citation numbers were provided');
    });

    it('should fetch multiple documents without batching if URL limit is not exceeded', async () => {
      const docNumbers = ['2023-00001', '2023-00002'];
      const mockResponse = { results: [mockDocAttributes, { ...mockDocAttributes, document_number: '2023-00002' }] };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const resultSet = await Document.find_all(docNumbers);

      expect(mockClientGet).toHaveBeenCalledWith('/documents/2023-00001,2023-00002.json', {});
      expect(resultSet.results.length).toBe(2);
      expect(resultSet.results[0]).toBeInstanceOf(Document);
    });

    it('should fetch multiple documents with batching if URL limit is exceeded', async () => {
      const longDocNumbers: string[] = [];
      for (let i = 0; i < 300; i++) {
        longDocNumbers.push(`2023-${String(i).padStart(5, '0')}`);
      }

      // This mock will respond to any batched call to Client.get
      mockClientGet.mockImplementation(async (url: string) => {
        const requestedIds = url.split('/')[2].split('.json')[0].split(',');
        const results = requestedIds.map(id => ({ ...mockDocAttributes, document_number: id }));
        return { results };
      });

      const resultSet = await Document.find_all(longDocNumbers);

      expect(mockClientGet.mock.calls.length).toBeGreaterThan(1);
      expect(resultSet.results.length).toBe(longDocNumbers.length);
    });

    it('should handle unique document numbers', async () => {
      const docNumbers = ['2023-00001', '2023-00001', '2023-00002'];
      const mockResponse = { results: [mockDocAttributes, { ...mockDocAttributes, document_number: '2023-00002' }] };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const resultSet = await Document.find_all(docNumbers);

      expect(mockClientGet).toHaveBeenCalledWith('/documents/2023-00001,2023-00002.json', {});
      expect(resultSet.results.length).toBe(2);
    });

    it('should include fields in query if provided', async () => {
      const docNumbers = ['2023-00001'];
      const options = { fields: ['title', 'abstract'] };
      const mockResponse = { results: [mockDocAttributes] };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      await Document.find_all(docNumbers, options);

      expect(mockClientGet).toHaveBeenCalledWith('/documents/2023-00001.json', { fields: ['title', 'abstract'] });
    });
  });

  describe('fullTextXml', () => {
    it('should fetch full text XML if url is present', async () => {
      const mockXml = '<xml>content</xml>';
      // @ts-ignore
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXml),
      });

      const doc = new Document(mockDocAttributes);
      const xml = await doc.fullTextXml();

      expect(xml).toBe(mockXml);
      expect(global.fetch).toHaveBeenCalledWith(mockDocAttributes.full_text_xml_url);
    });

    it('should return null if url is not present', async () => {
      const doc = new Document({ ...mockDocAttributes, full_text_xml_url: undefined });
      const xml = await doc.fullTextXml();
      expect(xml).toBeNull();
    });

    it('should return null if fetch fails', async () => {
      // @ts-ignore
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const doc = new Document(mockDocAttributes);
      const xml = await doc.fullTextXml();
      expect(xml).toBeNull();
    });
  });
});