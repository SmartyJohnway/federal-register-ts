// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\section.test.ts

import { Section, ISectionAttributes } from '../src/section';
import { HighlightedDocument } from '../src/highlighted_document';
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

describe('Section', () => {
  const mockSectionAttributes: ISectionAttributes = {
    name: 'Test Section',
    slug: 'test-section',
    highlighted_documents: [
      { document_number: '2023-00001', curated_title: 'Highlighted Doc 1' },
      { document_number: '2023-00002', curated_title: 'Highlighted Doc 2' },
    ],
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly and expose attributes via getters', () => {
    const section = new Section(mockSectionAttributes);
    expect(section.name).toBe(mockSectionAttributes.name);
    expect(section.slug).toBe(mockSectionAttributes.slug);
  });

  describe('search', () => {
    it('should call Client.get and return a map of Section instances', async () => {
      const mockResponse = {
        'test-section': mockSectionAttributes,
        'another-section': { name: 'Another Section', slug: 'another-section' },
      };
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { term: 'test' };
      const sections = await Section.search(args);

      expect(mockClientGet).toHaveBeenCalledWith('/sections', args);
      expect(Object.keys(sections).length).toBe(2);
      expect(sections['test-section']).toBeInstanceOf(Section);
      expect(sections['test-section'].name).toBe(mockSectionAttributes.name);
    });
  });

  describe('getHighlightedDocuments', () => {
    it('should return an array of HighlightedDocument instances', () => {
      const section = new Section(mockSectionAttributes);
      const highlightedDocs = section.getHighlightedDocuments();

      expect(highlightedDocs.length).toBe(2);
      expect(highlightedDocs[0]).toBeInstanceOf(HighlightedDocument);
      expect(highlightedDocs[0].document_number).toBe('2023-00001');
    });

    it('should return an empty array if no highlighted documents are present', () => {
      const section = new Section({ ...mockSectionAttributes, highlighted_documents: undefined });
      expect(section.getHighlightedDocuments()).toEqual([]);
    });
  });
});
