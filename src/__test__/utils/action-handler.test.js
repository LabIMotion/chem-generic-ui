import { FieldTypes } from 'generic-ui-core';
import {
  handleTemplateUploading,
  handleFieldInputChange,
  handleKlassUploading,
} from '@utils/template/action-handler';
import { migrateIntegerFields } from '@utils/template/sorting-handler';

describe('handleTemplateUploading', () => {
  const validPkgData = {
    eln: {
      version: '1.0.0',
      base_revision: 'abc123',
      current_revision: 'def456',
    },
    name: 'chem-generic-ui',
    version: '2.1.0-rc18',
    labimotion: '1.0.0',
  };

  const createValidTemplate = (genericType, overrides = {}) => ({
    pkg: validPkgData,
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    klass: `${genericType}Klass`,
    layers: {},
    version: '1.0.0',
    identifier: 'test-id',
    ...overrides,
  });

  const createMockEvent = (data) => ({
    target: {
      result: JSON.stringify(data),
    },
  });

  describe('successful validation', () => {
    it('should successfully upload a valid Element template', () => {
      const template = createValidTemplate('Element');
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(true);
      expect(result.element.klass).toBe('ElementKlass');
      expect(result.element.uuid).toBe(template.uuid);
    });

    it('should successfully upload a valid Segment template', () => {
      const template = createValidTemplate('Segment');
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Segment');

      expect(result.notify.isSuccess).toBe(true);
      expect(result.element.klass).toBe('SegmentKlass');
      expect(result.element.uuid).toBe(template.uuid);
    });

    it('should successfully upload a valid Dataset template', () => {
      const template = createValidTemplate('Dataset');
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Dataset');

      expect(result.notify.isSuccess).toBe(true);
      expect(result.element.klass).toBe('DatasetKlass');
      expect(result.element.uuid).toBe(template.uuid);
    });
  });

  describe('klass mismatch validation', () => {
    it('should fail when klass does not match genericType', () => {
      const template = createValidTemplate('Element');
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Segment');

      expect(result.notify.isSuccess).toBe(false);
      expect(result.notify.title).toContain('Error');
      expect(result.notify.msg).toContain('ElementKlass');
      expect(result.notify.msg).toContain('SegmentKlass');
    });
  });

  describe('schema validation', () => {
    it('should fail when required field uuid is missing', () => {
      const template = createValidTemplate('Element');
      delete template.uuid;
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should fail when required field pkg is missing', () => {
      const template = createValidTemplate('Element');
      delete template.pkg;
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should fail when required field layers is missing', () => {
      const template = createValidTemplate('Element');
      delete template.layers;
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should fail when klass has invalid value', () => {
      const template = createValidTemplate('Element', {
        klass: 'InvalidKlass',
      });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Invalid');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should fail when select_options has invalid structure', () => {
      const template = createValidTemplate('Element', {
        select_options: {
          option1: { invalid: 'structure' },
        },
      });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should succeed with valid select_options', () => {
      const template = createValidTemplate('Element', {
        select_options: {
          option1: {
            options: [
              { key: 'opt1', label: 'Option 1' },
              { key: 'opt2', label: 'Option 2' },
            ],
          },
        },
      });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(true);
    });

    it('should fail when pkg.eln is missing required fields', () => {
      const template = createValidTemplate('Element', {
        pkg: {
          name: 'chem-generic-ui',
          version: '2.1.0-rc18',
          labimotion: '1.0.0',
        },
      });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should fail with multiple errors when layers are missing required fields', () => {
      const template = createValidTemplate('Element', {
        layers: {
          test_layer: {
            fields: [],
          },
        },
      });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
      expect(result.notify.msg).toContain('validation errors');
    });

    it('should fail with multiple errors from different properties', () => {
      const template = createValidTemplate('Element', {
        layers: {
          test_layer: {
            position: 0,
            wf: true,
            fields: [],
          },
        },
        select_options: {
          color: 'invalid',
        },
      });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
      expect(result.notify.msg).toContain('validation errors');
    });
  });

  describe('JSON parsing errors', () => {
    it('should fail when JSON is malformed', () => {
      const event = {
        target: {
          result: 'invalid json {',
        },
      };

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
      expect(result.notify.msg).toContain('incorrect format');
    });
  });
});

describe('handleFieldInputChange — type change prop cleanup', () => {
  const makeElement = ({
    numeric: numericOverrides,
    ...fieldOverrides
  } = {}) => ({
    properties_template: {
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          fields: [
            {
              field: 'f1',
              label: 'Field 1',
              type: 'number',
              numeric:
                numericOverrides === null
                  ? undefined
                  : { decimals: 2, min: 0, max: 100, ...numericOverrides },
              placeholder: 'enter value',
              required: true,
              readonly: false,
              ...fieldOverrides,
            },
          ],
        },
      },
    },
    metadata: {},
  });

  const typeChangeEvent = (newType) => ({ target: { value: newType } });

  it('clears decimals/min/max when changing from number to text', () => {
    const element = makeElement();
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'number',
      'f1',
      'layer1',
      'type',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.type).toBe('text');
    expect(field.numeric).toBeUndefined();
  });

  it('clears value when changing from number to text — warning message mentions "default value"', () => {
    const element = makeElement({ value: 3.5 });
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'number',
      'f1',
      'layer1',
      'type',
      'text',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.value).toBeUndefined();
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('default value');
    expect(result.notify.title).toBe('Warning');
  });

  it('clears value when changing from number to checkbox — warning message mentions "default value"', () => {
    const element = makeElement({ value: 10 });
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('checkbox'),
      'number',
      'f1',
      'layer1',
      'type',
      'checkbox',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.value).toBeUndefined();
    expect(result.notify.lvl).toBe('warning');
  });

  it('warns with display name reference when display name are affected', () => {
    const element = makeElement({ value: undefined });
    element.properties_template.layers.layer1.label_fields = ['f1'];
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'number',
      'f1',
      'layer1',
      'type',
      'text',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('display name reference');
  });

  it('warns with restrictions when group restrictions are affected', () => {
    const element = makeElement({ value: undefined });
    element.metadata = {
      restrict: {
        layer1: { cond: [{ layer: 'layer1', field: 'f1', v: '1', o: '=' }] },
      },
    };
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'number',
      'f1',
      'layer1',
      'type',
      'text',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('restrictions');
  });

  it('warns with restrictions when only a partial cond entry is removed', () => {
    const element = makeElement({ value: undefined });
    element.metadata = {
      restrict: {
        layer1: {
          cond: [
            { layer: 'layer1', field: 'f1', v: '1', o: '=' },
            { layer: 'layer1', field: 'other', v: '2', o: '=' },
          ],
        },
      },
    };
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'number',
      'f1',
      'layer1',
      'type',
      'text',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('restrictions');
  });

  it('warns with restrictions when layer restrictions are affected', () => {
    const element = makeElement({ value: undefined, type: 'select' });
    element.properties_template.layers.layer2 = {
      key: 'layer2',
      label: 'L2',
      fields: [],
      cond_fields: [{ layer: 'layer1', field: 'f1' }],
    };
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('checkbox'),
      'select',
      'f1',
      'layer1',
      'type',
      'checkbox',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('restrictions');
  });

  it('warns with all three items when value, display name, and restrictions are all cleared', () => {
    const element = makeElement({ value: 3.5 });
    element.properties_template.layers.layer1.label_fields = ['f1'];
    element.metadata = {
      restrict: {
        layer1: { cond: [{ layer: 'layer1', field: 'f1', v: '1', o: '=' }] },
      },
    };
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'number',
      'f1',
      'layer1',
      'type',
      'text',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('default value');
    expect(result.notify.msg).toContain('display name reference');
    expect(result.notify.msg).toContain('restrictions');
  });

  it('does NOT warn when changing type with no value, display name, or restrictions', () => {
    const element = makeElement({ value: undefined });
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'number',
      'f1',
      'layer1',
      'type',
      'text',
    );
    expect(result.notify.lvl).not.toBe('warning');
    expect(result.notify.isSuccess).toBe(true);
  });

  it('preserves value when changing within number/integer family', () => {
    const element = makeElement({ type: 'integer', value: 5 });
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('number'),
      'integer',
      'f1',
      'layer1',
      'type',
      'text',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.value).toBe(5);
  });

  it('clears decimals/min/max when changing from number to select', () => {
    const element = makeElement();
    const result = handleFieldInputChange(
      element,
      { value: 'select' },
      'number',
      'f1',
      'layer1',
      'type',
      'select',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric).toBeUndefined();
  });

  it('preserves numeric config when changing from integer to number (same family)', () => {
    const element = makeElement({ type: 'integer', numeric: null });
    migrateIntegerFields(element);
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('number'),
      'integer',
      'f1',
      'layer1',
      'type',
      'text',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.type).toBe('number');
    expect(field.numeric.decimals).toBe(0);
    expect(field.numeric.min).toBe('');
    expect(field.numeric.max).toBe('');
  });

  it('clears placeholder/required/readonly when changing from text to checkbox', () => {
    const element = makeElement({ type: 'text', numeric: null });
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('checkbox'),
      'text',
      'f1',
      'layer1',
      'type',
      'text',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.type).toBe('checkbox');
    expect(field.placeholder).toBeUndefined();
    expect(field.required).toBeUndefined();
    expect(field.readonly).toBeUndefined();
  });

  it('clears formula/decimal when changing from formula-field to text', () => {
    const element = makeElement({
      type: 'formula-field',
      formula: 'a+b',
      decimal: 3,
      numeric: null,
    });
    const result = handleFieldInputChange(
      element,
      typeChangeEvent('text'),
      'formula-field',
      'f1',
      'layer1',
      'type',
      'text',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.type).toBe('text');
    expect(field.formula).toBeUndefined();
    expect(field.decimal).toBeUndefined();
  });
});

