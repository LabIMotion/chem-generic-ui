import Ajv from 'ajv';
import { FieldTypes } from 'generic-ui-core';
import fldBaseSch from '@/schemas/json/field-base.json';

describe('fldBaseSch', () => {
  let ajv;
  let validate;

  beforeEach(() => {
    ajv = new Ajv({ strict: false });
    validate = ajv.compile(fldBaseSch);
  });

  describe('Valid data validation', () => {
    test('should validate minimal valid object', () => {
      const validData = {
        type: 'text',
        field: 'username',
      };
      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });

    test('should validate complete valid object', () => {
      const validData = {
        cols: 6,
        type: 'select',
        field: 'category',
        label: 'Category',
        default: 'option1',
        position: 1,
        required: true,
        cond_fields: [
          {
            id: 'cond1',
            field: 'conditional',
            layer: 'layer1',
            value: 'val1',
          },
        ],
        sub_fields: [{ field: 'subfield' }],
        option_layers: 'layer1',
        text_sub_fields: [{ field: 'textfield' }],
      };
      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });
  });

  describe('Required fields validation', () => {
    test('should fail validation when type is missing', () => {
      const invalidData = {
        field: 'username',
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          instancePath: '',
          schemaPath: '#/required',
          keyword: 'required',
          params: { missingProperty: 'type' },
        }),
      );
    });

    test('should fail validation when field is missing', () => {
      const invalidData = {
        type: 'text',
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          instancePath: '',
          schemaPath: '#/required',
          keyword: 'required',
          params: { missingProperty: 'field' },
        }),
      );
    });
  });

  describe('Type validation', () => {
    test('should fail validation with invalid type enum value', () => {
      const invalidData = {
        type: 'INVALID_TYPE',
        field: 'username',
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          instancePath: '/type',
          schemaPath: '#/properties/type/enum',
          keyword: 'enum',
        }),
      );
    });

    test('should fail validation with non-string type', () => {
      const invalidData = {
        type: 123,
        field: 'username',
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
    });

    test('should fail validation with non-string field', () => {
      const invalidData = {
        type: 'text',
        field: 123,
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
    });

    test('should fail validation with non-integer cols', () => {
      const invalidData = {
        type: 'text',
        field: 'username',
        cols: 'invalid',
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
    });

    test('should fail validation with non-boolean required', () => {
      const invalidData = {
        type: 'text',
        field: 'username',
        required: 'true',
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
    });

    test('should fail validation with non-array cond_fields', () => {
      const invalidData = {
        type: 'text',
        field: 'username',
        cond_fields: 'invalid',
      };
      const isValid = validate(invalidData);
      expect(isValid).toBe(false);
    });
  });

  describe('Additional properties', () => {
    test('should allow additional properties', () => {
      const validData = {
        type: 'text',
        field: 'username',
        customProperty: 'customValue',
      };
      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });
  });

  describe('Valid field types', () => {
    test('should accept all valid FieldTypes', () => {
      const validFieldTypes = Object.keys(FieldTypes)
        .filter((key) => typeof key === 'string' && key.startsWith('F_'))
        .map((key) => FieldTypes[key]);

      validFieldTypes.forEach((fieldType) => {
        const validData = {
          type: fieldType,
          field: 'testField',
        };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
      });
    });
  });
});
