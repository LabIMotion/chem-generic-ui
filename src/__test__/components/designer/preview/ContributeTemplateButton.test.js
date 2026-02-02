import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ContributeTemplateButton from '@components/designer/preview/ContributeTemplateButton';

// Mock the fnToggle to bypass feature flags in tests
jest.mock('@ui/common/fnToggle', () => ({
  fnToggle: (Component) => Component,
}));

describe('ContributeTemplateButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <ContributeTemplateButton onClick={mockOnClick} />
    );

    expect(getByText('Contribute to Template Hub')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const { getByText } = render(
      <ContributeTemplateButton onClick={mockOnClick} />
    );

    const button = getByText('Contribute to Template Hub');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(
      <ContributeTemplateButton onClick={mockOnClick} disabled={true} />
    );

    const button = getByText('Contribute to Template Hub');
    expect(button).toBeDisabled();
  });

  it('is enabled when disabled prop is false', () => {
    const { getByText } = render(
      <ContributeTemplateButton onClick={mockOnClick} disabled={false} />
    );

    const button = getByText('Contribute to Template Hub');
    expect(button).not.toBeDisabled();
  });
});
