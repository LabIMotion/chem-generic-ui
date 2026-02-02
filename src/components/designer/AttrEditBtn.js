/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import AttrModal from '@components/elements/AttrModal';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const AttrEditBtn = (props) => {
  const { data, fnSelect, fnDelete, fnEdit, genericType } = props;
  const [show, setShow] = useState(false);

  const onSelect = () => {
    fnSelect();
    setShow(true);
  };

  return (
    <>
      <LTooltip idf={`edit_attr.${genericType.toLowerCase()}`}>
        <Button variant="light" size="sm" onClick={onSelect}>
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
};

AttrEditBtn.defaultProps = {};

export default AttrEditBtn;
