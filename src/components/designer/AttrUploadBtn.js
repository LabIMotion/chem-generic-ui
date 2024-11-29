/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Constants from '../tools/Constants';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';
import UploadKlassModal from '../elements/UploadKlassModal';

const AttrUploadBtn = (props) => {
  const { fnUpload, genericType } = props;
  const [show, setShow] = useState(false);

  if (genericType === Constants.GENERIC_TYPES.DATASET) return null;

  return (
    <>
      <LTooltip idf={`imp_${genericType.toLowerCase()}_n_temp`}>
        <Button onClick={() => setShow(true)} variant="light">
          {FIcons.faFileImport}&nbsp;Import
        </Button>
      </LTooltip>
      <UploadKlassModal
        fnUpload={fnUpload}
        genericType={genericType}
        showProps={{ show, setShow }}
      />
    </>
  );
};

AttrUploadBtn.propTypes = {
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnUpload: PropTypes.func.isRequired,
};

export default AttrUploadBtn;
