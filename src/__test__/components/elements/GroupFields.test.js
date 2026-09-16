import { FieldTypes } from 'generic-ui-core';
import GroupFields from '@components/elements/GroupFields';

// GroupFields is the Work Area editor for an Input Group field's sub-fields.
// A System-Defined sub-field shows a "Default Unit" button (DefinedRenderer ->
// SystemDefinedColumn -> InputUnit) whose click calls the `selUnit` handler
// threaded through the grid's cellRendererParams. That handler was wired for
// the table-column editor (FieldTable) but not here, so clicking the button
// threw "selUnit is not a function". These tests pin the wiring + behavior
// without mounting AgGridReact (which the suite does not render in jsdom).

const buildProps = (subFields, updSub = vi.fn()) => ({
  layerKey: 'layer1',
  field: { field: 'grp', sub_fields: subFields },
  updSub,
  unitsFields: [
    { field: 'mass', label: 'Mass', units: [{ key: 'g' }, { key: 'mg' }] },
  ],
  panelIsExpanded: true,
});

// Minimal grid API stub: refresh() collects rows via forEachNode; the state
// helpers guard on their existence, so no-op implementations are enough.
const stubGridApi = (field) => ({
  forEachNode: (cb) => (field.sub_fields || []).forEach((d) => cb({ data: d })),
  getColumnState: () => [],
  applyColumnState: () => {},
});

const sysSub = () => ({
  id: 'c1',
  type: FieldTypes.F_SYSTEM_DEFINED,
  option_layers: 'mass',
  value_system: 'g',
});

const getSelUnit = (gf) => {
  const col = gf.columnDefs.find((c) => c.field === 'value');
  return col.cellRendererParams.selUnit;
};

describe('GroupFields default-unit wiring', () => {
  test('the Default Value column wires a selUnit handler (regression for the crash)', () => {
    const gf = new GroupFields(buildProps([sysSub()]));
    expect(typeof getSelUnit(gf)).toBe('function');
  });

  test('selUnit pins the chosen unit on the sub-field and persists', () => {
    const updSub = vi.fn();
    const props = buildProps([sysSub()], updSub);
    const gf = new GroupFields(props);
    gf.gridApi = stubGridApi(props.field);

    getSelUnit(gf)('mg', { data: props.field.sub_fields[0] });

    expect(props.field.sub_fields[0].value_system).toBe('mg');
    expect(updSub).toHaveBeenCalled();
    const [layerKey, field] = updSub.mock.calls[0];
    expect(layerKey).toBe('layer1');
    expect(field.sub_fields[0].value_system).toBe('mg');
  });

  test('selUnit is a no-op for a non-system-defined row', () => {
    const updSub = vi.fn();
    const props = buildProps(
      [{ id: 'c1', type: FieldTypes.F_TEXT, value: '' }],
      updSub,
    );
    const gf = new GroupFields(props);
    gf.gridApi = stubGridApi(props.field);

    getSelUnit(gf)('mg', { data: props.field.sub_fields[0] });

    expect(updSub).not.toHaveBeenCalled();
  });

  test('selUnit is a no-op when the unit is unchanged', () => {
    const updSub = vi.fn();
    const props = buildProps([sysSub()], updSub);
    const gf = new GroupFields(props);
    gf.gridApi = stubGridApi(props.field);

    getSelUnit(gf)('g', { data: props.field.sub_fields[0] });

    expect(updSub).not.toHaveBeenCalled();
  });
});
