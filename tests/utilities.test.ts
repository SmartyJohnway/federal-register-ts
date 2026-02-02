// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\utilities.test.ts

import { Utilities } from '../src/utilities';

describe('Utilities', () => {
  describe('extractOptions', () => {
    it('should extract options if the last argument is an object', () => {
      const args = ['arg1', 'arg2', { option1: 'value1', option2: 'value2' }];
      const [options, remainingArgs] = Utilities.extractOptions(args);

      expect(options).toEqual({ option1: 'value1', option2: 'value2' });
      expect(remainingArgs).toEqual(['arg1', 'arg2']);
    });

    it('should return an empty object if no options are provided', () => {
      const args = ['arg1', 'arg2'];
      const [options, remainingArgs] = Utilities.extractOptions(args);

      expect(options).toEqual({});
      expect(remainingArgs).toEqual(['arg1', 'arg2']);
    });

    it('should handle an empty arguments array', () => {
      const args: any[] = [];
      const [options, remainingArgs] = Utilities.extractOptions(args);

      expect(options).toEqual({});
      expect(remainingArgs).toEqual([]);
    });

    it('should not extract an array as options', () => {
      const args = ['arg1', ['arrayItem']];
      const [options, remainingArgs] = Utilities.extractOptions(args);

      expect(options).toEqual({});
      expect(remainingArgs).toEqual(['arg1', ['arrayItem']]);
    });

    it('should not extract null as options', () => {
      const args = ['arg1', null];
      const [options, remainingArgs] = Utilities.extractOptions(args);

      expect(options).toEqual({});
      expect(remainingArgs).toEqual(['arg1', null]);
    });
  });
});
