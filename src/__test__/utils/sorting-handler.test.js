import { FieldTypes } from 'generic-ui-core';
import { migrateIntegerFields } from '@utils/template/sorting-handler';

const makeElement = (fields) => ({
  properties_template: {
    layers: {
      layer1: { key: 'layer1', fields },
    },
  },
});

describe('migrateIntegerFields', () => {
  it('converts integer type to number with decimals=0', () => {
    const el = makeElement([{ type: FieldTypes.F_INTEGER, field: 'qty' }]);
    migrateIntegerFields(el);
    const f = el.properties_template.layers.layer1.fields[0];
    expect(f.type).toBe(FieldTypes.F_NUMBER);
    expect(f.numeric.decimals).toBe(0);
  });

  it('sets min and max to empty string when undefined', () => {
    const el = makeElement([{ type: FieldTypes.F_INTEGER, field: 'qty' }]);
    migrateIntegerFields(el);
    const f = el.properties_template.layers.layer1.fields[0];
    expect(f.numeric.min).toBe('');
    expect(f.numeric.max).toBe('');
  });

  it('preserves existing value when migrating integer to number', () => {
    const el = makeElement([
      { type: FieldTypes.F_INTEGER, field: 'a', value: 123 },
    ]);
    migrateIntegerFields(el);
    const f = el.properties_template.layers.layer1.fields[0];
    expect(f.type).toBe(FieldTypes.F_NUMBER);
    expect(f.value).toBe(123);
    expect(f.numeric.decimals).toBe(0);
    expect(f.numeric.min).toBe('');
    expect(f.numeric.max).toBe('');
  });

  it('does not modify non-integer field types', () => {
    const el = makeElement([{ type: FieldTypes.F_TEXT, field: 'name' }]);
    migrateIntegerFields(el);
    expect(el.properties_template.layers.layer1.fields[0].type).toBe(
      FieldTypes.F_TEXT,
    );
  });

  it('migrates multiple integer fields across layers', () => {
    const el = {
      properties_template: {
        layers: {
          layerA: {
            key: 'layerA',
            fields: [{ type: FieldTypes.F_INTEGER, field: 'a' }],
          },
          layerB: {
            key: 'layerB',
            fields: [{ type: FieldTypes.F_INTEGER, field: 'b' }],
          },
        },
      },
    };
    migrateIntegerFields(el);
    expect(el.properties_template.layers.layerA.fields[0].type).toBe(
      FieldTypes.F_NUMBER,
    );
    expect(el.properties_template.layers.layerB.fields[0].type).toBe(
      FieldTypes.F_NUMBER,
    );
  });
});
