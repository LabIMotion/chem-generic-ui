/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';
import FieldRestrictionModal from '@components/designer/template/FieldRestrictionModal';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import TAs from '@components/tools/TAs';

function ConditionFieldBtn(props) {
  const {
    field,
    fnUpdateSub,
    layer,
    sortedLayers,
    as,
    groupedLayerKeys,
    sameGroupLayerKeys,
    selectOptions,
    disabled,
  } = props;
  const [show, setShow] = useState(false);

  const onClick = () => {
    if (disabled) return;
    setShow(true);
  };

  const onClose = () => {
    setShow(false);
  };

  const handleUpdate = (updatedField) => {
    fnUpdateSub(layer.key, updatedField);
  };

  const conditionBtn = (
    <Button
      variant={field?.cond_fields?.length > 0 || false ? 'warning' : 'light'}
      className="rounded-0"
      onClick={onClick}
      disabled={disabled}
    >
      {FIcons.faGears}
    </Button>
  );

  const conditionMenu = (
    <Dropdown.Item
      eventKey="_field_cond_menu_item"
      onClick={onClick}
      className={field?.cond_fields?.length > 0 ? 'gu-menu-item-cond' : ''}
      disabled={disabled}
    >
      {FIcons.faGears}&nbsp;&nbsp;{TAs.restriction_setting}
    </Dropdown.Item>
  );

  return (
    <>
      {as === 'menu' ? (
        conditionMenu
      ) : (
        <LTooltip
          idf={disabled ? 'restric_not_on_required' : 'restriction_setting'}
        >
          {conditionBtn}
        </LTooltip>
      )}
      <FieldRestrictionModal
        showModal={show}
        field={field}
        layer={layer}
        sortedLayers={sortedLayers}
        onUpdate={handleUpdate}
        onClose={onClose}
        groupedLayerKeys={groupedLayerKeys}
        sameGroupLayerKeys={sameGroupLayerKeys}
        selectOptions={selectOptions}
      />
    </>
  );
}

ConditionFieldBtn.propTypes = {
  field: PropTypes.object.isRequired,
  fnUpdateSub: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
  sortedLayers: PropTypes.array.isRequired,
  as: PropTypes.string,
  groupedLayerKeys: PropTypes.arrayOf(PropTypes.string),
  sameGroupLayerKeys: PropTypes.arrayOf(PropTypes.string),
  selectOptions: PropTypes.object,
  disabled: PropTypes.bool,
};

ConditionFieldBtn.defaultProps = {
  as: 'menu',
  groupedLayerKeys: [],
  sameGroupLayerKeys: null,
  selectOptions: {},
  disabled: false,
};

export default ConditionFieldBtn;
