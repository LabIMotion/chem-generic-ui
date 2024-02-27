/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  verifyConditionLayer,
  handleLayerConditionChange,
} from '../../../utils/template/condition-handler';
import FieldCondEditModal from '../../elements/FieldCondEditModal';

const ConditionLayerBtn = props => {
  const { element, fnUpdate, layer, sortedLayers } = props;
  const [show, setShow] = useState(false);

  const onClick = () => {
    const result = verifyConditionLayer(element, layer.key);
    const { notify } = result;
    if (notify.isSuccess) {
      setShow(true);
    } else {
      fnUpdate(result);
    }
  };

  const onClose = () => {
    setShow(false);
  };

  const updLayerSubField = (_layerKey, _layer) => {
    element.properties_template.layers[`${_layerKey}`] = _layer;
    const result = handleLayerConditionChange(element, _layerKey);
    fnUpdate(result);
  };

  const conditionBtn =
    layer?.cond_fields?.length > 0 || false ? (
      <Button bsStyle="warning" bsSize="sm" onClick={onClick}>
        <i className="fa fa-cogs" aria-hidden="true" />
      </Button>
    ) : (
      <Button bsSize="sm" onClick={onClick}>
        <i className="fa fa-cogs" aria-hidden="true" />
      </Button>
    );

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_restriction_setting">
            Restriction Setting
          </Tooltip>
        }
      >
        {conditionBtn}
      </OverlayTrigger>
      <FieldCondEditModal
        showModal={show}
        layer={layer}
        allLayers={sortedLayers}
        layerKey={layer.key}
        updSub={() => {}} // updSubField, for field condition
        updLayer={updLayerSubField}
        field={null} // field, for field condition
        element={element}
        fnClose={onClose}
      />
    </>
  );
};

ConditionLayerBtn.propTypes = {
  element: PropTypes.object.isRequired,
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
  sortedLayers: PropTypes.array.isRequired,
};

export default ConditionLayerBtn;
