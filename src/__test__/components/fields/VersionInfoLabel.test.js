import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VersionInfoLabel from '@components/fields/VersionInfoLabel';

describe('VersionInfoLabel', () => {
  it('renders a button showing the version only', () => {
    render(<VersionInfoLabel version="1.2.3" identifier="abcdef1234567890" />);
    expect(screen.getByRole('button', { name: 'v1.2.3' })).toBeInTheDocument();
    // identifier is not shown until the modal is opened
    expect(screen.queryByText('abcdef1234567890')).not.toBeInTheDocument();
  });

  it('opens a modal with version and identifier on click', () => {
    render(<VersionInfoLabel version="1.0.0" identifier="abc123" />);
    fireEvent.click(screen.getByRole('button', { name: 'v1.0.0' }));
    expect(screen.getByText('Template Info')).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  it('copies the identifier to the clipboard', async () => {
    const writeText = vi.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    render(<VersionInfoLabel version="1.0.0" identifier="abc123" />);
    fireEvent.click(screen.getByRole('button', { name: 'v1.0.0' }));
    const copyBtn = screen
      .getByText('abc123')
      .parentElement.querySelector('button');
    fireEvent.click(copyBtn);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('abc123'));
  });

  it('renders an info trigger when version is missing but identifier exists', () => {
    render(<VersionInfoLabel identifier="abc123" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('returns null when both version and identifier are missing', () => {
    const { container } = render(<VersionInfoLabel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('passes through custom className to the trigger button', () => {
    render(
      <VersionInfoLabel version="1.0.0" identifier="x" className="ms-auto" />,
    );
    expect(screen.getByRole('button', { name: 'v1.0.0' })).toHaveClass(
      'ms-auto',
    );
  });
});
