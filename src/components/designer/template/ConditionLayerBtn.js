/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';
import {
  verifyConditionLayer,
  handleLayerConditionChange,
} from '@utils/template/condition-handler';
import RestrictionModal from '@ui/modals/RestrictionModal';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import TAs from '@components/tools/TAs';

const ConditionLayerBtn = (props) => {
  const { element, fnUpdate, layer, sortedLayers, as } = props;
  const [show, setShow] = useState(false);

  const onClick = (e) => {
    // e.stopPropagation(); // mark it to close the menu item automactically when the modal is open
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
      <Button variant="warning" size="sm" onClick={onClick}>
        {FIcons.faGears}
      </Button>
    ) : (
      <Button size="sm" onClick={onClick}>
        {FIcons.faGears}
      </Button>
    );

  const conditionMenu = (
    <Dropdown.Item
      eventKey="_lyr_cond_menu_item"
      onClick={onClick}
      className={layer?.cond_fields?.length > 0 ? 'gu-menu-item-cond' : ''}
    >
      {FIcons.faGears}&nbsp;&nbsp;{TAs.restriction_setting}
    </Dropdown.Item>
  );

  return (
    <>
      {as === 'menu' ? (
        conditionMenu
      ) : (
        <LTooltip idf="restriction_setting">{conditionBtn}</LTooltip>
      )}
      <RestrictionModal
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
  as: PropTypes.string,
};

ConditionLayerBtn.defaultProps = { as: 'menu' };

export default ConditionLayerBtn;
