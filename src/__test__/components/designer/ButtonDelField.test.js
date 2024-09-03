/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ButtonDelField from '../../../components/fields/ButtonDelField';

describe('ButtonDelField', () => {
  const mockFn = jest.fn();
  const props = {
    delType: 'Option',
    delKey: 'option1',
    delRoot: 'select1',
    generic: {
      properties_template: {
        select_options: { select1: ['option1', 'option2'] },
      },
    },
    fnConfirm: mockFn,
  };

  describe('Rendering', () => {
    test('should not render the button if delType is not allowed', () => {
      const { queryByTestId } = render(
        <ButtonDelField {...props} delType="DEL_NOT_ALLOWED" />
      );
      const button = queryByTestId('confirm-btn');
      expect(button).not.toBeInTheDocument();
    });

    test('should render a button', () => {
      const { getByTestId } = render(<ButtonDelField {...props} />);
      const button = getByTestId('confirm-btn');
      expect(button).toBeInTheDocument();
    });

    test('should show a popover when the button is clicked', () => {
      const { getByTestId, getByText } = render(<ButtonDelField {...props} />);
      let button = getByTestId('confirm-btn');
      fireEvent.click(button);
      button = getByTestId('confirm-btn');
      fireEvent.focus(button);
      const popover = getByText(
        'remove this option: [option1] from select [select1] ?'
      );
      expect(popover).toBeInTheDocument();
    });
  });

  describe('Confirm action', () => {
    test('should call fnConfirm when the "Yes" button is clicked', () => {
      const { getByTestId } = render(<ButtonDelField {...props} />);
      let button = getByTestId('confirm-btn');
      fireEvent.click(button);
      button = getByTestId('confirm-btn');
      fireEvent.focus(button);
      const yesButton = getByTestId('confirm-btn-yes');
      fireEvent.click(yesButton);
      expect(props.fnConfirm).toHaveBeenCalled();
    });
  });

  describe('Cancel action', () => {
    test('should not call fnConfirm', () => {
      const { getByTestId } = render(<ButtonDelField {...props} />);
      let button = getByTestId('confirm-btn');
      fireEvent.click(button);
      button = getByTestId('confirm-btn');
      fireEvent.focus(button);
      const noButton = getByTestId('confirm-btn-no');
      fireEvent.click(noButton);
      expect(jest.fn()).not.toHaveBeenCalled();
    });
  });
});
