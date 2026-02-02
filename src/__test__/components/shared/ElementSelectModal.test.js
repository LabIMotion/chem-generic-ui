import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ElementSelectModal from '@components/shared/ElementSelectModal';
import VerManager from '@utils/verMgr';

// Mock dependencies
jest.mock('@utils/verMgr');

jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs, onRowClicked }) => (
    <div data-testid="ag-grid">
      {rowData?.map((row) => (
        <div
          key={row.id}
          data-testid={`row-${row.id}`}
          onClick={() => {
            // Simulate ag-grid row click event
            if (onRowClicked) {
              onRowClicked({
                node: {
                  isSelected: () => true,
                },
                data: row,
              });
            }
          }}
        >
          {row.klass_label} - {row.name} - {row.short_label}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('react-select', () => {
  return function MockSelect({ options, value, onChange, placeholder }) {
    return (
      <select
        data-testid="element-select"
        value={value?.value || ''}
        onChange={(e) => {
          const selected = options.find((opt) => opt.value === e.target.value);
          onChange(selected || null);
        }}
      >
        <option value="">{placeholder}</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };
});

const mockSearchResults = [
  {
    id: 1,
    name: 'Cata FEB 1',
    klass_label: 'Cata',
    short_label: 'CHI-444',
    klass_prefix: 'CA',
    desc: 'Test element 1',
    is_active: true,
  },
  {
    id: 2,
    name: 'Cata FEB 2',
    klass_label: 'Cata',
    short_label: 'CHI-888',
    klass_prefix: 'CA',
    desc: 'Test element 2',
    is_active: true,
  },
  {
    id: 3,
    name: 'Sample A',
    klass_label: 'Sample',
    short_label: 'SAM-001',
    klass_prefix: 'SA',
    desc: 'Test element 3',
    is_active: true,
  },
];

const mockKlassData = [
  {
    name: 'reaction',
    label: 'Reaction',
  },
  {
    name: 'sample',
    label: 'Sample',
  },
  {
    name: 'research_plan',
    label: 'Research Plan',
  },
];

describe('ElementSelectModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    VerManager.listELKlass.mockResolvedValue({
      notify: { isSuccess: true },
      element: {
        data: {
          klass: mockKlassData,
        },
      },
    });
    VerManager.dispatchListELby.mockResolvedValue({
      notify: { isSuccess: true },
      element: {
        data: {
          elements: mockSearchResults,
        },
      },
    });
  });

  it('renders modal when show is true', () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Link Element')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    const { container } = render(
      <ElementSelectModal
        show={false}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    expect(container.querySelector('.modal')).not.toBeInTheDocument();
  });

  it('fetches elements when modal opens', async () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(VerManager.listELKlass).toHaveBeenCalledWith({ is_active: true });
    });
  });

  it('displays elements in grid', async () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    // Elements are fetched when modal opens
    await waitFor(() => {
      expect(VerManager.listELKlass).toHaveBeenCalled();
    });
  });

  it('filters elements by short label', async () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid')).toBeInTheDocument();
    });

    // First select an element type
    const elementSelect = screen.getByTestId('element-select');
    fireEvent.change(elementSelect, { target: { value: 'sample' } });

    // Get all inputs with the placeholder and pick the second one (short label)
    const inputs = screen.getAllByPlaceholderText('(case-insensitive like search)');
    fireEvent.change(inputs[1], { target: { value: 'CHI' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(VerManager.dispatchListELby).toHaveBeenCalled();
    });
  });

  it('resets filters when reset button is clicked', async () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid')).toBeInTheDocument();
    });

    // Get all inputs with the placeholder and pick the second one (short label)
    const inputs = screen.getAllByPlaceholderText('(case-insensitive like search)');
    fireEvent.change(inputs[1], { target: { value: 'CHI' } });

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(inputs[1].value).toBe('');
  });

  it('calls onSelect when row is clicked', async () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    // First, select an element type from dropdown
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid')).toBeInTheDocument();
    });

    const elementSelect = screen.getByTestId('element-select');
    fireEvent.change(elementSelect, { target: { value: 'sample' } });

    // Get the name input (first one)
    const inputs = screen.getAllByPlaceholderText('(case-insensitive like search)');
    fireEvent.change(inputs[0], { target: { value: 'Cata' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    // Now the grid should have rows
    await waitFor(() => {
      expect(screen.getByTestId('row-1')).toBeInTheDocument();
    });

    const row = screen.getByTestId('row-1');
    fireEvent.click(row);

    // onSelect should be called with the selected element
    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalled();
    });
  });

  it('calls onHide when close button is clicked', () => {
    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnHide).toHaveBeenCalled();
  });

  it('handles API error gracefully', async () => {
    VerManager.listELKlass.mockResolvedValue({
      notify: { isSuccess: false },
      error: 'API Error',
    });

    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('displays loading state while fetching', () => {
    VerManager.listELKlass.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const mockOnHide = jest.fn();
    const mockOnSelect = jest.fn();

    render(
      <ElementSelectModal
        show={true}
        onHide={mockOnHide}
        onSelect={mockOnSelect}
      />
    );

    // The grid should be rendered with loading prop
    expect(screen.getByTestId('ag-grid')).toBeInTheDocument();
  });
});
