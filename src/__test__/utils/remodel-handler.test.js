import { FieldTypes } from 'generic-ui-core';
import { remodel } from '@utils/template/remodel-handler';

const colNum = { id: 'c1', col_name: 'Amount', type: FieldTypes.F_NUMBER };
const formulaCol = (formula) => ({
  id: 'c3',
  col_name: 'Total',
  type: FieldTypes.F_FORMULA_FIELD,
  formula,
  decimal: 2,
  refs: [{ abbr: 'a', id: 'c1' }],
});

const tableField = (subFields, subValues) => ({
  field: 'tab',
  label: 'Tab',
  type: FieldTypes.F_TABLE,
  sub_fields: subFields,
  sub_values: subValues,
});

const buildGeneric = (field) => ({
  properties: {
    klass: 'element',
    layers: { l1: { key: 'l1', fields: [field] } },
  },
});

const buildKlass = (field) => ({
  uuid: 'uuid-new',
  properties_release: {
    layers: { l1: { key: 'l1', fields: [field] } },
    select_options: {},
  },
});

describe('remodel with formula table columns', () => {
  it('recomputes stored formula cells against the new template formula', () => {
    const generic = buildGeneric(
      tableField(
        [colNum, formulaCol('a')],
        [{ id: 'r1', c1: { value: 3 }, c3: { value: 3 } }],
      ),
    );
    const klass = buildKlass(tableField([colNum, formulaCol('a * 2')], []));
    const [, newProps] = remodel(generic, klass);
    const tab = newProps.layers.l1.fields[0];
    expect(tab.sub_values[0].c3).toEqual({ value: 6 });
  });

  it('computes cells of a formula column newly added by the template', () => {
    const generic = buildGeneric(
      tableField([colNum], [{ id: 'r1', c1: { value: 4 } }]),
    );
    const klass = buildKlass(tableField([colNum, formulaCol('a * 2')], []));
    const [, newProps] = remodel(generic, klass);
    const tab = newProps.layers.l1.fields[0];
    expect(tab.sub_values[0].c3).toEqual({ value: 8 });
  });
});

describe('remodel with ontology-select field', () => {
  const termA = {
    label: 'assay data identifier',
    value: 'afo:class:http://purl.allotrope.org/ontologies/result#AFR_0002019',
  };
  const termB = {
    label: 'assay format',
    value: 'bao:class:http://www.bioassayontology.org/bao#BAO_0000019',
  };
  const ontoField = (term, value) => ({
    field: 'f1',
    label: 'F1',
    type: FieldTypes.F_ONTOLOGY_SELECT,
    ontology_term: term,
    value,
  });

  it('carries over the answer when the ontology term scope is unchanged', () => {
    const generic = buildGeneric(ontoField(termA, 'Picked Node'));
    const klass = buildKlass(ontoField(termA, ''));
    const [, newProps] = remodel(generic, klass);
    expect(newProps.layers.l1.fields[0].value).toBe('Picked Node');
  });

  it('clears the answer when the Designer re-assigns a different ontology term', () => {
    const generic = buildGeneric(ontoField(termA, 'Picked Node'));
    const klass = buildKlass(ontoField(termB, ''));
    const [, newProps] = remodel(generic, klass);
    expect(newProps.layers.l1.fields[0].value).toBe('');
  });

  it('clears the answer when the field type changed to ontology-select', () => {
    const generic = buildGeneric({
      field: 'f1',
      label: 'F1',
      type: FieldTypes.F_TEXT,
      value: 'plain text answer',
    });
    const klass = buildKlass(ontoField(termA, ''));
    const [, newProps] = remodel(generic, klass);
    expect(newProps.layers.l1.fields[0].value).toBe('');
  });
});
