// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\highlighted_document.test.ts

import { HighlightedDocument, PhotoCredit } from '../src/highlighted_document';

describe('HighlightedDocument', () => {
  const mockAttributes = {
    document_number: '2024-00001',
    photo: {
      credit: {
        name: 'Test Photographer',
        url: 'http://example.com/photographer'
      },
      urls: {}
    }
  };

  const mockAttributesNoCredit = {
    document_number: '2024-00002',
    photo: {
      urls: {}
    }
  };

  describe('photoCredit', () => {
    it('should return a PhotoCredit instance if credit exists', () => {
      const doc = new HighlightedDocument(mockAttributes);
      const credit = doc.photoCredit;
      expect(credit).toBeInstanceOf(PhotoCredit);
      expect(credit?.name).toBe('Test Photographer');
    });

    it('should return undefined if credit does not exist', () => {
      const doc = new HighlightedDocument(mockAttributesNoCredit);
      const credit = doc.photoCredit;
      expect(credit).toBeUndefined();
    });

    it('should memoize the PhotoCredit instance', () => {
      const doc = new HighlightedDocument(mockAttributes);
      const credit1 = doc.photoCredit;
      const credit2 = doc.photoCredit;

      // This assertion checks if both variables point to the exact same object in memory,
      // which proves that the object was only created once.
      expect(credit1).toBe(credit2);
    });
  });
});
