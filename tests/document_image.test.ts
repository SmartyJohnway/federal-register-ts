// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\document_image.test.ts

import { DocumentImage } from '../src/document_image';

describe('DocumentImage', () => {
  const mockImageData = [
    'test-image-id',
    {
      'original': 'http://example.com/original.jpg',
      'large': 'http://example.com/large.jpg',
      'small': 'http://example.com/small.jpg',
    },
  ];

  const mockImageDataWithPng = [
    'test-image-png-id',
    {
      'original_png': 'http://example.com/original.png',
      'original': 'http://example.com/original.jpg',
      'large': 'http://example.com/large.jpg',
    },
  ];

  it('should return the correct identifier', () => {
    const image = new DocumentImage(mockImageData);
    expect(image.identifier()).toBe('test-image-id');
  });

  it('should return an array of available sizes', () => {
    const image = new DocumentImage(mockImageData);
    expect(image.sizes()).toEqual(['original', 'large', 'small']);
  });

  it('should return the correct URL for a given size', () => {
    const image = new DocumentImage(mockImageData);
    expect(image.urlFor('large')).toBe('http://example.com/large.jpg');
  });

  it('should return undefined for a non-existent size', () => {
    const image = new DocumentImage(mockImageData);
    expect(image.urlFor('non-existent-size')).toBeUndefined();
  });

  describe('defaultUrl', () => {
    it('should return the original_png URL if it exists', () => {
      const image = new DocumentImage(mockImageDataWithPng);
      expect(image.defaultUrl()).toBe('http://example.com/original.png');
    });

    it('should fall back to the original URL if original_png does not exist', () => {
      const image = new DocumentImage(mockImageData);
      expect(image.defaultUrl()).toBe('http://example.com/original.jpg');
    });
  });
});
