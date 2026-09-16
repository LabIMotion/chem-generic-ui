import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldTypes } from 'generic-ui-core';
import FieldActionsBtn from '@components/designer/FieldActionsBtn';

const field = { field: 'f1', type: 'text', label: 'Field One' };

// A fresh object per render: handleDelete mutates it in place, and reusing
// one across tests would let the delete test corrupt later assertions.
const makeGeneric = (f) => ({
  properties_template: {
    layers: { general: { key: 'general', fields: [f] } },
  },
});

const renderBtn = (over = {}) => {
  const onDummyAdd = vi.fn();
  const onDelete = vi.fn();
  const activeField = over.field || field;
  const generic = over.generic || makeGeneric(activeField);
  const utils = render(
    <FieldActionsBtn
      field={activeField}
      layerKey="general"
      generic={generic}
      onDummyAdd={onDummyAdd}
      onDelete={onDelete}
      {...over.props}
    />,
  );
  return { ...utils, onDummyAdd, onDelete, generic };
};

const open = async () => {
  await userEvent.click(
    screen.getByRole('button', { name: 'More field actions' }),
  );
};

describe('FieldActionsBtn', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the trigger and opens the modal', async () => {
    renderBtn();
    await open();

    expect(screen.getByText('Field actions')).toBeInTheDocument();
    expect(screen.getByText('Add dummy field')).toBeInTheDocument();
  });

  it('falls back to the field key when there is no label', async () => {
    renderBtn({ field: { field: 'f2', type: 'text', label: '' } });
    await open();

    expect(screen.getByTitle('f2')).toBeInTheDocument();
  });

  it('falls back to "dummy field" for an unlabeled dummy field', async () => {
    renderBtn({ field: { field: 'f3', type: FieldTypes.F_DUMMY, label: '' } });
    await open();

    expect(screen.getByTitle('dummy field')).toBeInTheDocument();
  });

  it('calls onDummyAdd with the layer and field key, then closes', async () => {
    const { onDummyAdd } = renderBtn();
    await open();
    await userEvent.click(screen.getByText('Add dummy field'));

    expect(onDummyAdd).toHaveBeenCalledWith({
      layerKey: 'general',
      field: 'f1',
    });
    expect(screen.queryByText('Field actions')).not.toBeInTheDocument();
  });

  it('keeps delete disabled until the confirm checkbox is checked', async () => {
    renderBtn();
    await open();

    const deleteBtn = screen.getByRole('button', { name: /delete field/i });
    expect(deleteBtn).toBeDisabled();

    await userEvent.click(
      screen.getByLabelText('I understand, delete this field'),
    );
    expect(deleteBtn).toBeEnabled();
  });

  it('calls onDelete with the updated element and closes', async () => {
    const { onDelete } = renderBtn();
    await open();
    await userEvent.click(
      screen.getByLabelText('I understand, delete this field'),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /delete field/i }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    const result = onDelete.mock.calls[0][0];
    expect(result.notify.isSuccess).toBe(true);
    expect(
      result.element.properties_template.layers.general.fields,
    ).toHaveLength(0);
    expect(screen.queryByText('Field actions')).not.toBeInTheDocument();
  });
});
