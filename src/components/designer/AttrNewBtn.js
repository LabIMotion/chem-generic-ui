/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AttrModal from '../elements/AttrModal';
import Constants from '../tools/Constants';

const AttrNewBtn = props => {
  const { fnCreate, genericType, klasses } = props;
  const [show, setShow] = useState(false);

  if (genericType === Constants.GENERIC_TYPES.DATASET) return null;

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_element_new">
            create a new {genericType}
          </Tooltip>
        }
      >
        <Button onClick={() => setShow(true)}>
          New {genericType}&nbsp;
          <i className="fa fa-plus" aria-hidden="true" />
        </Button>
      </OverlayTrigger>
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
