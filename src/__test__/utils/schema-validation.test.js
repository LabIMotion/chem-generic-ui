import { validateProperties, formatValidationErrors } from '@utils/template/schema-validation';

describe('Schema Validation', () => {
  const validPkgData = {
    eln: {
      version: '1.0.0',
      base_revision: 'abc123',
      current_revision: 'def456',
    },
    name: 'chem-generic-ui',
    version: '2.1.0',
    labimotion: '1.0.0',
  };

  const createValidProperties = (overrides = {}) => ({
    pkg: validPkgData,
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    klass: 'Element',
    layers: {},
    version: '1.0.0',
    identifier: 'test-id',
    ...overrides,
  });

  describe('validateProperties', () => {
    it('should validate a correct properties object', () => {
      const properties = createValidProperties();
      const result = validateProperties(properties);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when properties is null', () => {
      const result = validateProperties(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('valid object');
    });

    it('should fail validation when properties is not an object', () => {
      const result = validateProperties('not an object');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should fail validation when required field is missing', () => {
      const properties = createValidProperties();
      delete properties.uuid;

      const result = validateProperties(properties);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when pkg is missing', () => {
      const properties = createValidProperties();
      delete properties.pkg;

      const result = validateProperties(properties);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when klass has invalid value', () => {
      const properties = createValidProperties({ klass: 'InvalidKlass' });

      const result = validateProperties(properties);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate properties with valid klass enum values', () => {
      const validKlasses = ['Element', 'Segment', 'Dataset', 'ElementKlass', 'SegmentKlass'];

      validKlasses.forEach((klass) => {
        const properties = createValidProperties({ klass });
        const result = validateProperties(properties);

        expect(result.valid).toBe(true);
      });
    });

    it('should validate properties with select_options', () => {
      const properties = createValidProperties({
        select_options: {
          'option1': {
            options: [
              { key: 'opt1', label: 'Option 1' },
              { key: 'opt2', label: 'Option 2' },
            ],
          },
        },
      });

      const result = validateProperties(properties);

      expect(result.valid).toBe(true);
    });

    it('should validate properties with released_at', () => {
      const properties = createValidProperties({
        released_at: '2025-11-18T00:00:00Z',
      });

      const result = validateProperties(properties);

      expect(result.valid).toBe(true);
    });
  });

  describe('formatValidationErrors', () => {
    it('should return unknown error for empty errors array', () => {
      const formatted = formatValidationErrors([]);

      expect(formatted).toBe('Unknown validation error');
    });

    it('should return unknown error for null errors', () => {
      const formatted = formatValidationErrors(null);

      expect(formatted).toBe('Unknown validation error');
    });

    it('should format missing property error', () => {
      const errors = [{
        instancePath: '',
        message: 'must have required property \'uuid\'',
        params: { missingProperty: 'uuid' },
      }];

      const formatted = formatValidationErrors(errors);

      expect(formatted).toContain('Missing required property: uuid');
    });

    it('should format type error', () => {
      const errors = [{
        instancePath: '/uuid',
        message: 'must be string',
        params: {},
      }];

      const formatted = formatValidationErrors(errors);

      expect(formatted).toContain('/uuid: must be string');
    });

    it('should format multiple errors', () => {
      const errors = [
        {
          instancePath: '',
          message: 'must have required property \'uuid\'',
          params: { missingProperty: 'uuid' },
        },
        {
          instancePath: '/klass',
          message: 'must be equal to one of the allowed values',
          params: { allowedValues: ['Element', 'Segment'] },
        },
      ];

      const formatted = formatValidationErrors(errors);

      expect(formatted).toContain('Missing required property: uuid');
      expect(formatted).toContain('allowed values');
    });
  });
});