describe('handleFieldInputChange — default case saves unrecognised fieldCheck', () => {
  const makeElement = (fieldOverrides = {}) => ({
    properties_template: {
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          fields: [
            {
              field: 'f1',
              label: 'Field 1',
              type: 'formula-field',
              ...fieldOverrides,
            },
          ],
        },
      },
    },
    metadata: {},
  });

  it('saves formula when fieldCheck is "formula"', () => {
    const element = makeElement();
    const result = handleFieldInputChange(
      element,
      { target: { value: '1 + 2.8' } },
      'formula-field',
      'f1',
      'layer1',
      'formula',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(
      result.element.properties_template.layers.layer1.fields[0].formula,
    ).toBe('1 + 2.8');
  });

  it('saves decimal when fieldCheck is "decimal"', () => {
    const element = makeElement();
    const result = handleFieldInputChange(
      element,
      { target: { value: 5 } },
      'formula-field',
      'f1',
      'layer1',
      'decimal',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(
      result.element.properties_template.layers.layer1.fields[0].decimal,
    ).toBe(5);
  });

  it('saves label when fieldCheck is "label"', () => {
    const element = makeElement({ type: 'text' });
    const result = handleFieldInputChange(
      element,
      { target: { value: 'My Label' } },
      'text',
      'f1',
      'layer1',
      'label',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(
      result.element.properties_template.layers.layer1.fields[0].label,
    ).toBe('My Label');
  });
});

describe('handleFieldInputChange — ontology_term reassignment clears stale value', () => {
  const makeElement = (fieldOverrides = {}) => ({
    properties_template: {
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          fields: [
            {
              field: 'f1',
              label: 'Field 1',
              type: 'ontology-select',
              ontology_term: {
                label: 'assay data identifier',
                value:
                  'afo:class:http://purl.allotrope.org/ontologies/result#AFR_0002019',
              },
              value: 'Stale Picked Term',
              ...fieldOverrides,
            },
          ],
        },
      },
    },
    metadata: {},
  });

  const ontologyChangeEvent = (term) => ({ target: { value: term } });

  it('clears the pre-filled value when the ontology term scope changes', () => {
    const element = makeElement();
    const result = handleFieldInputChange(
      element,
      ontologyChangeEvent({
        label: 'assay format',
        value: 'bao:class:http://www.bioassayontology.org/bao#BAO_0000019',
      }),
      element.properties_template.layers.layer1.fields[0].ontology_term,
      'f1',
      'layer1',
      'ontology_term',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.ontology_term.value).toBe(
      'bao:class:http://www.bioassayontology.org/bao#BAO_0000019',
    );
    expect(field.value).toBeUndefined();
  });

  it('keeps the pre-filled value when re-assigned to the same term', () => {
    const element = makeElement();
    const sameTerm =
      element.properties_template.layers.layer1.fields[0].ontology_term;
    const result = handleFieldInputChange(
      element,
      ontologyChangeEvent({ ...sameTerm }),
      sameTerm,
      'f1',
      'layer1',
      'ontology_term',
      'text',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.value).toBe('Stale Picked Term');
  });

  it('sets the term without error when no prior value exists', () => {
    const element = makeElement({ value: undefined });
    const result = handleFieldInputChange(
      element,
      ontologyChangeEvent({ label: 'assay format', value: 'bao:x' }),
      element.properties_template.layers.layer1.fields[0].ontology_term,
      'f1',
      'layer1',
      'ontology_term',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.ontology_term.value).toBe('bao:x');
    expect(field.value).toBeUndefined();
  });
});

