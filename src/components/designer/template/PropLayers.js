/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, InputGroup, Panel } from 'react-bootstrap';
import { sortBy } from 'lodash';
import { FieldTypes } from 'generic-ui-core';
import LayerAttrEditBtn from '../LayerAttrEditBtn';
import LayerAttrNewBtn from '../LayerAttrNewBtn';
import Constants from '../../tools/Constants';
import ButtonTooltip from '../../fields/ButtonTooltip';
import DnDs from '../../dnd/DnDs';
import DroppablePanel from '../../dnd/DroppablePanel';
import PositionDnD from '../../dnd/PositionDnD';
import PropFields from './PropFields';
import {
  handleAddDummy,
  handleCreateLayer,
  handleUpdateLayer,
} from '../../../utils/template/action-handler';
import {
  handleCreateField,
  handleLayerPositionChange,
} from '../../../utils/template/field-handler';
import VocabularyListBtn from './VocabularyListBtn';
import ConditionLayerBtn from './ConditionLayerBtn';
// import RemovePropBtn from './RemovePropBtn';
import NewFieldBtn from './NewFieldBtn';
import LayerSaveBtn from './LayerSaveBtn';
import ButtonDelField from '../../fields/ButtonDelField';
import LBadge from '../../shared/LBadge';
import { pl } from '../../tools/format-utils';

const PropLayers = (props) => {
  const { data, genericType, fnUpdate, vocabularies } = props;

  const onFieldAdd = (_e) => {
    const { newFieldKey, layer } = _e;
    const result = handleCreateField(newFieldKey, data, layer);
    fnUpdate(result);
  };

  const onDummyAdd = (_e) => {
    const { layerKey: _layerKey, field: _field } = _e;
    const result = handleAddDummy(data, _layerKey, _field);
    fnUpdate(result);
  };

  const onLayerCreate = (_layer) => {
    const result = handleCreateLayer(_layer, data);
    fnUpdate(result);
  };

  const onLayerUpdate = (_layerKey, _updates) => {
    const result = handleUpdateLayer(data, _layerKey, _updates);
    fnUpdate(result);
  };

  const onLayerDelete = (result) => {
    fnUpdate(result);
  };

  const onLayerCondition = (result) => {
    fnUpdate(result);
  };

  const onPositionMove = (_item) => {
    const { target, source } = _item;
    const result = handleLayerPositionChange(
      data,
      { key: target.field },
      { key: source.fid.field }
    );
    fnUpdate(result);
  };

  const addArrange = (node, layerKey, noButton = true) => {
    const pBtn = (
      <PositionDnD
        type={DnDs.LAYER}
        field={{ field: layerKey }}
        rowValue={{ key: '' }}
        isButton={false}
      />
    );
    return (
      <DroppablePanel
        type={DnDs.LAYER}
        field={{ field: layerKey }}
        rowValue={{ key: '' }}
        fnCb={onPositionMove}
      >
        {noButton ? null : pBtn}
        {node}
      </DroppablePanel>
    );
  };

  const layers = [];
  const sortedLayers = sortBy(
    data.properties_template.layers,
    (l) => l.position
  );
  (sortedLayers || []).forEach((layer) => {
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
    const nodeHeader = (
      <Panel.Heading className="template_panel_heading">
        <Panel.Title toggle>
          {layer.label}
          <LBadge as="badge" text={layer.key} />
          <LBadge
            as="!badge"
            text={`${layer.cols} ${pl(layer.cols, 'column')} per row`}
            cls="primary"
          />
          <LBadge
            as="!badge"
            text={`${layer?.fields?.length || 0} ${pl(
              layer?.fields?.length || 0,
              'field'
            )}`}
            cls="primary"
          />
          {layer?.wf ? (
            <LBadge as="!badge" text="workflow" cls="warning" />
          ) : null}
        </Panel.Title>
        <FormGroup
          bsSize="sm"
          style={{ marginBottom: 'unset', display: 'inline-table' }}
        >
          <InputGroup>
            <InputGroup.Button>
              <LayerSaveBtn layer={layer} />
              <VocabularyListBtn
                element={data}
                vocabularies={vocabularies}
                fnUpdate={onLayerCondition}
                layer={layer}
                sortedLayers={sortedLayers}
              />
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
              <ButtonDelField
                delType={FieldTypes.DEL_LAYER}
                delKey={layerKey}
                generic={data}
                fnConfirm={onLayerDelete}
              />
              {/* <RemovePropBtn
                delStr={FieldTypes.DEL_LAYER}
                delKey={layerKey}
                element={data}
                fnDelete={onLayerDelete}
              /> */}
              <ButtonTooltip
                idf="fld_dum_add"
                fnClick={onDummyAdd}
                element={{ layerKey, field: null }}
                fa="faSquare"
                place="top"
              />
            </InputGroup.Button>
            <NewFieldBtn fnUpdate={onFieldAdd} layer={layer} />
            <InputGroup.Button>
              <PositionDnD
                type={DnDs.LAYER}
                field={{ field: layerKey }}
                rowValue={{ key: '' }}
                isButton
              />
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </Panel.Heading>
    );
    const node = (
      <Panel
        className="panel_generic_properties"
        defaultExpanded
        key={`idxLayer_${layerKey}`}
      >
        {addArrange(nodeHeader, layerKey)}
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
  vocabularies: PropTypes.array,
};

PropLayers.defaultProps = { vocabularies: [] };

export default PropLayers;
