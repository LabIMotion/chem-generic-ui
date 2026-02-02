import React, { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

/**
 * A collapsible notice button that displays important warnings
 * about layer grouping and restriction behavior
 */
function NoticeBtn() {
  const [showNotice, setShowNotice] = useState(true);

  const toggleNotice = () => {
    setShowNotice(!showNotice);
  };

  return (
    <div className="d-flex flex-column align-items-start w-100">
      <Button
        variant="danger"
        size="xsm"
        onClick={toggleNotice}
        className="mb-0"
      >
        <span className="me-2">{FIcons.faExclamationCircle}</span>
        Important Note
        <span className={`fa fa-chevron-${showNotice ? 'up' : 'down'} ms-2`} />
      </Button>
      {showNotice && (
        <Alert
          variant="danger"
          className="mt-2 mb-0 w-100"
          onClose={() => setShowNotice(false)}
          dismissible
        >
          <div className="small">
            <p className="mb-2">
              <span className="me-2">{FIcons.faExclamationCircle}</span>
              <strong>Important — Layer Grouping Effects</strong>
            </p>
            <p className="mb-0 text-muted">
              Assigning or removing a layer from a group automatically removes
              its restrictions and any restrictions that reference it, ensuring
              consistent restriction logic.
            </p>
          </div>
        </Alert>
      )}
    </div>
  );
}

export default NoticeBtn;