describe('handleFieldInputChange — constraint change clears out-of-range value', () => {
  const makeElement = ({
    numeric: numericOverrides,
    ...fieldOverrides
  } = {}) => ({
    properties_template: {
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          fields: [
            {
              field: 'f1',
              label: 'Field 1',
              type: 'number',
              numeric: { decimals: 0, min: 1, max: 20, ...numericOverrides },
              value: 10,
              ...fieldOverrides,
            },
          ],
        },
      },
    },
    metadata: {},
  });

  const constraintEvent = (val) => ({ target: { value: val } });

  it('clears value and warns when new max makes existing value out of range', () => {
    const element = makeElement({ value: 10, numeric: { max: 20 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(8),
      'f1',
      'f1',
      'layer1',
      'max',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.title).toBe('Warning');
    expect(result.notify.msg).toContain('Default value cleared');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.max).toBe(8);
    expect(field.value).toBe('');
  });

  it('clears value and warns when new min makes existing value out of range', () => {
    const element = makeElement({ value: 2, numeric: { min: 1 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(5),
      'f1',
      'f1',
      'layer1',
      'min',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.notify.lvl).toBe('warning');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.min).toBe(5);
    expect(field.value).toBe('');
  });

  it('rounds default value to the new precision and warns', () => {
    const element = makeElement({
      value: 1.5,
      numeric: { decimals: 1, max: 20 },
    });
    const result = handleFieldInputChange(
      element,
      constraintEvent(0),
      'f1',
      'f1',
      'layer1',
      'decimals',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('rounded');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.decimals).toBe(0);
    expect(field.value).not.toBe('');
    expect(field.value).not.toBe(1.5);
  });

  it('does NOT clear value when it still satisfies the new constraint', () => {
    const element = makeElement({ value: 5, numeric: { max: 20 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(10),
      'f1',
      'f1',
      'layer1',
      'max',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.notify.lvl).not.toBe('warning');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.value).toBe(5);
  });

  it('does NOT clear value when it is empty', () => {
    const element = makeElement({ value: '', numeric: { max: 20 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(3),
      'f1',
      'f1',
      'layer1',
      'max',
      'text',
    );
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.value).toBe('');
    expect(result.notify.lvl).not.toBe('warning');
  });

  it('clears max and warns when max < min', () => {
    const element = makeElement({ value: '', numeric: { min: 1, max: 20 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(0),
      'f1',
      'f1',
      'layer1',
      'max',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('min cannot be greater than max');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.max).toBe('');
    expect(field.numeric.min).toBe(1);
  });

  it('clears min and warns when min > max', () => {
    const element = makeElement({ value: '', numeric: { min: 1, max: 10 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(15),
      'f1',
      'f1',
      'layer1',
      'min',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('min cannot be greater than max');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.min).toBe('');
    expect(field.numeric.max).toBe(10);
  });

  it('allows min equal to max (valid boundary)', () => {
    const element = makeElement({ value: '', numeric: { min: 5, max: 20 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(5),
      'f1',
      'f1',
      'layer1',
      'max',
      'text',
    );
    expect(result.notify.lvl).not.toBe('warning');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.max).toBe(5);
  });

  it('warns and resets to 0 when decimals is negative', () => {
    const element = makeElement({ value: 5, numeric: { max: 20 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent('-2'),
      'f1',
      'f1',
      'layer1',
      'decimals',
      'text',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.title).toBe('Warning');
    expect(result.notify.msg).toContain('Invalid decimals');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.decimals).toBe(0);
  });

  it('warns and truncates to integer when decimals is a float', () => {
    const element = makeElement({ value: 5, numeric: { max: 20 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent('2.5'),
      'f1',
      'f1',
      'layer1',
      'decimals',
      'text',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('Invalid decimals');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.decimals).toBe(2);
  });

  it('resets decimals to 0 silently when cleared (empty string)', () => {
    const element = makeElement({
      value: '',
      numeric: { decimals: 3, max: 20 },
    });
    const result = handleFieldInputChange(
      element,
      constraintEvent(''),
      'f1',
      'f1',
      'layer1',
      'decimals',
      'text',
    );
    expect(result.notify.lvl).not.toBe('warning');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.decimals).toBe(0);
  });

  it('normalizes min to decimals precision and warns', () => {
    const element = makeElement({
      value: '',
      numeric: { decimals: 1, max: 20 },
    });
    const result = handleFieldInputChange(
      element,
      constraintEvent(3.95),
      'f1',
      'f1',
      'layer1',
      'min',
      'text',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('Min rounded');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.min).toBe(4);
  });

  it('normalizes max to decimals precision and warns', () => {
    const element = makeElement({ value: '', numeric: { decimals: 0 } });
    const result = handleFieldInputChange(
      element,
      constraintEvent(3.9),
      'f1',
      'f1',
      'layer1',
      'max',
      'text',
    );
    expect(result.notify.lvl).toBe('warning');
    expect(result.notify.msg).toContain('Max rounded');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.max).toBe(4);
  });

  it('does not warn when min already matches decimals precision', () => {
    const element = makeElement({
      value: '',
      numeric: { decimals: 1, max: 20 },
    });
    const result = handleFieldInputChange(
      element,
      constraintEvent(3.5),
      'f1',
      'f1',
      'layer1',
      'min',
      'text',
    );
    expect(result.notify.lvl).not.toBe('warning');
    const field = result.element.properties_template.layers.layer1.fields[0];
    expect(field.numeric.min).toBe(3.5);
  });
});

describe('handleTemplateUploading — unsupported field type', () => {
  const validPkgData = {
    eln: {
      version: '1.0.0',
      base_revision: 'abc123',
      current_revision: 'def456',
    },
    name: 'chem-generic-ui',
    version: '2.1.0-rc18',
    labimotion: '1.0.0',
  };

  const makeTemplateWithField = (fieldType) => ({
    pkg: validPkgData,
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    klass: 'ElementKlass',
    version: '1.0.0',
    identifier: 'test-id',
    layers: {
      layer1: {
        key: 'layer1',
        label: 'Layer 1',
        position: 1,
        fields: [{ field: 'f1', label: 'Field 1', type: fieldType }],
      },
    },
  });

  const toEvent = (data) => ({ target: { result: JSON.stringify(data) } });

  it('preserves supported field type (text) on import', () => {
    const result = handleTemplateUploading(
      toEvent(makeTemplateWithField('text')),
      'Element',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.element.layers.layer1.fields[0].type).toBe('text');
  });

  it('preserves number field type on import (supported in current system)', () => {
    const result = handleTemplateUploading(
      toEvent(makeTemplateWithField('number')),
      'Element',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.element.layers.layer1.fields[0].type).toBe('number');
  });

  it('downgrades unknown field type to text on import', () => {
    const result = handleTemplateUploading(
      toEvent(makeTemplateWithField('future_unknown_type')),
      'Element',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(result.element.layers.layer1.fields[0].type).toBe('text');
  });
});

describe('handleKlassUploading — unsupported field type', () => {
  const makeKlassWithField = (fieldType) => ({
    label: 'Test Element',
    desc: 'A test element',
    name: 'tstelement',
    klass_prefix: 'TE',
    icon_name: 'icon-test',
    element_klass: { id: 1 },
    properties_template: {
      klass: 'ElementKlass',
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          position: 1,
          fields: [{ field: 'f1', label: 'Field 1', type: fieldType }],
        },
      },
    },
  });

  const toEvent = (data) => ({ target: { result: JSON.stringify(data) } });

  it('preserves number field type on klass import (supported in current system)', () => {
    const result = handleKlassUploading(
      toEvent(makeKlassWithField('number')),
      'Element',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(
      result.element.properties_template.layers.layer1.fields[0].type,
    ).toBe('number');
  });

  it('downgrades unknown field type to text on klass import', () => {
    const result = handleKlassUploading(
      toEvent(makeKlassWithField('future_unknown_type')),
      'Element',
    );
    expect(result.notify.isSuccess).toBe(true);
    expect(
      result.element.properties_template.layers.layer1.fields[0].type,
    ).toBe('text');
  });
});

describe('handleFieldInputChange — option_layers (source) change clears selected values', () => {
  const makeElement = (type, fieldOverrides = {}) => ({
    properties_template: {
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          fields: [
            {
              field: 'f1',
              label: 'Field 1',
              type,
              option_layers: 'oldSource',
              ...fieldOverrides,
            },
          ],
        },
      },
    },
    metadata: {},
  });

  // select fields read the new value from event.value (not event.target.value)
  const sourceEvent = (newSource) => ({ value: newSource });
  const fieldOf = (result) =>
    result.element.properties_template.layers.layer1.fields[0];

  it('F_SELECT: clears stored value when source changes', () => {
    const element = makeElement('select', { value: 'stale' });
    const result = handleFieldInputChange(
      element,
      sourceEvent('newSource'),
      'oldSource',
      'f1',
      'layer1',
      'option_layers',
      'select',
    );
    const field = fieldOf(result);
    expect(result.notify.isSuccess).toBe(true);
    expect(field.option_layers).toBe('newSource');
    expect(field.value).toBeUndefined();
  });

  it('F_SELECT_MULTI: clears sub_fields and sub_values when source changes', () => {
    const element = makeElement('select-multi', {
      sub_fields: [{ value: 1 }, { value: 2 }],
      sub_values: ['1', '2'],
    });
    const result = handleFieldInputChange(
      element,
      sourceEvent('newSource'),
      'oldSource',
      'f1',
      'layer1',
      'option_layers',
      'select-multi',
    );
    const field = fieldOf(result);
    expect(result.notify.isSuccess).toBe(true);
    expect(field.option_layers).toBe('newSource');
    expect(field.sub_fields).toEqual([]);
    expect(field.sub_values).toEqual([]);
  });

  it('F_SELECT: preserves value when source is unchanged', () => {
    const element = makeElement('select', { value: 'keep' });
    const result = handleFieldInputChange(
      element,
      sourceEvent('oldSource'),
      'oldSource',
      'f1',
      'layer1',
      'option_layers',
      'select',
    );
    const field = fieldOf(result);
    expect(field.option_layers).toBe('oldSource');
    expect(field.value).toBe('keep');
  });

  it('F_SELECT_MULTI: preserves sub_fields/sub_values when source is unchanged', () => {
    const element = makeElement('select-multi', {
      sub_fields: [{ value: 1 }],
      sub_values: ['1'],
    });
    const result = handleFieldInputChange(
      element,
      sourceEvent('oldSource'),
      'oldSource',
      'f1',
      'layer1',
      'option_layers',
      'select-multi',
    );
    const field = fieldOf(result);
    expect(field.sub_fields).toEqual([{ value: 1 }]);
    expect(field.sub_values).toEqual(['1']);
  });
});

describe('handleFieldInputChange — value_system_base (formula base unit)', () => {
  const makeElement = (type, fieldOverrides = {}) => ({
    properties_template: {
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          fields: [{ field: 'f1', label: 'Field 1', type, ...fieldOverrides }],
        },
      },
    },
    metadata: {},
  });
  const fieldOf = (result) =>
    result.element.properties_template.layers.layer1.fields[0];

  it('pins value_system_base = value_system when type changes to system-defined', () => {
    const element = makeElement('number');
    const result = handleFieldInputChange(
      element,
      { value: FieldTypes.F_SYSTEM_DEFINED },
      'number',
      'f1',
      'layer1',
      'type',
      FieldTypes.F_SYSTEM_DEFINED,
    );
    const field = fieldOf(result);
    expect(field.value_system).toBeTruthy();
    expect(field.value_system_base).toBe(field.value_system);
  });

  it('re-pins value_system_base when the designer cycles the unit', () => {
    const element = makeElement(FieldTypes.F_SYSTEM_DEFINED, {
      option_layers: 'mass',
      value_system: 'g',
      value_system_base: 'g',
    });
    const result = handleFieldInputChange(
      element,
      { value: 'kg' },
      FieldTypes.F_SYSTEM_DEFINED,
      'f1',
      'layer1',
      'value_system',
      FieldTypes.F_SYSTEM_DEFINED,
    );
    const field = fieldOf(result);
    expect(field.value_system).toBe('kg');
    expect(field.value_system_base).toBe('kg');
  });

  it('clears value_system_base when switching away from system-defined', () => {
    const element = makeElement(FieldTypes.F_SYSTEM_DEFINED, {
      option_layers: 'mass',
      value_system: 'g',
      value_system_base: 'g',
    });
    const result = handleFieldInputChange(
      element,
      { target: { value: 'text' } },
      FieldTypes.F_SYSTEM_DEFINED,
      'f1',
      'layer1',
      'type',
      'text',
    );
    const field = fieldOf(result);
    expect(field.value_system_base).toBeUndefined();
  });
});

describe('handleFieldInputChange — system-defined quantity (option_layers) change clears stale value', () => {
  const makeElement = (fieldOverrides = {}) => ({
    properties_template: {
      layers: {
        layer1: {
          key: 'layer1',
          label: 'Layer 1',
          fields: [
            {
              field: 'f1',
              label: 'Field 1',
              type: FieldTypes.F_SYSTEM_DEFINED,
              option_layers: 'acceleration',
              value: 5,
              ...fieldOverrides,
            },
          ],
        },
      },
    },
    metadata: {},
  });
  const fieldOf = (result) =>
    result.element.properties_template.layers.layer1.fields[0];

  it('clears the stale value when the quantity changes', () => {
    const element = makeElement();
    const result = handleFieldInputChange(
      element,
      { value: 'agitation' },
      'acceleration',
      'f1',
      'layer1',
      'option_layers',
      FieldTypes.F_SYSTEM_DEFINED,
    );
    const field = fieldOf(result);
    expect(field.option_layers).not.toBe('acceleration');
    expect(field.value).toBeUndefined();
    // base unit is re-pinned to the new quantity's default
    expect(field.value_system_base).toBe(field.value_system);
  });

  it('keeps the value when the quantity is unchanged', () => {
    const element = makeElement();
    const result = handleFieldInputChange(
      element,
      { value: 'acceleration' },
      'acceleration',
      'f1',
      'layer1',
      'option_layers',
      FieldTypes.F_SYSTEM_DEFINED,
    );
    const field = fieldOf(result);
    expect(field.value).toBe(5);
  });
});
