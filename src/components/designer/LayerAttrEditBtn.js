/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, MenuItem } from 'react-bootstrap';
import LayerAttrModal from '../elements/LayerAttrModal';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';
import TAs from '../tools/TAs';

const LayerAttrEditBtn = (props) => {
  const { fnUpdate, isAttrOnWF, layer, as } = props;
  const [show, setShow] = useState(false);

  const message = (_idf) => {
    const idfs = _idf.split('.');
    return typeof TAs[idfs[0]] === 'function'
      ? TAs[idfs[0]](idfs[1])
      : TAs[idfs[0]] || 'No message';
  };

  const conditionMenu = (
    <MenuItem
      eventKey={`edit_layer_attr.${layer.label}`}
      onClick={() => setShow(true)}
    >
      {FIcons.faPencil}&nbsp;&nbsp;{message(`edit_layer_attr.${layer.label}`)}
    </MenuItem>
  );

  return (
    <>
      {as === 'menu' ? (
        conditionMenu
      ) : (
        <LTooltip idf={`edit_layer_attr.${layer.label}`}>
          <Button bsSize="sm" onClick={() => setShow(true)}>
            {FIcons.faPencil}
          </Button>
        </LTooltip>
      )}

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
  as: PropTypes.string,
};

LayerAttrEditBtn.defaultProps = { isAttrOnWF: false, as: 'menu' };

export default LayerAttrEditBtn;
