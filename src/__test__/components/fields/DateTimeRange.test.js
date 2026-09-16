import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DateTimeRange from '@components/fields/DateTimeRange';

const subField = (name, extra = {}) => ({
  id: name,
  type: 'text',
  value: '',
  col_name: name,
  ...extra,
});

const renderRange = ({ start = '', stop = '', duration = {} } = {}) => {
  const subFields = [
    subField('timeStart', { value: start }),
    subField('timeStop', { value: stop }),
    subField('durationCalc'),
    subField('duration', {
      option_layers: 'duration',
      value_system: 'd',
      ...duration,
    }),
  ];
  const { container } = render(
    <DateTimeRange
      layer={{ key: 'layer_a' }}
      opt={{
        f_obj: {
          field: 'range',
          type: 'datetime-range',
          sub_fields: subFields,
        },
      }}
      onInputChange={vi.fn()}
      editMode
    />,
  );
  return { subFields, container };
};

const durationSub = (subFields) =>
  subFields.find((f) => f.col_name === 'duration');
const copyToButton = (container) =>
  container.querySelector('button.clipboardBtn');
const unitButton = (container) => container.querySelector('button.btn-success');

describe('DateTimeRange duration units', () => {
  it('labels the year unit', () => {
    renderRange({ duration: { value_system: 'y', value: 2 } });
    expect(screen.getByText('year(s)')).toBeInTheDocument();
  });

  it('cycles from seconds to years and converts the value', () => {
    const { subFields, container } = renderRange({
      duration: { value_system: 's', value: 86400 },
    });
    fireEvent.click(unitButton(container));
    expect(durationSub(subFields).value_system).toBe('y');
    expect(durationSub(subFields).value).toBeCloseTo(1 / 365.25, 5);
  });

  it('cycles from years back to days', () => {
    const { subFields, container } = renderRange({
      duration: { value_system: 'y', value: 2 },
    });
    fireEvent.click(unitButton(container));
    expect(durationSub(subFields).value_system).toBe('d');
    expect(durationSub(subFields).value).toBeCloseTo(730.5, 1);
  });

  it.each([
    ['01-01-2020 00:00:00', '01-01-2023 00:00:00', 'y', 3],
    ['01-01-2020 00:00:00', '03-01-2020 00:00:00', 'd', 2],
    ['01-01-2020 00:00:00', '01-01-2020 05:00:00', 'h', 5],
    ['01-01-2020 00:00:00', '01-01-2020 00:30:00', 'min', 30],
    ['01-01-2020 00:00:00', '01-01-2020 00:00:20', 's', 20],
  ])('copies %s → %s as %s', (start, stop, unit, value) => {
    const { subFields, container } = renderRange({ start, stop });
    fireEvent.click(copyToButton(container));
    expect(durationSub(subFields).value_system).toBe(unit);
    expect(durationSub(subFields).value).toBeCloseTo(value, 1);
  });

  it('renders an empty label for a unit the core does not know', () => {
    const { container } = renderRange({
      duration: { value_system: 'not_a_unit', value: 1 },
    });
    expect(unitButton(container)).toHaveTextContent('');
  });
});
