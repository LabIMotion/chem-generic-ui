/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AttrModal from '../elements/AttrModal';
import Constants from '../tools/Constants';

const AttrCopyBtn = props => {
  const { data, fnCopy, fnSelect, genericType, klasses } = props;
  const [show, setShow] = useState(false);

  const onSelect = () => {
    fnSelect();
    setShow(true);
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_element_clone">
            copy {genericType} to ...{' '}
          </Tooltip>
        }
      >
        <Button bsSize="xs" onClick={onSelect}>
          <i className="fa fa-clone" aria-hidden="true" />
        </Button>
      </OverlayTrigger>
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
  ]).isRequired,
  klasses: PropTypes.array, // required for Segment
};

AttrCopyBtn.defaultProps = { klasses: [] };

export default AttrCopyBtn;
