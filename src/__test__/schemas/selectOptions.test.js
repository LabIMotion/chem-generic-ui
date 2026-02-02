import Ajv from 'ajv';
import selOptsSch from '@/schemas/json/select-options.json';

describe('selectOptions Schema', () => {
  let ajv;
  let validate;

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
    validate = ajv.compile(selOptsSch);
  });

  describe('Valid data validation', () => {
    test('should validate empty object', () => {
      const validData = {};

      const isValid = validate(validData);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    test('should validate single select option with basic structure', () => {
      const validData = {
        category1: {
          options: [
            { key: 'key1', label: 'Label 1' },
            { key: 'key2', label: 'Label 2' }
          ]
        }
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    test('should validate multiple select options', () => {
      const validData = {
        colors: {
          options: [
            { key: 'red', label: 'Red' },
            { key: 'blue', label: 'Blue' },
            { key: 'green', label: 'Green' }
          ]
        },
        sizes: {
          options: [
            { key: 'small', label: 'Small' },
            { key: 'medium', label: 'Medium' },
            { key: 'large', label: 'Large' }
          ]
        }
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    test('should validate select option with empty options array', () => {
      const validData = {
        emptyCategory: {
          options: []
        }
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });
  });

  describe('Invalid data validation', () => {
    describe('Missing required fields', () => {
      test('should reject option missing key field', () => {
        const invalidData = {
          category1: {
            options: [{ label: 'Label without key' }],
          },
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('key');
        expect(validate.errors[0].instancePath).toBe('/category1/options/0');
      });

      test('should reject option missing label field', () => {
        const invalidData = {
          category1: {
            options: [{ key: 'key-without-label' }],
          },
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('label');
        expect(validate.errors[0].instancePath).toBe('/category1/options/0');
      });
    });

    describe('Invalid field types', () => {
      test('should reject non-object category', () => {
        const invalidData = {
          category1: 'not an object'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('type');
        expect(validate.errors[0].instancePath).toBe('/category1');
      });

      test('should reject non-array options', () => {
        const invalidData = {
          category1: {
            options: 'not an array'
          }
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('type');
        expect(validate.errors[0].instancePath).toBe('/category1/options');
      });

      test('should reject non-string key', () => {
        const invalidData = {
          category1: {
            options: [
              { key: 123, label: 'Valid Label' }
            ]
          }
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('type');
        expect(validate.errors[0].instancePath).toBe('/category1/options/0/key');
      });

      test('should reject non-string label', () => {
        const invalidData = {
          category1: {
            options: [
              { key: 'valid-key', label: 123 }
            ]
          }
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('type');
        expect(validate.errors[0].instancePath).toBe('/category1/options/0/label');
      });
    });

    describe('Additional properties validation', () => {
      test('should reject additional properties in category', () => {
        const invalidData = {
          category1: {
            options: [
              { key: 'key1', label: 'Label 1' }
            ],
            extraProperty: 'not allowed'
          }
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('additionalProperties');
        expect(validate.errors[0].instancePath).toBe('/category1');
        expect(validate.errors[0].params.additionalProperty).toBe('extraProperty');
      });

      test('should reject additional properties in option item', () => {
        const invalidData = {
          category1: {
            options: [
              {
                key: 'key1',
                label: 'Label 1',
                extraProperty: 'not allowed'
              }
            ]
          }
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('additionalProperties');
        expect(validate.errors[0].instancePath).toBe('/category1/options/0');
        expect(validate.errors[0].params.additionalProperty).toBe('extraProperty');
      });
    });
  });

  describe('Schema structure validation', () => {
    test('should have correct schema structure', () => {
      expect(selOptsSch.type).toBe('object');
      expect(selOptsSch.patternProperties).toBeDefined();
      expect(selOptsSch.additionalProperties).toBe(false);
    });

    test('should have correct pattern properties structure', () => {
      const patternSchema = selOptsSch.patternProperties['^.*$'];
      expect(patternSchema.type).toBe('object');
      expect(patternSchema.properties.options).toBeDefined();
      expect(patternSchema.additionalProperties).toBe(false);
    });

    test('should have correct options array structure', () => {
      const optionsSchema = selOptsSch.patternProperties['^.*$'].properties.options;
      expect(optionsSchema.type).toBe('array');
      expect(optionsSchema.items).toBeDefined();

      const itemSchema = optionsSchema.items;
      expect(itemSchema.type).toBe('object');
      expect(itemSchema.properties.key.type).toBe('string');
      expect(itemSchema.properties.label.type).toBe('string');
      expect(itemSchema.required).toEqual(['key', 'label']);
      expect(itemSchema.additionalProperties).toBe(false);
    });
  });
});
