import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import GModal from '@ui/modals/GModal';

function VersionInfoLabel({ version, identifier, className }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!version && !identifier) return null;

  const ver = version ? `v${version}` : '';

  const handleCopy = () => {
    if (!identifier) return;
    navigator.clipboard.writeText(identifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Button
        variant="link"
        size="sm"
        onClick={() => setShow(true)}
        className={`d-inline-flex align-items-center gap-1 small text-decoration-none p-0 ${className}`}
      >
        {ver ? (
          <span className="fw-bold">{ver}</span>
        ) : (
          <span className="text-muted">{FIcons.faCircleInfo}</span>
        )}
      </Button>
      <GModal show={show} onHide={() => setShow(false)} backdrop="static">
        <GModal.Header>
          <GModal.Title className="fs-6">Template Info</GModal.Title>
        </GModal.Header>
        <GModal.Body className="d-flex flex-column gap-2 small">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold">Version:</span>
            <span>{ver || 'N/A'}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold">ID:</span>
            <span className="font-monospace text-break">
              {identifier || 'N/A'}
            </span>
            {identifier && (
              <LTooltip idf={copied ? 'clipboard_copied' : 'clipboard'}>
                <Button
                  variant="light"
                  size="sm"
                  className="py-0 px-1 ms-auto"
                  onClick={handleCopy}
                >
                  {FIcons.faPaste}
                </Button>
              </LTooltip>
            )}
          </div>
        </GModal.Body>
      </GModal>
    </>
  );
}

VersionInfoLabel.propTypes = {
  version: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  identifier: PropTypes.string,
  className: PropTypes.string,
};

VersionInfoLabel.defaultProps = {
  version: '',
  identifier: '',
  className: '',
};

export default VersionInfoLabel;
