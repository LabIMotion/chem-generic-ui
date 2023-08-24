/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LayerAttrModal from '../elements/LayerAttrModal';

const LayerAttrEditBtn = props => {
  const { fnUpdate, isAttrOnWF, layer } = props;
  const [show, setShow] = useState(false);

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_layer_edit">
            edit layer: {layer.label} attributes
          </Tooltip>
        }
      >
        <Button bsSize="sm" onClick={() => setShow(true)}>
          <i className="fa fa-pencil" aria-hidden="true" />
        </Button>
      </OverlayTrigger>
      <LayerAttrModal
        actions={[{ action: 'u', fnAction: fnUpdate }]}
        isAttrOnWF={isAttrOnWF}
        layer={layer}
        showProps={{ show, setShow }}
      />
    </>
  );
};

LayerAttrEditBtn.propTypes = {
  fnUpdate: PropTypes.func.isRequired,
  isAttrOnWF: PropTypes.bool,
  layer: PropTypes.object.isRequired,
};

LayerAttrEditBtn.defaultProps = { isAttrOnWF: false };

export default LayerAttrEditBtn;
