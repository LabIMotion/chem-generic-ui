import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { FieldTypes } from 'generic-ui-core';
import FieldRestrictionModal from '@components/designer/template/FieldRestrictionModal';
import { DesignerProvider } from '@components/designer/DesignerContext';

vi.mock('@utils/apiManager', () => ({
  default: { getUser: vi.fn(), getUsers: vi.fn() },
}));

// GenPropertiesOlsSelect hits the ontology API on mount; stub it out so the
// restriction modal can render an ontology-select value input offline.
vi.mock('@utils/ontologyApi', () => ({
  parseOntologyTerm: vi.fn(() => ({ ontologyId: null, termIri: null })),
  loadOntologyTerm: vi.fn(),
  loadTermChildren: vi.fn(),
  loadAllChildren: vi.fn(),
  cacheOntologyTree: vi.fn(),
  clearOntologyCache: vi.fn(),
  isTreeComplete: vi.fn(() => false),
}));

const ontLayer = {
  key: 'src_layer',
  label: 'Source Layer',
  fields: [
    {
      field: 'ont',
      label: 'Ontology',
      type: FieldTypes.F_ONTOLOGY_SELECT,
    },
  ],
};

const selLayer = {
  key: 'sel_layer',
  label: 'Select Layer',
  fields: [
    {
      field: 'color',
      label: 'Color',
      type: FieldTypes.F_SELECT,
      option_layers: 'colors',
    },
  ],
};

const targetLayer = {
  key: 'tgt_layer',
  label: 'Target Layer',
  fields: [{ field: 'dep', label: 'Dependent', type: FieldTypes.F_TEXT }],
};

const targetField = targetLayer.fields[0];

const renderModal = (props = {}) =>
  render(
    <DesignerProvider value={{ klasses: [], genericType: undefined }}>
      <FieldRestrictionModal
        showModal
        field={targetField}
        layer={targetLayer}
        sortedLayers={[ontLayer, targetLayer]}
        onUpdate={() => {}}
        onClose={() => {}}
        {...props}
      />
    </DesignerProvider>,
  );

describe('FieldRestrictionModal — empty-value conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // silence the intentional "No valid ontology term" warning from the stub
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('ontology-select condition can be added with an empty value', () => {
    const onUpdate = vi.fn();
    renderModal({ onUpdate });

    // First available layer is the ontology layer; its only eligible field
    // (ontology-select) is auto-selected. No value is picked.
    const addBtn = screen.getByTitle('Add condition');
    expect(addBtn).toBeEnabled();

    fireEvent.click(addBtn);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0];
    expect(updated.cond_fields).toHaveLength(1);
    expect(updated.cond_fields[0]).toMatchObject({
      layer: 'src_layer',
      field: 'ont',
      value: '',
    });
  });

  test('plain select keeps its empty-value behavior (parity check)', () => {
    const onUpdate = vi.fn();
    renderModal({
      sortedLayers: [selLayer, targetLayer],
      selectOptions: {
        colors: { options: [{ key: 'red', label: 'Red' }] },
      },
      onUpdate,
    });

    const addBtn = screen.getByTitle('Add condition');
    expect(addBtn).toBeEnabled();

    fireEvent.click(addBtn);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0].cond_fields[0]).toMatchObject({
      layer: 'sel_layer',
      field: 'color',
      value: '',
    });
  });

  test('text fields still require a non-empty value', () => {
    renderModal({
      sortedLayers: [
        {
          key: 'txt_layer',
          label: 'Text Layer',
          fields: [{ field: 'note', label: 'Note', type: FieldTypes.F_TEXT }],
        },
        targetLayer,
      ],
    });

    expect(screen.getByTitle('Add condition')).toBeDisabled();
  });
});
