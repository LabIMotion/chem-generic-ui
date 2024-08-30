/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FieldCondEditModal from '../../elements/FieldCondEditModal';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';

const ConditionFieldBtn = (props) => {
  const { field, fnUpdateSub, layer, sortedLayers } = props;
  const [show, setShow] = useState(false);

  const onClick = () => {
    setShow(true);
  };

  const onClose = () => {
    setShow(false);
  };

  const conditionBtn =
    field?.cond_fields?.length > 0 || false ? (
      <Button bsStyle="warning" bsSize="sm" onClick={onClick}>
        {FIcons.faGears}
      </Button>
    ) : (
      <Button bsSize="sm" onClick={onClick}>
        {FIcons.faGears}
      </Button>
    );

  return (
    <>
      <LTooltip idf="restriction_setting">{conditionBtn}</LTooltip>
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
};

export default ConditionFieldBtn;
