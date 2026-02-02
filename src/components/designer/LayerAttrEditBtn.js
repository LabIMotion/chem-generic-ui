/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';
import LayerAttrModal from '@components/elements/LayerAttrModal';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import TAs from '@components/tools/TAs';

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
    <Dropdown.Item
      eventKey={`edit_layer_attr.${layer.label}`}
      onClick={() => setShow(true)}
    >
      {FIcons.faPencil}&nbsp;&nbsp;{message(`edit_layer_attr.${layer.label}`)}
    </Dropdown.Item>
  );

  return (
    <>
      {as === 'menu' ? (
        conditionMenu
      ) : (
        <LTooltip idf={`edit_layer_attr.${layer.label}`}>
          <Button size="sm" onClick={() => setShow(true)}>
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
