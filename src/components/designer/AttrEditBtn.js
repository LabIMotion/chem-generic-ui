/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import AttrModal from '../elements/AttrModal';
import Constants from '../tools/Constants';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const AttrEditBtn = (props) => {
  const { data, fnSelect, fnDelete, fnEdit, genericType, klasses } = props;
  const [show, setShow] = useState(false);

  const onSelect = () => {
    fnSelect();
    setShow(true);
  };

  return (
    <>
      <LTooltip idf={`edit_attr.${genericType.toLowerCase()}`}>
        <Button variant="light" className="btn-sm" onClick={onSelect}>
          {FIcons.faPencil}
        </Button>
      </LTooltip>
      <AttrModal
        actions={[
          { action: 'u', fnAction: fnEdit },
          { action: 'd', fnAction: fnDelete },
        ]}
        data={data}
        editable={false}
        fnAction={fnEdit}
        genericType={genericType}
        klasses={klasses}
        showProps={{ show, setShow }}
      />
    </>
  );
};

AttrEditBtn.propTypes = {
  data: PropTypes.object,
  fnDelete: PropTypes.func.isRequired,
  fnEdit: PropTypes.func.isRequired,
  fnSelect: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  klasses: PropTypes.array, // required for Segment
};

AttrEditBtn.defaultProps = { klasses: [] };

export default AttrEditBtn;
