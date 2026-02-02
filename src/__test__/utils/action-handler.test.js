import { handleTemplateUploading } from '@utils/template/action-handler';

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
      const template = createValidTemplate('Element', { klass: 'InvalidKlass' });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Invalid');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should fail when select_options has invalid structure', () => {
      const template = createValidTemplate('Element', {
        select_options: {
          'option1': { invalid: 'structure' },
        },
      });
      const event = createMockEvent(template);

      const result = handleTemplateUploading(event, 'Element');

      expect(result.notify.isSuccess).toBe(false);
    });

    it('should succeed with valid select_options', () => {
      const template = createValidTemplate('Element', {
        select_options: {
          'option1': {
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
          'test_layer': {
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
          'test_layer': {
            position: 0,
            wf: true,
            fields: [],
          },
        },
        select_options: {
          'color': 'invalid',
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
