/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import { ElementField } from '../../elements/ElementField';
import {
  handleAddDummy,
  handleCondition,
  handleDelete,
  handleFieldInputChange,
  handleFieldMove,
  handleFieldSubChange,
} from '../../../utils/template/action-handler';
import { UnitSystem } from '../../tools/utils';

const PropFields = props => {
  const { generic, genericType, fnUpdate, layer } = props;

  const onDummyAdd = ({ _layerKey, _field }) => {
    const result = handleAddDummy(generic, _layerKey, _field);
    fnUpdate(result);
  };

  const onFieldCond = (_field, _layerKey) => {
    const result = handleCondition(generic, _layerKey, _field);
    fnUpdate(result);
  };

  const onFieldMove = (_layerKey, _field, _isUp) => {
    const result = handleFieldMove(generic, _layerKey, _field, _isUp);
    fnUpdate(result);
  };

  const onFieldRemove = (delStr, delKey, delRoot) => {
    const result = handleDelete(delStr, delKey, delRoot, generic);
    fnUpdate(result);
  };

  const onFieldInputChange = (
    _event,
    _orig,
    _field,
    _layerKey,
    _fieldCheck,
    _type
  ) => {
    const result = handleFieldInputChange(
      generic,
      _event,
      _orig,
      _field,
      _layerKey,
      _fieldCheck,
      _type
    );
    fnUpdate(result);
  };

  const onFieldSubFieldChange = (_layerKey, _field, _cb) => {
    const result = handleFieldSubChange(generic, _layerKey, _field, _cb);
    fnUpdate(result);
  };

  const sortedLayers = sortBy(
    generic.properties_template.layers,
    l => l.position
  );

  const selectOptions = Object.keys(
    generic.properties_template.select_options
  ).map(key => {
    return { value: key, name: key, label: key };
  });

  const fields = (layer?.fields || []).map((f, idx) => (
    <ElementField
      genericType={genericType}
      key={`${layer.key}${f.field}`}
      layerKey={layer.key}
      position={idx + 1}
      field={f}
      select_options={selectOptions}
      onMove={onFieldMove}
      onDelete={onFieldRemove}
      onChange={onFieldInputChange}
      unitsSystem={UnitSystem}
      onFieldSubFieldChange={onFieldSubFieldChange}
      onDummyAdd={onDummyAdd}
      onShowFieldCond={onFieldCond}
      allLayers={sortedLayers}
    />
  ));

  return <>{fields}</>;
};

PropFields.propTypes = {
  generic: PropTypes.object.isRequired,
  genericType: PropTypes.string.isRequired,
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
};

export default PropFields;
