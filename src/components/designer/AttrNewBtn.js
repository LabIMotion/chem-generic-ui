/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import AttrModal from '../elements/AttrModal';
import Constants from '../tools/Constants';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const AttrNewBtn = (props) => {
  const { fnCreate, genericType, klasses } = props;
  const [show, setShow] = useState(false);

  if (genericType === Constants.GENERIC_TYPES.DATASET) return null;

  return (
    <>
      <LTooltip idf={`create.${genericType.toLowerCase()}`}>
        <Button onClick={() => setShow(true)} variant="light">
          {FIcons.faPlus}&nbsp;New {genericType}
        </Button>
      </LTooltip>
      <AttrModal
        actions={[{ action: 'c', fnAction: fnCreate }]}
        genericType={genericType}
        klasses={klasses}
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
  klasses: PropTypes.array, // required for Segment
};

AttrNewBtn.defaultProps = { klasses: [] };

export default AttrNewBtn;
