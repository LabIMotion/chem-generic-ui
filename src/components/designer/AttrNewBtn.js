/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import AttrModal from '@components/elements/AttrModal';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const AttrNewBtn = (props) => {
  const { fnCreate, genericType } = props;
  const [show, setShow] = useState(false);

  if (genericType === Constants.GENERIC_TYPES.DATASET) return null;

  return (
    <>
      <LTooltip idf={`create.${genericType.toLowerCase()}`}>
        <Button onClick={() => setShow(true)} variant="outline-secondary" className="gu-btn-outline-secondary">
          {FIcons.faPlus}&nbsp;New
        </Button>
      </LTooltip>
      <AttrModal
        actions={[{ action: 'c', fnAction: fnCreate }]}
        genericType={genericType}
        showProps={{ show, setShow }}
      />
    </>
  );
};

AttrNewBtn.propTypes = {
  fnCreate: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
};

AttrNewBtn.defaultProps = {};

export default AttrNewBtn;
