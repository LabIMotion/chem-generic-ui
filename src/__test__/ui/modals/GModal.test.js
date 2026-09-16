import React from 'react';
import { render, screen } from '@testing-library/react';
import GModal from '@ui/modals/GModal';

describe('GModal', () => {
  // The two things every dialog in this library used to repeat by hand.
  it('marks the root gu-modal and centers the dialog', () => {
    render(
      <GModal show onHide={() => {}}>
        <GModal.Body>body</GModal.Body>
      </GModal>,
    );

    expect(document.querySelector('.modal')).toHaveClass('gu-modal');
    expect(document.querySelector('.modal-dialog')).toHaveClass(
      'modal-dialog-centered',
    );
  });

  // Centering is a prop rather than a stylesheet rule precisely so this works.
  it('lets a dialog opt out of centering', () => {
    render(
      <GModal show centered={false} onHide={() => {}}>
        <GModal.Body>body</GModal.Body>
      </GModal>,
    );

    expect(document.querySelector('.modal-dialog')).not.toHaveClass(
      'modal-dialog-centered',
    );
  });

  it('keeps gu-modal when the caller passes its own class', () => {
    render(
      <GModal show className="element-select-modal" onHide={() => {}}>
        <GModal.Body>body</GModal.Body>
      </GModal>,
    );

    const root = document.querySelector('.modal');
    expect(root).toHaveClass('gu-modal');
    expect(root).toHaveClass('element-select-modal');
  });

  // Every header in the library asked for the dismiss button, so it is the
  // default rather than a prop repeated 39 times.
  it('gives the header a close button by default', () => {
    render(
      <GModal show onHide={() => {}}>
        <GModal.Header>
          <GModal.Title>Title</GModal.Title>
        </GModal.Header>
      </GModal>,
    );

    expect(
      document.querySelector('.modal-header .btn-close'),
    ).toBeInTheDocument();
  });

  it('lets a header opt out of the close button', () => {
    render(
      <GModal show onHide={() => {}}>
        <GModal.Header closeButton={false}>
          <GModal.Title>Title</GModal.Title>
        </GModal.Header>
      </GModal>,
    );

    expect(document.querySelector('.modal-header .btn-close')).toBeNull();
  });

  it('keeps a class the header passes itself', () => {
    render(
      <GModal show onHide={() => {}}>
        <GModal.Header className="py-2">
          <GModal.Title>Title</GModal.Title>
        </GModal.Header>
      </GModal>,
    );

    const header = document.querySelector('.modal-header');
    expect(header).toHaveClass('py-2');
    expect(header.querySelector('.btn-close')).toBeInTheDocument();
  });

  it('forwards the remaining props and renders the subcomponents', () => {
    render(
      <GModal show size="lg" onHide={() => {}}>
        <GModal.Header>
          <GModal.Title>Title</GModal.Title>
        </GModal.Header>
        <GModal.Body>body</GModal.Body>
        <GModal.Footer>footer</GModal.Footer>
      </GModal>,
    );

    expect(document.querySelector('.modal-dialog')).toHaveClass('modal-lg');
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(document.querySelector('.modal-footer')).toHaveTextContent('footer');
  });
});
