import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

/**
 * PreviewNote Component
 * An alert that informs users about template default values.
 */
function PreviewNote() {
  const [open, setOpen] = useState(true);

  const toggle = () => {
    setOpen(!open);
  };

  return (
    <div className="d-flex flex-row align-items-stretch">
      <Button
        title="Important Note for Preview"
        variant="danger"
        size="sm"
        onClick={toggle}
        className={`d-flex align-items-center px-3 z-1 border-danger text-nowrap ${
          open ? 'rounded-start border-end-0' : 'rounded'
        }`}
      >
        <span className="me-2">{FIcons.faExclamationCircle}</span>
        <span className="me-2">Important</span>
        {open ? FIcons.faCaretLeft : FIcons.faCaretRight}
      </Button>

      {open && (
        <Alert
          variant="danger"
          className="mb-0 py-0 px-3 border-start-0 d-flex align-items-center rounded-0 rounded-end text-nowrap"
        >
          <span style={{ fontSize: '0.875rem' }}>
            Data entered here will be used as the default value of the template.
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={() => setOpen(false)}
            className="ms-2 p-0 border-0 text-danger text-decoration-none opacity-50"
            title="Close"
            aria-label="Close"
          >
            {FIcons.faTimes}
          </Button>
        </Alert>
      )}
    </div>
  );
}

export default PreviewNote;
