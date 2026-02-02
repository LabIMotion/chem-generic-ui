/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import VersionModal from '@components/designer/preview/VersionModal';
import FIcons from '@components/icons/FIcons';

const VisionListBtn = ({ generic, genericType, fnRetrieve }) => {
  const [show, setShow] = useState(false);

  if (
    ![
      Constants.GENERIC_TYPES.ELEMENT,
      Constants.GENERIC_TYPES.SEGMENT,
      Constants.GENERIC_TYPES.DATASET,
    ].includes(genericType)
  )
    return null;

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
        overlay={<Tooltip id={uuid()}>View the revisions</Tooltip>}
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
          genericType={genericType}
        />
      )}
    </>
  );
};

VisionListBtn.propTypes = {
  generic: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnRetrieve: PropTypes.func,
};

VisionListBtn.defaultProps = { fnRetrieve: () => {} };

export default VisionListBtn;
