/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import RemovePropBtn from '@components/designer/template/RemovePropBtn';

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

  // Helper function to handle overlay interactions with proper act wrapping
  const interactWithOverlay = async (callback) => {
    await act(async () => {
      callback();
      // Allow React to process the event
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    // Wait for any async overlay updates (popper positioning, etc.)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  };

  beforeEach(() => {
    mockFn.mockClear();
  });

  afterEach(async () => {
    // Ensure all pending updates are flushed after each test
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  });

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

    test('should show a popover when the button is clicked', async () => {
      const { getByTestId, getByText } = render(<RemovePropBtn {...props} />);
      const button = getByTestId('template-remove-btn');

      await interactWithOverlay(() => {
        fireEvent.focus(button);
      });

      await waitFor(() => {
        const popover = getByText(
          'remove this option: [option1] from select [select1] ?'
        );
        expect(popover).toBeInTheDocument();
      });
    });
  });

  describe('Confirm action', () => {
    test('should call fnDelete when the "Yes" button is clicked', async () => {
      const { getByTestId } = render(<RemovePropBtn {...props} />);
      const button = getByTestId('template-remove-btn');

      await interactWithOverlay(() => {
        fireEvent.focus(button);
      });

      await waitFor(() => {
        expect(getByTestId('template-remove-yes-btn')).toBeInTheDocument();
      });

      const yesButton = getByTestId('template-remove-yes-btn');

      await interactWithOverlay(() => {
        fireEvent.click(yesButton);
      });

      expect(props.fnDelete).toHaveBeenCalled();
    });
  });

  describe('Cancel action', () => {
    test('should not call fnDelete', async () => {
      const { getByTestId } = render(<RemovePropBtn {...props} />);
      const button = getByTestId('template-remove-btn');

      await interactWithOverlay(() => {
        fireEvent.focus(button);
      });

      await waitFor(() => {
        expect(getByTestId('template-remove-no-btn')).toBeInTheDocument();
      });

      const noButton = getByTestId('template-remove-no-btn');

      await interactWithOverlay(() => {
        fireEvent.click(noButton);
      });

      expect(props.fnDelete).not.toHaveBeenCalled();
    });
  });
});
