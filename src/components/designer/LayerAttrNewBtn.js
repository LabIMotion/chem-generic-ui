/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LayerAttrModal from '../elements/LayerAttrModal';

const LayerAttrNewBtn = props => {
  const { fnCreate, isAttrOnWF } = props;
  const [show, setShow] = useState(false);

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="_tooltip_layer_new">add new layer</Tooltip>}
      >
        <Button
          className="button-right"
          bsSize="xs"
          onClick={() => setShow(true)}
        >
          Add new layer&nbsp;
          <i className="fa fa-plus" aria-hidden="true" />
        </Button>
      </OverlayTrigger>
      <LayerAttrModal
        actions={[{ action: 'c', fnAction: fnCreate }]}
        isAttrOnWF={isAttrOnWF}
        showProps={{ show, setShow }}
      />
    </>
  );
};

LayerAttrNewBtn.propTypes = {
  fnCreate: PropTypes.func.isRequired,
  isAttrOnWF: PropTypes.bool,
};

LayerAttrNewBtn.defaultProps = { isAttrOnWF: false };

export default LayerAttrNewBtn;
