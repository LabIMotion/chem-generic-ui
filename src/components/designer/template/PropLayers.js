/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Card, Dropdown } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import Prop from '@components/designer/template/Prop';
import LayerHeader from '@components/designer/template/LayerHeader';
import GroupLayerOrderBtn from '@components/designer/template/GroupLayerOrderBtn';
import LayerAttrEditBtn from '@components/designer/LayerAttrEditBtn';
import LayerAttrNewBtn from '@components/designer/LayerAttrNewBtn';
import LayerGridBtn from '@components/designer/template/LayerGridBtn';
import Constants from '@components/tools/Constants';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import GroupButton from '@components/actions/GroupButton';
import PropFields from '@components/designer/template/PropFields';
import NewFieldBtn from '@components/designer/template/NewFieldBtn';
import LayerSaveBtn from '@components/designer/template/LayerSaveBtn';
import ButtonDelField from '@components/fields/ButtonDelField';
import ButtonEllipse from '@components/fields/ButtonEllipse';
import VocabularyListBtn from '@components/designer/template/VocabularyListBtn';
import FieldOrderBtn from '@components/designer/template/FieldOrderBtn';
import fbc from '@components/tools/ui-styles';
import LayerManager from '@utils/desMgr';
import {
  handleAddDummy,
  handleCreateLayer,
  handleAddStandardLayer,
  handleUpdateLayer,
} from '@utils/template/action-handler';
import {
  handleCreateField,
  handleLayerPositionChange,
} from '@utils/template/field-handler';
import {
  getGroupInfoByLayer,
  organizeLayersForDisplay,
} from '@utils/template/group-handler';

function PropLayers(props) {
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
      { key: source.fid.field },
    );
    fnUpdate(result);
  };

  const layers = [];

  // Use organizeLayersForDisplay to get layers in the same order as others
  const displayItems = organizeLayersForDisplay(
    data.properties_template.layers || {},
    data.metadata?.groups || [],
  );

  // Flatten displayItems to get layers in correct order
  const sortedLayers = [];
  displayItems.forEach((item) => {
    if (item.type === 'group') {
      // Add all layers from the group in the order they appear in the group
      item.layers.forEach((layerItem) => {
        sortedLayers.push(layerItem.data);
      });
    } else {
      // Add ungrouped layer
      sortedLayers.push(item.data);
    }
  });

  (sortedLayers || []).forEach((layer) => {
    const layerKey = `${layer.key}`;

    // Get group information if layer belongs to a group
    const groupInfo = getGroupInfoByLayer(data.metadata, layerKey);

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

    const layerHeader = <LayerHeader layer={layer} groupInfo={groupInfo} />;

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
          <ButtonEllipse condSet={false}>
            <LayerAttrEditBtn
              fnUpdate={onLayerUpdate}
              isAttrOnWF={isAttrOnWF}
              layer={layer}
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
        <Card.Header as="h5" className={`${fbc} lu-bg-white px-1`}>
          Layers
          <span className="button-right d-flex gap-1">
            <GroupLayerOrderBtn
              generic={data}
              genericType={genericType}
              fnSave={fnUpdate}
            />
            <GroupButton
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
}

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
