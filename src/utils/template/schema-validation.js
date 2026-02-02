import Ajv from 'ajv';

// Import JSON schemas
import propBaseSchema from '@/schemas/json/property-base.json';
import pkgSchema from '@/schemas/json/pkg.json';
import layersSchema from '@/schemas/json/layers.json';
import selectOptionsSchema from '@/schemas/json/select-options.json';
import fieldBaseSchema from '@/schemas/json/field-base.json';
import systemUnitSchema from '@/schemas/json/system-unit.json';
import metadataSchema from '@/schemas/json/metadata.json';

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  useDefaults: true,
  verbose: true,
  strict: false,
});

// Register all schemas by their $id
ajv.addSchema(pkgSchema);
ajv.addSchema(layersSchema);
ajv.addSchema(selectOptionsSchema);
ajv.addSchema(fieldBaseSchema);
ajv.addSchema(systemUnitSchema);
ajv.addSchema(metadataSchema);

// Compile the main schema
const validatePropBase = ajv.compile(propBaseSchema);

/**
 * Validates properties against schema
 * Return validation result and errors
 */
export const validateProperties = (properties) => {
  if (!properties || typeof properties !== 'object') {
    return {
      valid: false,
      errors: [{ message: 'Properties must be a valid object' }],
    };
  }

  const valid = validatePropBase(properties);

  return {
    valid,
    errors: valid ? [] : (validatePropBase.errors || []),
  };
};

/**
 * Formats validation errors into a readable message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || errors.length === 0) {
    return 'Unknown validation error';
  }

  return errors
    .map((err) => {
      const path = err.instancePath || 'root';
      const message = err.message || 'validation failed';

      if (err.params) {
        if (err.params.missingProperty) {
          return `Missing required property: ${err.params.missingProperty}`;
        }
        if (err.params.additionalProperty) {
          return `${path}: unexpected property "${err.params.additionalProperty}"`;
        }
        if (err.params.allowedValues) {
          return `${path}: ${message}, allowed values: ${err.params.allowedValues.join(', ')}`;
        }
      }

      return `${path}: ${message}`;
    })
    .join('; ');
};
