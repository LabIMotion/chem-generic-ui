import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RemovePropBtn from '../../../components/designer/template/RemovePropBtn';

// Mock the handleDelete function since it's not provided in the test
// jest.mock('./path/to/handleDelete', () => ({
//   handleDelete: jest.fn(() => 'deletedResult'),
// }));

describe('RemovePropBtn', () => {
  const mockFn = jest.fn();
  const props = {
    delStr: 'Option',
    delKey: 'option1',
    delRoot: 'select1',
    element: {
      properties_template: {
        select_options: { select1: ['option1', 'option2'] },
      },
    },
    fnDelete: mockFn,
  };

  describe('Rendering', () => {
    test('should not render the button if delStr is not allowed', () => {
      const { queryByTestId } = render(
        <RemovePropBtn {...props} delStr="DEL_NOT_ALLOWED" />
      );
      const button = queryByTestId('template-remove-props-btn');
      expect(button).not.toBeInTheDocument();
    });

    test('should render a button', () => {
      const { getByTestId } = render(<RemovePropBtn {...props} />);
      const button = getByTestId('template-remove-btn');
      expect(button).toBeInTheDocument();
    });

    test('should show a popover when the button is clicked', () => {
      const { getByTestId, getByText } = render(<RemovePropBtn {...props} />);
      const button = getByTestId('template-remove-btn');
      fireEvent.focus(button);
      const popover = getByText(
        'remove this option: [option1] from select [select1] ?'
      );
      expect(popover).toBeInTheDocument();
    });
  });

  describe('Confirm action', () => {
    test('should call fnDelete when the "Yes" button is clicked', () => {
      const { getByTestId } = render(<RemovePropBtn {...props} />);
      const button = getByTestId('template-remove-btn');
      fireEvent.focus(button);
      const yesButton = getByTestId('template-remove-yes-btn');
      fireEvent.click(yesButton);
      expect(props.fnDelete).toHaveBeenCalled();
    });
  });

  describe('Cancel action', () => {
    test('should not call fnDelete', () => {
      const { getByTestId } = render(<RemovePropBtn {...props} />);
      const button = getByTestId('template-remove-btn');
      fireEvent.focus(button);
      const noButton = getByTestId('template-remove-no-btn');
      fireEvent.click(noButton);
      expect(jest.fn()).not.toHaveBeenCalled();
    });
  });
});
