/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import VersionModal from './VersionModal';
import FIcons from '../../icons/FIcons';

const VisionListBtn = ({ generic, fnRetrieve }) => {
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
        overlay={<Tooltip id={uuid()}>Click to view the revisions</Tooltip>}
      >
        <Button onClick={() => setShow(!show)} size="sm" variant="primary">
          {FIcons.faClockRotateLeft}&nbsp;Revision
        </Button>
      </OverlayTrigger>
      {show && (
        <VersionModal
          fnRetrieve={handleRetrieve}
          show={show || false}
          fnClose={() => setShow(false)}
          element={generic}
        />
      )}
    </>
  );
};

VisionListBtn.propTypes = {
  generic: PropTypes.object.isRequired,
  fnRetrieve: PropTypes.func,
};

VisionListBtn.defaultProps = { fnRetrieve: () => {} };

export default VisionListBtn;
