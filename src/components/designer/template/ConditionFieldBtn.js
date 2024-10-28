/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';
import FieldCondEditModal from '../../elements/FieldCondEditModal';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';
import TAs from '../../tools/TAs';

const ConditionFieldBtn = (props) => {
  const { field, fnUpdateSub, layer, sortedLayers, as } = props;
  const [show, setShow] = useState(false);

  const onClick = () => {
    setShow(true);
  };

  const onClose = () => {
    setShow(false);
  };

  const conditionBtn =
    field?.cond_fields?.length > 0 || false ? (
      <Button variant="warning" onClick={onClick}>
        {FIcons.faGears}
      </Button>
    ) : (
      <Button onClick={onClick}>{FIcons.faGears}</Button>
    );

  const conditionMenu = (
    <Dropdown.Item
      eventKey="_field_cond_menu_item"
      onClick={onClick}
      className={field?.cond_fields?.length > 0 ? 'gu-menu-item-cond' : ''}
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
      <FieldCondEditModal
        showModal={show}
        layer={layer}
        allLayers={sortedLayers}
        layerKey={layer.key}
        updSub={fnUpdateSub} // updSubField, for field condition
        updLayer={() => {}} // for layer condition
        field={field} // field, for field condition
        fnClose={onClose}
      />
    </>
  );
};

ConditionFieldBtn.propTypes = {
  field: PropTypes.object.isRequired,
  fnUpdateSub: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
  sortedLayers: PropTypes.array.isRequired,
  as: PropTypes.string,
};

ConditionFieldBtn.defaultProps = { as: 'menu' };

export default ConditionFieldBtn;
