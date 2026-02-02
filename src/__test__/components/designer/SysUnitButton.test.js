import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { genUnits, genUnit, unitConversion } from 'generic-ui-core';
import SysUnitButton from '@ui/common/SysUnitButton';
import { genUnitSup } from '@components/tools/utils';
import TAs from '@components/tools/TAs';

jest.mock('generic-ui-core', () => ({
  genUnits: jest.fn(),
  genUnit: jest.fn(),
  unitConversion: jest.fn(),
  FieldTypes: {
    F_SYSTEM_DEFINED: 'mock_F_SYSTEM_DEFINED_VALUE'
  }
}));

jest.mock('@components/tools/utils', () => ({
  genUnitSup: jest.fn()
}));

describe('SysUnitButton', () => {
  const originalConsoleError = console.error;

  // Helper function to handle interactions that might trigger overlays
  const interactWithButton = async (callback) => {
    await act(async () => {
      callback();
      // Allow React to process the event
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    // Wait for any async overlay updates that might be triggered indirectly
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  };

  beforeEach(() => {
    console.error = jest.fn();

    genUnits.mockReturnValue([
      { key: 'mm', label: 'mm' },
      { key: 'cm', label: 'cm' },
      { key: 'm', label: 'm' }
    ]);

    genUnit.mockReturnValue({ label: 'mm', unit_type: null });
    unitConversion.mockReturnValue(10);
    genUnitSup.mockImplementation(label => label);
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
    // Ensure all pending updates are flushed after each test
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  });

  const validGeneric = {
    type: 'system-defined',
    measurable_quantity: 'distance',
    unit: 'mm',
    values: [5]
  };

  describe('Rendering', () => {
    test('should render a button with the correct unit label', () => {
      render(<SysUnitButton generic={validGeneric} />);

      expect(genUnit).toHaveBeenCalledWith('distance', 'mm');
      expect(genUnitSup).toHaveBeenCalledWith('mm');
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('mm');
    });

    test('should apply the provided variant and size props', () => {
      render(<SysUnitButton
        generic={validGeneric}
        variant="primary"
        size="lg"
      />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
      expect(button).toHaveClass('btn-lg');
    });

    test('should use default props when not provided', () => {
      render(<SysUnitButton generic={validGeneric} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-success');
      expect(button).toHaveClass('btn-sm');
    });

    test('should set title attribute when unit_type exists', () => {
      genUnit.mockReturnValue({ label: 'mm', unit_type: 'length' });

      render(<SysUnitButton generic={validGeneric} />);

      expect(screen.getByRole('button')).toHaveAttribute('title', TAs.no_unit_conversion);
    });

    test('should not set title attribute when unit_type is null', () => {
      genUnit.mockReturnValue({ label: 'mm', unit_type: null });

      render(<SysUnitButton generic={validGeneric} />);

      expect(screen.getByRole('button')).not.toHaveAttribute('title');
    });
  });

  describe('Error handling', () => {
    test('should return null when generic is null', () => {
      const { container } = render(<SysUnitButton generic={null} />);

      expect(console.error).toHaveBeenCalledWith('Error: input object is undefined or null!');
      expect(container).toBeEmptyDOMElement();
    });

    test('should return null when generic fails validation (e.g., missing required field)', () => {
      const invalidGeneric = {
        type: 'mock_F_SYSTEM_DEFINED_VALUE',
        unit: 'mm',
        values: [5]
      };
      const { container } = render(<SysUnitButton generic={invalidGeneric} />);

      expect(console.error).toHaveBeenCalledWith('Invalid generic object:', expect.any(Array));
      expect(container).toBeEmptyDOMElement();
    });

    test('should return null when units array is empty', () => {
      genUnits.mockReturnValue([]);

      const { container } = render(<SysUnitButton generic={validGeneric} />);

      expect(console.error).toHaveBeenCalledWith('Error: distance is not in the list of supported units!');
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Button interactions', () => {
    test('should cycle to the next unit when clicked', async () => {
      const mockFnCb = jest.fn();

      render(<SysUnitButton generic={validGeneric} fnCb={mockFnCb} />);

      await interactWithButton(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      await waitFor(() => {
        expect(unitConversion).toHaveBeenCalledWith('distance', 'cm', 5);
        expect(mockFnCb).toHaveBeenCalledWith({
          ...validGeneric,
          unit: 'cm',
          values: [10]
        });
      });
    });

    test('should cycle back to the first unit when at the end of units array', async () => {
      const mockFnCb = jest.fn();
      const genericAtEnd = {
        type: 'system-defined',
        measurable_quantity: 'distance',
        unit: 'm',
        values: [5]
      };

      render(<SysUnitButton generic={genericAtEnd} fnCb={mockFnCb} />);

      await interactWithButton(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      await waitFor(() => {
        expect(unitConversion).toHaveBeenCalledWith('distance', 'mm', 5);
        expect(mockFnCb).toHaveBeenCalledWith({
          ...genericAtEnd,
          unit: 'mm',
          values: [10]
        });
      });
    });

    test('should handle errors during unit conversion', async () => {
      const mockFnCb = jest.fn();
      unitConversion.mockImplementation(() => {
        throw new Error('Conversion error');
      });

      render(<SysUnitButton generic={validGeneric} fnCb={mockFnCb} />);

      await interactWithButton(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(console.error).toHaveBeenCalledWith('Error changing unit:', expect.any(Error));
      expect(mockFnCb).toHaveBeenCalledWith(validGeneric);
    });
  });
});
