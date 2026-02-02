/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SourceModal from '@components/fields/SourceModal';
import FIcons from '@components/icons/FIcons';

const SourceBtn = ({ generic, fnRetrieve }) => {
  const [show, setShow] = useState(false);

  if (generic?.is_new)
    return (
      <Button onClick={() => {}} size="sm" variant="primary" disabled>
        {FIcons.faClockRotateLeft}&nbsp;No Revision
      </Button>
    );

  const handleRetrieve = (revision, cb) => {
    setShow(false);
    fnRetrieve(revision, cb);
  };

  return (
    <>
      <OverlayTrigger
        delayShow={1000}
        placement="top"
        overlay={<Tooltip id={uuid()}>Source Information</Tooltip>}
      >
        <Button onClick={() => setShow(!show)} size="sm" variant="primary">
          Source Info.
        </Button>
      </OverlayTrigger>
      {show && (
        <SourceModal
          fnRetrieve={handleRetrieve}
          show={show || false}
          fnClose={() => setShow(false)}
          element={generic}
        />
      )}
    </>
  );
};

SourceBtn.propTypes = {
  generic: PropTypes.object.isRequired,
  fnRetrieve: PropTypes.func,
};

SourceBtn.defaultProps = { fnRetrieve: () => {} };

export default SourceBtn;
