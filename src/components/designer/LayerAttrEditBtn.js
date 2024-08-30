/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import LayerAttrModal from '../elements/LayerAttrModal';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const LayerAttrEditBtn = (props) => {
  const { fnUpdate, isAttrOnWF, layer } = props;
  const [show, setShow] = useState(false);

  return (
    <>
      <LTooltip idf={`edit_layer_attr.${layer.label}`}>
        <Button bsSize="sm" onClick={() => setShow(true)}>
          {FIcons.faPencil}
        </Button>
      </LTooltip>
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
