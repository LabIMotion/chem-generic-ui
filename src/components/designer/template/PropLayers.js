/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Card, Dropdown } from 'react-bootstrap';
import sortBy from 'lodash/sortBy';
import { FieldTypes } from 'generic-ui-core';
import Prop from './Prop';
import LayerOrderBtn from './LayerOrderBtn';
import LayerAttrEditBtn from '../LayerAttrEditBtn';
import LayerAttrNewBtn from '../LayerAttrNewBtn';
import LayerGridBtn from './LayerGridBtn';
import Constants from '../../tools/Constants';
import ButtonTooltip from '../../fields/ButtonTooltip';
import PropFields from './PropFields';
import {
  handleAddDummy,
  handleCreateLayer,
  handleAddStandardLayer,
  handleUpdateLayer,
} from '../../../utils/template/action-handler';
import {
  handleCreateField,
  handleLayerPositionChange,
} from '../../../utils/template/field-handler';
import ConditionLayerBtn from './ConditionLayerBtn';
import NewFieldBtn from './NewFieldBtn';
import LayerSaveBtn from './LayerSaveBtn';
import ButtonDelField from '../../fields/ButtonDelField';
import ButtonEllipse from '../../fields/ButtonEllipse';
import LBadge from '../../shared/LBadge';
import { pl } from '../../tools/format-utils';
import LayerManager from '../../../utils/desMgr';
import VocabularyListBtn from './VocabularyListBtn';
import FieldOrderBtn from './FieldOrderBtn';

const PropLayers = (props) => {
  const { data, genericType, fnUpdate, vocabularies } = props;
  const [expandLayers, setExpandLayers] = useState({});

  const toggleExpandLayer = (layerKey) => {
    setExpandLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

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

  const onAddStandardLayer = async (_layer) => {
    const result = handleAddStandardLayer(_layer, data, genericType);
    fnUpdate(result);
  };

  const onDeleteStandardLayer = async (_layer) => {
    const result = await LayerManager.deleteStandardLayer(_layer.id);
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
        vocabularies={vocabularies}
        parentExpand={expandLayers[layerKey]}
      />
    );
    const isAttrOnWF = [
      Constants.GENERIC_TYPES.ELEMENT,
      Constants.GENERIC_TYPES.SEGMENT,
    ].includes(genericType);

    const layerHeader = (
      <span className="flex-grow-1">
        <span className="fw-bold">{layer.label}</span>
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
      </span>
    );

    const layerHeaderButtons = (
      <div className="d-flex">
        <div className="me-2">
          <NewFieldBtn fnUpdate={onFieldAdd} layer={layer}>
            <VocabularyListBtn
              element={data}
              fnUpdate={fnUpdate}
              layer={layer}
            />
          </NewFieldBtn>
        </div>
        <ButtonGroup className="me-2">
          <LayerSaveBtn layer={layer} data={data} />
        </ButtonGroup>
        <ButtonGroup>
          <ButtonEllipse condSet={layer?.cond_fields?.length > 0 || false}>
            <LayerAttrEditBtn
              fnUpdate={onLayerUpdate}
              isAttrOnWF={isAttrOnWF}
              layer={layer}
              as="menu"
            />
            <ConditionLayerBtn
              element={data}
              fnUpdate={onLayerCondition}
              layer={layer}
              sortedLayers={sortedLayers}
              as="menu"
            />
            <ButtonTooltip
              idf="fld_dum_add"
              fnClick={onDummyAdd}
              element={{ layerKey, field: null }}
              fa="faSquare"
              place="top"
              as="menu"
            />
            <FieldOrderBtn
              layer={layer}
              generic={data}
              genericType={genericType}
              fnSave={fnUpdate}
            />
            <Dropdown.Divider />
            <ButtonDelField
              delType={FieldTypes.DEL_LAYER}
              delKey={layerKey}
              generic={data}
              fnConfirm={onLayerDelete}
              as="menu"
            />
          </ButtonEllipse>
        </ButtonGroup>
      </div>
    );

    const customHeader = (
      <>
        {layerHeader}
        {layerHeaderButtons}
      </>
    );

    const newNode = (
      <Prop
        key={`_prop_content_${layerKey}`}
        layerKey={layerKey}
        toggleExpand={toggleExpandLayer}
        propHeader={customHeader}
      >
        {fields}
      </Prop>
    );
    layers.push(newNode);
  });

  return (
    <div>
      <Card className="border-0">
        <Card.Header
          as="h5"
          className="d-flex justify-content-between align-items-center bg-white px-1"
        >
          Layers
          <span className="button-right d-flex gap-1">
            <LayerOrderBtn
              generic={data}
              genericType={genericType}
              fnSave={fnUpdate}
            />
            <LayerAttrNewBtn fnCreate={onLayerCreate} />
            <LayerGridBtn
              fnCreate={onAddStandardLayer}
              fnDelete={onDeleteStandardLayer}
            />
          </span>
        </Card.Header>
        <Card.Body className="p-0">
          <div>{layers}</div>
        </Card.Body>
      </Card>
    </div>
  );
};

PropLayers.propTypes = {
  data: PropTypes.object.isRequired,
  fnUpdate: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  vocabularies: PropTypes.array,
};

PropLayers.defaultProps = { vocabularies: [] };

export default PropLayers;
