/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import ButtonDelField from '@components/fields/ButtonDelField';

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

    test('should show a popover when the button is clicked', async () => {
      const { getByTestId, getByText } = render(<ButtonDelField {...props} />);
      const button = getByTestId('confirm-btn');

      await interactWithOverlay(() => {
        fireEvent.click(button);
        fireEvent.focus(button);
      });

      await waitFor(() => {
        const popover = getByText(
          'Removing this option will remove it from restrictions, etc., if used. Continue with removing: option [option1] from select [select1] ?',
        );
        expect(popover).toBeInTheDocument();
      });
    });
  });

  describe('Confirm action', () => {
    test('should call fnConfirm when the "Yes" button is clicked', async () => {
      const { getByTestId } = render(<ButtonDelField {...props} />);
      const button = getByTestId('confirm-btn');

      await interactWithOverlay(() => {
        fireEvent.click(button);
        fireEvent.focus(button);
      });

      await waitFor(() => {
        expect(getByTestId('confirm-btn-yes')).toBeInTheDocument();
      });

      const yesButton = getByTestId('confirm-btn-yes');

      await interactWithOverlay(() => {
        fireEvent.click(yesButton);
      });

      expect(props.fnConfirm).toHaveBeenCalled();
    });
  });

  describe('Cancel action', () => {
    test('should not call fnConfirm', async () => {
      const { getByTestId } = render(<ButtonDelField {...props} />);
      const button = getByTestId('confirm-btn');

      await interactWithOverlay(() => {
        fireEvent.click(button);
        fireEvent.focus(button);
      });

      await waitFor(() => {
        expect(getByTestId('confirm-btn-no')).toBeInTheDocument();
      });

      const noButton = getByTestId('confirm-btn-no');

      await interactWithOverlay(() => {
        fireEvent.click(noButton);
      });

      expect(props.fnConfirm).not.toHaveBeenCalled();
    });
  });
});
