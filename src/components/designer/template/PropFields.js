/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import { getUnitSystem } from 'generic-ui-core';
import ElementField from '../../elements/ElementField';
import {
  handleAddDummy,
  handleDelete,
  handleFieldInputChange,
} from '../../../utils/template/action-handler';
import { handleFieldSubChange } from '../../../utils/template/condition-handler';
import { handleFieldMove } from '../../../utils/template/field-handler';

const PropFields = props => {
  const { generic, genericType, fnUpdate, layer } = props;

  const onDummyAdd = _e => {
    const { layerKey: _layerKey, field: _field } = _e;
    const result = handleAddDummy(generic, _layerKey, _field);
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
    generic.properties_template?.select_options
  ).map(key => {
    return { value: key, name: key, label: key };
  });

  const fields = (layer?.fields || []).map((f, idx) => (
    <ElementField
      genericType={genericType}
      key={`${genericType}_${layer.key}_${f.field}`}
      layer={layer}
      layerKey={layer.key}
      position={idx + 1}
      field={f}
      select_options={selectOptions}
      onMove={onFieldMove}
      onDelete={onFieldRemove}
      onChange={onFieldInputChange}
      unitsSystem={getUnitSystem()}
      onFieldSubFieldChange={onFieldSubFieldChange}
      onDummyAdd={onDummyAdd}
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
