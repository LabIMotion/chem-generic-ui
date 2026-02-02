import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ContributeTemplateModal from '@components/designer/preview/ContributeTemplateModal';

// Mock the API module
jest.mock('@utils/api', () => ({
  execApiData: jest.fn(),
}));

describe('ContributeTemplateModal', () => {
  const mockSetShow = jest.fn();
  const mockShowProps = {
    show: true,
    setShow: mockSetShow,
  };

  const mockData = {
    uuid: 'test-uuid-456',
    version: '123',
  };

  beforeEach(() => {
    mockSetShow.mockClear();
    jest.clearAllMocks();
  });

  it('renders modal when show is true', () => {
    const { getByText } = render(
      <ContributeTemplateModal showProps={mockShowProps} data={mockData} />
    );

    expect(getByText('Contribute this template to Template Hub')).toBeInTheDocument();
    expect(getByText('Registered Name')).toBeInTheDocument();
    expect(getByText('Registered E-Mail')).toBeInTheDocument();
    expect(getByText('Contact E-Mail')).toBeInTheDocument();
    expect(getByText('Application')).toBeInTheDocument();
    expect(getByText('Leave a message')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    const hiddenShowProps = { ...mockShowProps, show: false };
    const { queryByText } = render(
      <ContributeTemplateModal showProps={hiddenShowProps} data={mockData} />
    );

    expect(queryByText('Contribute this template to Template Hub')).not.toBeInTheDocument();
  });

  it('displays template information', () => {
    const { getByText } = render(
      <ContributeTemplateModal showProps={mockShowProps} data={mockData} />
    );

    expect(getByText(/ID:/)).toBeInTheDocument();
    expect(getByText(/test-uuid-456/)).toBeInTheDocument();
    expect(getByText(/Version:/)).toBeInTheDocument();
    expect(getByText(/123/)).toBeInTheDocument();
  });

  it('shows validation error when required fields are empty', async () => {
    const { getByText, queryByText } = render(
      <ContributeTemplateModal showProps={mockShowProps} data={mockData} />
    );

    const submitButton = getByText('Submit to Template Hub');

    // Initially there should be no error message
    expect(queryByText(/All fields are required/)).not.toBeInTheDocument();

    // Click submit without filling fields
    fireEvent.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(getByText(/All fields are required/)).toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', () => {
    const { getByText } = render(
      <ContributeTemplateModal showProps={mockShowProps} data={mockData} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockSetShow).toHaveBeenCalledWith(false);
  });
});
