/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from '../tools/Constants';
import UploadKlassModal from '../elements/UploadKlassModal';

const AttrUploadBtn = props => {
  const { data, fnUpload, genericType } = props;
  const [show, setShow] = useState(false);

  if (genericType === Constants.GENERIC_TYPES.DATASET) return null;

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_klass_upload">{`import a ${genericType} and its template`}</Tooltip>
        }
      >
        <Button bsSize="xs" onClick={() => setShow(true)}>
          Import &nbsp; <Glyphicon glyph="import" />
        </Button>
      </OverlayTrigger>
      <UploadKlassModal
        data={data}
        fnUpload={fnUpload}
        genericType={genericType}
        showProps={{ show, setShow }}
      />
    </>
  );
};

AttrUploadBtn.propTypes = {
  data: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnUpload: PropTypes.func.isRequired,
};

export default AttrUploadBtn;
