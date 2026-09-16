import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GenInterface from '@components/details/GenInterface';

// Heavy chrome that surrounds the layers is irrelevant to the unit-click path.
vi.mock('@components/flow/ProgressFlowWrapper', () => ({
  default: () => <div data-testid="progress-flow" />,
}));
vi.mock('@components/regComps/RegCompWrapper', () => ({
  default: () => <div data-testid="reg-comp" />,
}));
vi.mock('@/ui/modals/LayerModal', () => ({
  default: () => <div data-testid="layer-modal" />,
}));
vi.mock('@components/details/GenAnaModal', () => ({
  default: () => <div data-testid="ana-modal" />,
}));

// mass_1 = 6 g, mass_2 = 2 g, result = mass_1 / mass_2 => 3.
const buildGeneric = () => ({
  container: { children: [{ children: [] }] },
  changed: false,
  properties: {
    layers: {
      layer_one: {
        key: 'layer_one',
        label: 'Layer One',
        position: 1,
        wf_position: 0,
        fields: [
          {
            field: 'mass_1',
            label: 'Mass 1',
            type: 'system-defined',
            option_layers: 'mass',
            value: 6,
            value_system: 'g',
            value_system_base: 'g',
          },
          {
            field: 'mass_2',
            label: 'Mass 2',
            type: 'system-defined',
            option_layers: 'mass',
            value: 2,
            value_system: 'g',
            value_system_base: 'g',
          },
          {
            field: 'result',
            label: 'Result',
            type: 'formula-field',
            formula: 'mass_1 / mass_2',
            value: '',
          },
        ],
      },
    },
    select_options: {},
  },
  properties_release: { select_options: {} },
});

const renderGen = (generic, fnChange, isPreview) =>
  render(
    <GenInterface
      generic={generic}
      fnChange={fnChange}
      isPreview={isPreview}
      isActiveWF={false}
      editMode
    />,
  );

const findMass1 = (generic) =>
  generic.properties.layers.layer_one.fields.find((f) => f.field === 'mass_1');

describe('GenInterface system-defined unit button', () => {
  test('at runtime, converts the display but leaves value_system_base pinned', () => {
    const generic = buildGeneric();
    const fnChange = vi.fn();
    const { rerender } = renderGen(generic, fnChange, false);

    // Result is calculated from the pinned base before any unit switch.
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'g' })[0]);

    expect(fnChange).toHaveBeenCalled();
    const mass1 = findMass1(generic);
    // Display moved to the next unit ...
    expect(mass1.value_system).toBe('mg');
    expect(mass1.value).toBe(6000);
    // ... but the formula base did not.
    expect(mass1.value_system_base).toBe('g');

    rerender(
      <GenInterface
        generic={generic}
        fnChange={fnChange}
        isPreview={false}
        isActiveWF={false}
        editMode
      />,
    );

    expect(
      screen.getAllByRole('button', { name: 'mg' })[0],
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('6000')).toBeInTheDocument();
    // A system-defined field must convert to its base unit before dividing:
    // 6000 mg / 2 g is still 3, not 3000.
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  test('in the Designer Preview, the unit button is disabled and cannot switch', () => {
    const generic = buildGeneric();
    const fnChange = vi.fn();
    renderGen(generic, fnChange, true);

    const unitBtn = screen.getAllByRole('button', { name: 'g' })[0];
    expect(unitBtn).toBeDisabled();

    fireEvent.click(unitBtn);

    // The default unit belongs to the Work Area, so nothing moves here.
    expect(fnChange).not.toHaveBeenCalled();
    const mass1 = findMass1(generic);
    expect(mass1.value_system).toBe('g');
    expect(mass1.value).toBe(6);
    expect(mass1.value_system_base).toBe('g');
    expect(generic.changed).toBe(false);
  });

  test('in the Designer Preview, the value input stays editable', () => {
    const generic = buildGeneric();
    const fnChange = vi.fn();
    renderGen(generic, fnChange, true);

    const input = screen.getByDisplayValue('6');
    expect(input).not.toHaveAttribute('readonly');

    fireEvent.change(input, { target: { value: '8' } });

    expect(fnChange).toHaveBeenCalled();
  });
});
