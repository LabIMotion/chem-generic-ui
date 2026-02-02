/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import UploadTemplateModal from '@components/elements/UploadTemplateModal';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const UploadTemplateBtn = (props) => {
  const { data, fnUpload, genericType, btnCls } = props;
  const [show, setShow] = useState(false);

  return (
    <>
      <LTooltip idf="imp_temp_to_area">
        <Button
          onClick={() => setShow(true)}
          variant="outline-secondary"
          size="sm"
          className={btnCls}
        >
          {FIcons.faArrowRightToBracket}&nbsp;Import template into Work Area
        </Button>
      </LTooltip>
      {show && (
        <UploadTemplateModal
          data={data}
          fnUpload={fnUpload}
          genericType={genericType}
          showProps={{ show, setShow }}
        />
      )}
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
  btnCls: PropTypes.string,
};

UploadTemplateBtn.defaultProps = {
  btnCls: '',
};

export default UploadTemplateBtn;
