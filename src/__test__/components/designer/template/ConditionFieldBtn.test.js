import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConditionFieldBtn from '@components/designer/template/ConditionFieldBtn';
import { DesignerProvider } from '@components/designer/DesignerContext';

const layer = {
  key: 'layer_a',
  label: 'Layer A',
  fields: [{ field: 'f1', label: 'F1', type: 'text' }],
};

const renderBtn = () =>
  render(
    <DesignerProvider value={{ klasses: [], genericType: 'Element' }}>
      <ConditionFieldBtn
        field={layer.fields[0]}
        fnUpdateSub={() => {}}
        layer={layer}
        sortedLayers={[layer]}
        as="button"
      />
    </DesignerProvider>,
  );

describe('ConditionFieldBtn', () => {
  it('does not mount the restriction modal until the button is clicked', () => {
    renderBtn();
    expect(
      screen.queryByText(/Field Restriction Setting/),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/Field Restriction Setting/)).toBeInTheDocument();
  });
});
