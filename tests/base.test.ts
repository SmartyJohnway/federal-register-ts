// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\base.test.ts

import { Base } from '../src/base';
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

describe('Base', () => {
  const ORIGINAL_BASE_URI = "https://www.federalregister.gov/api/v1";

  beforeEach(() => {
    // Ensure Client's base URI is reset before each test
    Client.overrideBaseUri(ORIGINAL_BASE_URI);
  });

  it('should initialize with attributes and full status', () => {
    const attributes = { id: 1, name: 'Test' };
    const instance = new Base(attributes, { full: true });
    expect(instance.full()).toBe(true);
    expect((instance as any).attributes).toEqual(attributes);
  });

  it('should default to not full if not specified', () => {
    const instance = new Base({ id: 1 });
    expect(instance.full()).toBe(false);
  });

  describe('getAttribute', () => {
    it('should return raw attribute value by default', () => {
      const instance = new Base({ key: 'value' });
      expect((instance as any).getAttribute('key')).toBe('value');
    });

    it('should return undefined for non-existent attribute', () => {
      const instance = new Base({});
      expect((instance as any).getAttribute('nonExistent')).toBeUndefined();
    });

    it('should coerce to Date type', () => {
      const dateString = '2023-01-15';
      const instance = new Base({ dateAttr: dateString });
      const date = (instance as any).getAttribute('dateAttr', { type: 'date' });
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString().split('T')[0]).toBe(dateString);
    });

    it('should coerce to DateTime type', () => {
      const datetimeString = '2023-01-15T10:30:00.000Z';
      const instance = new Base({ datetimeAttr: datetimeString });
      const datetime = (instance as any).getAttribute('datetimeAttr', { type: 'datetime' });
      expect(datetime).toBeInstanceOf(Date);
      expect(datetime.toISOString()).toBe(datetimeString);
    });

    it('should coerce to Integer type', () => {
      const intString = '123';
      const instance = new Base({ intAttr: intString });
      const int = (instance as any).getAttribute('intAttr', { type: 'integer' });
      expect(int).toBe(123);
      expect(typeof int).toBe('number');
    });

    it('should return null for null attribute with type coercion', () => {
      const instance = new Base({ nullDate: null });
      expect((instance as any).getAttribute('nullDate', { type: 'date' })).toBeNull();
    });

    it('should return undefined for undefined attribute with type coercion', () => {
      const instance = new Base({});
      expect((instance as any).getAttribute('undefinedDate', { type: 'date' })).toBeUndefined();
    });
  });
});
