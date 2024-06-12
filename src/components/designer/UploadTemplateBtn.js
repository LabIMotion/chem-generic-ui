/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from '../tools/Constants';
import UploadTemplateModal from '../elements/UploadTemplateModal';
import FIcons from '../icons/FIcons';

const UploadTemplateBtn = props => {
  const { data, fnUpload, genericType } = props;
  const [show, setShow] = useState(false);

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_template_upload">
            Import template into Work Area
          </Tooltip>
        }
      >
        <Button bsSize="sm" onClick={() => setShow(true)}>
          {FIcons.faArrowRightToBracket}&nbsp;Import template into Work Area
        </Button>
      </OverlayTrigger>
      <UploadTemplateModal
        data={data}
        fnUpload={fnUpload}
        genericType={genericType}
        showProps={{ show, setShow }}
      />
    </>
  );
};

UploadTemplateBtn.propTypes = {
  data: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnUpload: PropTypes.func.isRequired,
};

export default UploadTemplateBtn;
