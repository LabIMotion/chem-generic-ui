import { FieldTypes } from 'generic-ui-core';
import organizeSubValues from '@components/tools/collate';

const sysCol = (id, optionLayers, valueSystem) => ({
  id,
  type: FieldTypes.F_SYSTEM_DEFINED,
  option_layers: optionLayers,
  value_system: valueSystem,
});
const textCol = (id) => ({ id, type: FieldTypes.F_TEXT });
const table = (subFields, subValues = []) => ({
  sub_fields: subFields,
  sub_values: subValues,
});
const lengthAndTime = (len = 'cm', dur = 's') => [
  sysCol('c1', 'length', len),
  sysCol('c2', 'duration', dur),
];
const entered = {
  id: 'r1',
  c1: { value: 10000, value_system: 'cm' },
  c2: { value: 10, value_system: 's' },
};

describe('organizeSubValues', () => {
  describe('System-Defined cells', () => {
    it('keeps value and unit when the template is unchanged', () => {
      const [row] = organizeSubValues(
        table(lengthAndTime()),
        table(lengthAndTime(), [entered]),
      );

      expect(row.c1).toEqual({ value: 10000, value_system: 'cm' });
      expect(row.c2).toEqual({ value: 10, value_system: 's' });
    });

    it('is stable across repeated reloads', () => {
      const once = organizeSubValues(
        table(lengthAndTime()),
        table(lengthAndTime(), [entered]),
      );
      const [row] = organizeSubValues(
        table(lengthAndTime()),
        table(lengthAndTime(), once),
      );

      expect(row.c1).toEqual({ value: 10000, value_system: 'cm' });
      expect(row.c2).toEqual({ value: 10, value_system: 's' });
    });

    it('keeps the entered unit when only the default unit changes', () => {
      const [row] = organizeSubValues(
        table(lengthAndTime('m', 'min')),
        table(lengthAndTime(), [entered]),
      );

      expect(row.c1).toEqual({ value: 10000, value_system: 'cm' });
      expect(row.c2).toEqual({ value: 10, value_system: 's' });
    });

    it('clears the value when the quantity changes', () => {
      const [row] = organizeSubValues(
        table([sysCol('c1', 'duration', 's'), sysCol('c2', 'duration', 's')]),
        table(lengthAndTime(), [entered]),
      );

      expect(row.c1).toEqual({ value: '', value_system: 's' });
      expect(row.c2).toEqual({ value: 10, value_system: 's' });
    });

    it('starts empty with the default unit when the column was text', () => {
      const [row] = organizeSubValues(
        table([sysCol('c1', 'length', 'mm')]),
        table([textCol('c1')], [{ id: 'r1', c1: 'ten metres' }]),
      );

      expect(row.c1).toEqual({ value: '', value_system: 'mm' });
    });
  });

  describe('ontology-select cells', () => {
    const termA = {
      label: 'assay data identifier',
      value:
        'afo:class:http://purl.allotrope.org/ontologies/result#AFR_0002019',
    };
    const termB = {
      label: 'assay format',
      value: 'bao:class:http://www.bioassayontology.org/bao#BAO_0000019',
    };
    const ontoCol = (term) => ({
      id: 'c1',
      col_name: 'Term',
      type: FieldTypes.F_ONTOLOGY_SELECT,
      ontology_term: term,
    });
    const picked = { id: 'r1', c1: { value: 'Picked Node' } };

    it('carries over the value when the column ontology term is unchanged', () => {
      const [row] = organizeSubValues(
        table([ontoCol(termA)]),
        table([ontoCol(termA)], [picked]),
      );

      expect(row.c1).toEqual({ value: 'Picked Node' });
    });

    it('clears the value when the column is re-scoped to a different term', () => {
      const [row] = organizeSubValues(
        table([ontoCol(termB)]),
        table([ontoCol(termA)], [picked]),
      );

      expect(row.c1).toEqual({ value: '' });
    });

    it('clears the value when the column type changed to ontology-select', () => {
      const [row] = organizeSubValues(
        table([ontoCol(termA)]),
        table([textCol('c1')], [{ id: 'r1', c1: 'plain text' }]),
      );

      expect(row.c1).toEqual({ value: '' });
    });
  });
});
