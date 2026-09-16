import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  AnalysesEditorModal,
  DeleteRowModal,
  HideColumnWarningModal,
  ImportConfirmModal,
  NotesEditorModal,
  RemoveAllModal,
} from '@components/variations/ElVarModals';

const noop = () => {};

const renderAnalysesEditor = (analyses = []) =>
  render(
    <AnalysesEditorModal
      show
      analyses={analyses}
      selectedIds={[]}
      onSave={noop}
      onCancel={noop}
    />,
  );

const factories = [
  [
    'RemoveAllModal',
    () => render(<RemoveAllModal show onConfirm={noop} onCancel={noop} />),
  ],
  [
    'ImportConfirmModal',
    () =>
      render(
        <ImportConfirmModal
          show
          fileName="a.xlsx"
          onConfirm={noop}
          onCancel={noop}
        />,
      ),
  ],
  [
    'DeleteRowModal',
    () =>
      render(
        <DeleteRowModal show rowName="V1" onConfirm={noop} onCancel={noop} />,
      ),
  ],
  [
    'NotesEditorModal',
    () => render(<NotesEditorModal show onSave={noop} onCancel={noop} />),
  ],
  ['AnalysesEditorModal', () => renderAnalysesEditor()],
  [
    'HideColumnWarningModal',
    () =>
      render(
        <HideColumnWarningModal
          show
          columnLabel="Mass"
          onConfirm={noop}
          onCancel={noop}
        />,
      ),
  ],
];

describe('GenericElementVariations modals', () => {
  // The `gu-modal` marker carries our footer spacing and left alignment, so both
  // survive a host app that reconfigures Bootstrap's modal variables globally.
  // These modals came from the ELN, where they leaned on the host-private
  // `app-modal` class instead; the library cannot depend on that.
  it.each(factories)(
    '%s marks its root with gu-modal, not app-modal',
    (_name, mount) => {
      mount();

      const modalRoot = document.querySelector('.modal');
      expect(modalRoot).toHaveClass('gu-modal');
      expect(modalRoot).not.toHaveClass('app-modal');
    },
  );

  it('leaves footer alignment to gu-modal rather than a per-modal utility', () => {
    render(<RemoveAllModal show onConfirm={noop} onCancel={noop} />);

    const footer = document.querySelector('.modal-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).not.toHaveClass('justify-content-start');
  });

  // `app-modal` used to cap the body height; dropping it must not let a long
  // analyses list push the footer off screen.
  it('caps the analyses list height so a long list scrolls inside the modal', () => {
    renderAnalysesEditor([{ id: 1, name: 'IR' }]);

    const body = document.querySelector('.modal-body');
    expect(body).toHaveStyle({ maxHeight: '70vh', overflowY: 'auto' });
    expect(screen.getByText('IR')).toBeInTheDocument();
  });
});
