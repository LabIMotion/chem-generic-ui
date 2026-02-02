import Ajv from 'ajv';
import pkgSchema from '@/schemas/json/pkg.json';

describe('pkg Schema', () => {
  let ajv;
  let validate;

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
    validate = ajv.compile(pkgSchema);
  });

  describe('Valid data validation', () => {
    test('should validate minimal valid package data', () => {
      const validData = {
        eln: {
          version: '1.0.0',
          base_revision: 'abc123',
          current_revision: 'def456'
        },
        name: 'chem-generic-ui',
        version: '2.1.0',
        labimotion: '1.0.0'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    test('should validate package data with semantic versions', () => {
      const validData = {
        eln: {
          version: '1.2.3',
          base_revision: '1a2b3c4d5e6f7890',
          current_revision: '0987654321abcdef'
        },
        name: 'chem-generic-ui',
        version: '2.1.0-beta.1',
        labimotion: '1.5.2'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    test('should validate package data with pre-release versions', () => {
      const validData = {
        eln: {
          version: '2.0.0-alpha.1',
          base_revision: 'feature-branch-hash',
          current_revision: 'latest-commit-hash'
        },
        name: 'chem-generic-ui',
        version: '3.0.0-rc.1',
        labimotion: '2.0.0-beta.3'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });
  });

  describe('Invalid data validation', () => {
    describe('Missing required fields', () => {
      test('should reject data missing eln field', () => {
        const invalidData = {
          name: 'chem-generic-ui',
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors).toHaveLength(1);
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('eln');
      });

      test('should reject data missing name field', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors).toHaveLength(1);
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('name');
      });

      test('should reject data missing version field', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 'chem-generic-ui',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors).toHaveLength(1);
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('version');
      });

      test('should reject data missing labimotion field', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 'chem-generic-ui',
          version: '2.1.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors).toHaveLength(1);
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('labimotion');
      });
    });

    describe('Invalid field types', () => {
      test('should reject non-string version', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 'chem-generic-ui',
          version: 123,
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/version');
        expect(validate.errors[0].keyword).toBe('type');
      });

      test('should reject non-string labimotion', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 'chem-generic-ui',
          version: '2.1.0',
          labimotion: null
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/labimotion');
        expect(validate.errors[0].keyword).toBe('type');
      });

      test('should reject non-object eln', () => {
        const invalidData = {
          eln: 'invalid-eln',
          name: 'chem-generic-ui',
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/eln');
        expect(validate.errors[0].keyword).toBe('type');
      });
    });

    describe('Invalid name field', () => {
      test('should reject incorrect package name', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 'wrong-package-name',
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/name');
        expect(validate.errors[0].keyword).toBe('const');
        expect(validate.errors[0].message).toBe('must be equal to constant');
      });

      test('should reject non-string name', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 123,
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/name');
        expect(validate.errors[0].keyword).toBe('const');
      });
    });

    describe('Invalid eln object', () => {
      test('should reject eln missing version', () => {
        const invalidData = {
          eln: {
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 'chem-generic-ui',
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/eln');
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('version');
      });

      test('should reject eln missing base_revision', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            current_revision: 'def456'
          },
          name: 'chem-generic-ui',
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/eln');
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('base_revision');
      });

      test('should reject eln missing current_revision', () => {
        const invalidData = {
          eln: {
            version: '1.0.0',
            base_revision: 'abc123'
          },
          name: 'chem-generic-ui',
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/eln');
        expect(validate.errors[0].keyword).toBe('required');
        expect(validate.errors[0].params.missingProperty).toBe('current_revision');
      });

      test('should reject eln with non-string fields', () => {
        const invalidData = {
          eln: {
            version: 123,
            base_revision: 'abc123',
            current_revision: 'def456'
          },
          name: 'chem-generic-ui',
          version: '2.1.0',
          labimotion: '1.0.0'
        };

        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].instancePath).toBe('/eln/version');
        expect(validate.errors[0].keyword).toBe('type');
      });
    });
  });

  describe('Edge cases', () => {
    test('should accept empty strings for revision hashes', () => {
      const validData = {
        eln: {
          version: '1.0.0',
          base_revision: '',
          current_revision: ''
        },
        name: 'chem-generic-ui',
        version: '2.1.0',
        labimotion: '1.0.0'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });

    test('should accept very long revision hashes', () => {
      const longHash = 'a'.repeat(100);
      const validData = {
        eln: {
          version: '1.0.0',
          base_revision: longHash,
          current_revision: longHash
        },
        name: 'chem-generic-ui',
        version: '2.1.0',
        labimotion: '1.0.0'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });

    test('should accept complex version strings', () => {
      const validData = {
        eln: {
          version: '1.0.0-beta.1+build.123',
          base_revision: 'abc123',
          current_revision: 'def456'
        },
        name: 'chem-generic-ui',
        version: '2.1.0',
        labimotion: '1.0.0'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });

    test('should accept null values for revision hashes', () => {
      const validData = {
        eln: {
          version: '1.0.0',
          base_revision: null,
          current_revision: null
        },
        name: 'chem-generic-ui',
        version: '2.1.0',
        labimotion: '1.0.0'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });

    test('should accept null for base_revision only', () => {
      const validData = {
        eln: {
          version: '1.0.0',
          base_revision: null,
          current_revision: 'def456'
        },
        name: 'chem-generic-ui',
        version: '2.1.0',
        labimotion: '1.0.0'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });

    test('should accept null for current_revision only', () => {
      const validData = {
        eln: {
          version: '1.0.0',
          base_revision: 'abc123',
          current_revision: null
        },
        name: 'chem-generic-ui',
        version: '2.1.0',
        labimotion: '1.0.0'
      };

      const isValid = validate(validData);
      expect(isValid).toBe(true);
    });
  });

  describe('Schema structure validation', () => {
    test('should have correct schema structure', () => {
      expect(pkgSchema.type).toBe('object');
      expect(pkgSchema.properties).toBeDefined();
      expect(pkgSchema.required).toEqual(['eln', 'name', 'version', 'labimotion']);
    });

    test('should have correct eln object structure', () => {
      const elnSchema = pkgSchema.properties.eln;
      expect(elnSchema.type).toBe('object');
      expect(elnSchema.required).toEqual(['version', 'base_revision', 'current_revision']);
      expect(elnSchema.properties.version.type).toBe('string');
      expect(elnSchema.properties.base_revision.type).toEqual(['string', 'null']);
      expect(elnSchema.properties.current_revision.type).toEqual(['string', 'null']);
    });

    test('should have correct name constant constraint', () => {
      const nameSchema = pkgSchema.properties.name;
      expect(nameSchema.const).toBe('chem-generic-ui');
      expect(nameSchema.description).toBe('Package name');
    });

    test('should have correct string type fields', () => {
      expect(pkgSchema.properties.version.type).toBe('string');
      expect(pkgSchema.properties.labimotion.type).toBe('string');
    });
  });
});
