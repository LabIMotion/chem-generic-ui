/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Badge, FormGroup, InputGroup, Panel } from 'react-bootstrap';
import { sortBy } from 'lodash';
import { FieldTypes } from 'generic-ui-core';
import LayerAttrEditBtn from '../LayerAttrEditBtn';
import LayerAttrNewBtn from '../LayerAttrNewBtn';
import Constants from '../../tools/Constants';
import ButtonTooltip from '../../fields/ButtonTooltip';
import PropFields from './PropFields';
import {
  handleAddDummy,
  handleCreateLayer,
  handleUpdateLayer,
} from '../../../utils/template/action-handler';
import { handleCreateField } from '../../../utils/template/field-handler';
import ConditionLayerBtn from './ConditionLayerBtn';
import RemovePropBtn from './RemovePropBtn';
import NewFieldBtn from './NewFieldBtn';

const PropLayers = props => {
  const { data, genericType, fnUpdate } = props;

  const onFieldAdd = _e => {
    const { newFieldKey, layer } = _e;
    const result = handleCreateField(newFieldKey, data, layer);
    fnUpdate(result);
  };

  const onDummyAdd = _e => {
    const { layerKey: _layerKey, field: _field } = _e;
    const result = handleAddDummy(data, _layerKey, _field);
    fnUpdate(result);
  };

  const onLayerCreate = _layer => {
    const result = handleCreateLayer(_layer, data);
    fnUpdate(result);
  };

  const onLayerUpdate = (_layerKey, _updates) => {
    const result = handleUpdateLayer(data, _layerKey, _updates);
    fnUpdate(result);
  };

  const onLayerDelete = result => {
    fnUpdate(result);
  };

  const onLayerCondition = result => {
    fnUpdate(result);
  };

  const layers = [];
  const sortedLayers = sortBy(data.properties_template.layers, l => l.position);
  (sortedLayers || []).forEach(layer => {
    const layerKey = `${layer.key}`;

    const fields = (
      <PropFields
        generic={data}
        genericType={genericType}
        fnUpdate={fnUpdate}
        layer={layer}
      />
    );

    const isAttrOnWF = genericType === Constants.GENERIC_TYPES.ELEMENT;
    const node = (
      <Panel
        className="panel_generic_properties"
        defaultExpanded
        key={`idxLayer_${layerKey}`}
      >
        <Panel.Heading className="template_panel_heading">
          <Panel.Title toggle>
            {layer.label}&nbsp;<Badge>{layer.key}</Badge>&nbsp;
            <Badge>Columns per Row:&nbsp;{layer.cols}</Badge>&nbsp;
            <Badge className="bg-bs-primary">
              Fields:&nbsp;{layer?.fields?.length || 0}
            </Badge>
            {layer?.wf ? (
              <span>
                &nbsp;<Badge className="bg-bs-warning">workflow</Badge>
              </span>
            ) : null}
          </Panel.Title>
          <FormGroup
            bsSize="sm"
            style={{ marginBottom: 'unset', display: 'inline-table' }}
          >
            <InputGroup>
              <InputGroup.Button>
                <ConditionLayerBtn
                  element={data}
                  fnUpdate={onLayerCondition}
                  layer={layer}
                  sortedLayers={sortedLayers}
                />
                <LayerAttrEditBtn
                  fnUpdate={onLayerUpdate}
                  isAttrOnWF={isAttrOnWF}
                  layer={layer}
                />
                <RemovePropBtn
                  delStr={FieldTypes.DEL_LAYER}
                  delKey={layerKey}
                  element={data}
                  fnDelete={onLayerDelete}
                />
                <ButtonTooltip
                  tip="Add Dummy field"
                  fnClick={onDummyAdd}
                  element={{ layerKey, field: null }}
                  fa="fa fa-plus-circle"
                  place="top"
                  size="sm"
                />
              </InputGroup.Button>
              <NewFieldBtn fnUpdate={onFieldAdd} layer={layer} />
            </InputGroup>
          </FormGroup>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body style={{ padding: '15px 0px 15px 0px' }}>
            {fields}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
    layers.push(node);
  });

  return (
    <div>
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Layers
            <LayerAttrNewBtn fnCreate={onLayerCreate} />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <div>{layers}</div>
        </Panel.Body>
      </Panel>
    </div>
  );
};

PropLayers.propTypes = {
  data: PropTypes.object.isRequired,
  fnUpdate: PropTypes.func.isRequired, // { notify, element }
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
};

export default PropLayers;
