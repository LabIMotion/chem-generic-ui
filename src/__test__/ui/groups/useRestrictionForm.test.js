import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { FieldTypes } from 'generic-ui-core';
import useRestrictionForm from '@ui/groups/useRestrictionForm';

// Tiny harness: @testing-library/react v12 has no renderHook, so render a
// component that drives the hook and exposes its state as JSON.
function Harness({ availableLayers, onUpdateRestriction }) {
  const { conditions, handleRestrictionClick, handleAddCondition } =
    useRestrictionForm({
      entityKey: 'tgt_layer',
      restriction: null,
      availableLayers,
      onUpdateRestriction,
      idSuffix: 'lc',
      filterCurrentLayer: true,
    });

  return (
    <div>
      <button type="button" onClick={handleRestrictionClick}>
        open
      </button>
      <button type="button" onClick={() => handleAddCondition()}>
        add
      </button>
      <div data-testid="conditions">{JSON.stringify(conditions)}</div>
    </div>
  );
}

const readConditions = () =>
  JSON.parse(screen.getByTestId('conditions').textContent);

const layersWith = (type) => [
  {
    key: 'src_layer',
    label: 'Source Layer',
    fields: [{ field: 'dep', label: 'Dep', type }],
  },
  { key: 'tgt_layer', label: 'Target Layer', fields: [] },
];

describe('useRestrictionForm — empty-value conditions', () => {
  test('adds an ontology-select condition with an empty value', () => {
    const onUpdateRestriction = vi.fn();
    render(
      <Harness
        availableLayers={layersWith(FieldTypes.F_ONTOLOGY_SELECT)}
        onUpdateRestriction={onUpdateRestriction}
      />,
    );

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('add'));

    expect(readConditions()).toHaveLength(1);
    expect(readConditions()[0]).toMatchObject({
      layer: 'src_layer',
      field: 'dep',
      value: '',
    });
    expect(onUpdateRestriction).toHaveBeenCalledWith('tgt_layer', {
      op: 1,
      cond: [expect.objectContaining({ value: '' })],
    });
  });

  test('still refuses an empty value for text fields', () => {
    const onUpdateRestriction = vi.fn();
    render(
      <Harness
        availableLayers={layersWith(FieldTypes.F_TEXT)}
        onUpdateRestriction={onUpdateRestriction}
      />,
    );

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('add'));

    expect(readConditions()).toHaveLength(0);
    expect(onUpdateRestriction).not.toHaveBeenCalled();
  });
});
