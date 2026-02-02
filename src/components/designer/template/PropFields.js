/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import { organizeLayersForDisplay } from '@utils/template/group-handler';
import { getUnitSystem } from 'generic-ui-core';
import ElementField from '@components/elements/ElementField';
import {
  handleAddDummy,
  handleDelete,
  handleFieldInputChange,
} from '@utils/template/action-handler';
import { handleFieldSubChange } from '@utils/template/condition-handler';
import {
  handleFieldMove,
  handlePositionChange,
} from '@utils/template/field-handler';

const PropFields = (props) => {
  const { generic, genericType, fnUpdate, layer, vocabularies, parentExpand } =
    props;

  const onDummyAdd = (_e) => {
    const { layerKey: _layerKey, field: _field } = _e;
    const result = handleAddDummy(generic, _layerKey, _field);
    fnUpdate(result);
  };

  const onFieldMove = (_layerKey, _field, _isUp) => {
    const result = handleFieldMove(generic, _layerKey, _field, _isUp);
    fnUpdate(result);
  };

  // const onFieldRemove = (delStr, delKey, delRoot) => {
  //   const result = handleDelete(delStr, delKey, delRoot, generic);
  //   fnUpdate(result);
  // };
  const onFieldRemove = (result) => {
    fnUpdate(result);
  };

  const onFieldInputChange = (
    _event,
    _orig,
    _field,
    _layerKey,
    _fieldCheck,
    _type,
  ) => {
    const result = handleFieldInputChange(
      generic,
      _event,
      _orig,
      _field,
      _layerKey,
      _fieldCheck,
      _type,
    );
    fnUpdate(result);
  };

  const onFieldSubFieldChange = (_layerKey, _field, _cb) => {
    const result = handleFieldSubChange(generic, _layerKey, _field, _cb);
    fnUpdate(result);
  };

  const onPositionMove = (_layerKey, _target, _source) => {
    const result = handlePositionChange(generic, _layerKey, _target, _source);
    fnUpdate(result);
  };

  // Use organizeLayersForDisplay to respect group structure
  const displayItems = organizeLayersForDisplay(
    generic.properties_template.layers || {},
    generic.metadata?.groups || [],
  );

  const sortedLayers = [];
  displayItems.forEach((item) => {
    if (item.type === 'group') {
      item.layers.forEach((layerItem) => {
        sortedLayers.push(layerItem.data);
      });
    } else {
      sortedLayers.push(item.data);
    }
  });

  // Pass original select_options object structure
  const selectOptions = generic.properties_template?.select_options || {};

  const fields = (layer?.fields || []).map((f, idx) => (
    <ElementField
      generic={generic}
      genericType={genericType}
      key={`_propF_${genericType}_${layer.key}_${f.field}_${idx}`}
      layer={layer}
      layerKey={layer.key}
      position={idx + 1}
      field={f}
      select_options={selectOptions}
      onMove={{ onField: onFieldMove, onPosition: onPositionMove }}
      onDelete={onFieldRemove}
      onChange={onFieldInputChange}
      unitsSystem={getUnitSystem()}
      onFieldSubFieldChange={onFieldSubFieldChange}
      onDummyAdd={onDummyAdd}
      allLayers={sortedLayers}
      vocabularies={vocabularies}
      parentExpand={parentExpand}
    />
  ));

  return <>{fields}</>;
};

PropFields.propTypes = {
  generic: PropTypes.object.isRequired,
  genericType: PropTypes.string.isRequired,
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
  vocabularies: PropTypes.array,
  parentExpand: PropTypes.bool,
};

PropFields.defaultProps = { vocabularies: [], parentExpand: false };

export default PropFields;
