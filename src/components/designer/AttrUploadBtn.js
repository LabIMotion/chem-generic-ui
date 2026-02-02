/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import UploadKlassModal from '@components/elements/UploadKlassModal';

const AttrUploadBtn = (props) => {
  const { fnUpload, genericType } = props;
  const [show, setShow] = useState(false);

  if (genericType === Constants.GENERIC_TYPES.DATASET) return null;

  return (
    <>
      <LTooltip idf={`imp_${genericType.toLowerCase()}_n_temp`}>
        <Button onClick={() => setShow(true)} variant="outline-secondary" className="gu-btn-outline-secondary">
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
  fnUpload: PropTypes.func,
};

AttrUploadBtn.defaultProps = { fnUpload: () => {} };

export default AttrUploadBtn;
