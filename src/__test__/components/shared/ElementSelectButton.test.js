import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ElementSelectButton from '@components/shared/ElementSelectButton';

// Mock the modal component
jest.mock('@components/shared/ElementSelectModal', () => {
  return function MockElementSelectModal({ show, onSelect, onHide }) {
    if (!show) return null;
    return (
      <div data-testid="element-select-modal">
        <button
          onClick={() => {
            onSelect({ id: 1, name: 'TestElement', label: 'Test Element' });
          }}
        >
          Select Test Element
        </button>
        <button onClick={onHide}>Close</button>
      </div>
    );
  };
});

describe('ElementSelectButton', () => {
  it('renders with default label', () => {
    const mockOnSelect = jest.fn();
    render(<ElementSelectButton onSelect={mockOnSelect} />);

    expect(screen.getByText('Link Element')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    const mockOnSelect = jest.fn();
    render(<ElementSelectButton onSelect={mockOnSelect} label="Choose Element" />);

    expect(screen.getByText('Choose Element')).toBeInTheDocument();
  });

  it('opens modal when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<ElementSelectButton onSelect={mockOnSelect} />);

    const button = screen.getByText('Link Element');
    fireEvent.click(button);

    expect(screen.getByTestId('element-select-modal')).toBeInTheDocument();
  });

  it('calls onSelect when element is selected', async () => {
    const mockOnSelect = jest.fn();
    render(<ElementSelectButton onSelect={mockOnSelect} />);

    // Open modal
    const button = screen.getByText('Link Element');
    fireEvent.click(button);

    // Link element
    const selectButton = screen.getByText('Select Test Element');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith({
        id: 1,
        name: 'TestElement',
        label: 'Test Element',
      });
    });
  });

  it('applies custom variant and size', () => {
    const mockOnSelect = jest.fn();
    render(
      <ElementSelectButton
        onSelect={mockOnSelect}
        variant="secondary"
        size="sm"
      />
    );

    const button = screen.getByText('Link Element');
    expect(button).toHaveClass('btn-secondary');
    expect(button).toHaveClass('btn-sm');
  });

  it('can be disabled', () => {
    const mockOnSelect = jest.fn();
    render(<ElementSelectButton onSelect={mockOnSelect} disabled />);

    const button = screen.getByText('Link Element');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    const mockOnSelect = jest.fn();
    render(
      <ElementSelectButton
        onSelect={mockOnSelect}
        className="custom-class"
      />
    );

    const button = screen.getByText('Link Element');
    expect(button).toHaveClass('custom-class');
  });
});
