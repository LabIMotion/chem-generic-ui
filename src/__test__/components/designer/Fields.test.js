import { render, fireEvent } from '@testing-library/react';
import {
  renderDatetimeRange,
  renderDummyFieldGroup,
  renderTextFieldGroup,
} from '../../../components/elements/Fields';

describe('render Datetime Range field', () => {
  it('should render datetime range field', () => {
    const fieldObject = { type: 'datetime-range' };
    const { queryByText } = render(renderDatetimeRange({ fieldObject }));
    const datetimeRange = queryByText('Datetime Range:');
    expect(datetimeRange).toBeInTheDocument();
  });

  it('should not render datetime range field', () => {
    const fieldObject = { type: 'text' };
    const { queryByText } = render(renderDatetimeRange({ fieldObject }));
    const datetimeRange = queryByText('Datetime Range:');
    expect(datetimeRange).not.toBeInTheDocument();
  });
});

describe('render Dummy Field', () => {
  it('should render dummy field', () => {
    const layer = 'a';
    const fieldObject = { type: 'dummy' };
    const { queryByText } = render(
      renderDummyFieldGroup({ layer, fieldObject })
    );
    const dummy = queryByText('(dummy)');
    expect(dummy).toBeInTheDocument();
  });

  it('should not render dummy field', () => {
    const layer = 'a';
    const fieldObject = { type: 'text' };
    const { queryByText } = render(
      renderDummyFieldGroup({ layer, fieldObject })
    );
    const dummy = queryByText('(dummy)');
    expect(dummy).not.toBeInTheDocument();
  });
});

describe('render text field', () => {
  it('should render text field group', () => {
    const layer = { key: 'layer1' };
    const fieldObject = { type: 'text', field: 'field1', field1: 'value1' };
    const label = 'Field Label';
    const field = 'field1';
    const fnChange = jest.fn();
    const { getByText, getByRole } = render(
      renderTextFieldGroup({ layer, fieldObject, label, field, fnChange })
    );
    const labelElement = getByText('Field Label');
    const inputElement = getByRole('textbox');
    expect(labelElement).toBeInTheDocument();
    expect(inputElement).toHaveValue('value1');
    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(fnChange).toHaveBeenCalledWith(
      expect.any(Object),
      'value1',
      'field1',
      'layer1',
      'field1',
      'text'
    );
  });

  it('should not render text field', () => {
    const layer = { key: 'layer1' };
    const fieldObject = { type: 'dummy', field: 'field1', field1: 'value1' };
    const label = 'Field Label';
    const field = 'field1';
    const fnChange = jest.fn();
    const { queryByText } = render(
      renderTextFieldGroup({ layer, fieldObject, label, field, fnChange })
    );
    const labelElement = queryByText('Field Label');
    expect(labelElement).not.toBeInTheDocument();
  });
});
