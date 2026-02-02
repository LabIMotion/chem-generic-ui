import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

/**
 * PreviewNote Component
 * An alert that informs users about template default values.
 */
const PreviewNote = () => {
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
          <span
            onClick={() => setOpen(false)}
            style={{ cursor: 'pointer', opacity: 0.6 }}
            className="ms-2 opacity-50"
            title="Close"
          >
            {FIcons.faTimes}
          </span>
        </Alert>
      )}
    </div>
  );
};

export default PreviewNote;
