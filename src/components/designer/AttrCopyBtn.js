/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import AttrModal from '../elements/AttrModal';
import Constants from '../tools/Constants';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const AttrCopyBtn = (props) => {
  const { data, fnCopy, fnSelect, genericType, klasses } = props;
  const [show, setShow] = useState(false);

  const onSelect = () => {
    fnSelect();
    setShow(true);
  };

  return (
    <>
      <LTooltip idf={`copy.${genericType.toLowerCase()}`}>
        <Button variant="light" className="btn-sm" onClick={onSelect}>
          {FIcons.faClone}
        </Button>
      </LTooltip>
      <AttrModal
        actions={[{ action: 'cc', fnAction: fnCopy }]}
        data={data}
        editable
        fnAction={fnCopy}
        genericType={genericType}
        klasses={klasses}
        showProps={{ show, setShow }}
      />
    </>
  );
};

AttrCopyBtn.propTypes = {
  data: PropTypes.object,
  fnCopy: PropTypes.func.isRequired,
  fnSelect: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  klasses: PropTypes.array, // required for Segment
};

AttrCopyBtn.defaultProps = { klasses: [] };

export default AttrCopyBtn;
