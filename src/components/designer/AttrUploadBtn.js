/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
          <Tooltip id="_tooltip_klass_upload">{`Upload ${genericType}`}</Tooltip>
        }
      >
        <Button bsSize="xs" onClick={() => setShow(true)}>
          Upload &nbsp;
          <i className="fa fa-upload" aria-hidden="true" />
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
