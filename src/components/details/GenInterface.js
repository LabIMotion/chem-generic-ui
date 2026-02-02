/* eslint-disable react/no-unused-prop-types */
/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import sortBy from 'lodash/sortBy';
import {
  FieldTypes,
  genUnits,
  orgLayerObject,
  swapAryEls,
  unitConversion,
} from 'generic-ui-core';
import GenAnaModal from '@components/details/GenAnaModal';
import LayersLayout from '@components/layers/LayersLayout';
import LayerModal from '@/ui/modals/LayerModal';
import Constants from '@components/tools/Constants';
import {
  getWFNode,
  getFlowLayer,
  addToObject,
  removeFromObject,
  reformCondFields,
} from '@components/tools/orten';
import { storeOptions, uploadFiles } from '@components/tools/utils';
import useReducerWithCallback from '@components/tools/useReducerWithCallback';
import splitFlowElements from '@utils/flow/split-flow-elements';
import { genericVariant } from '@utils/pureUtils';
import { addLayer, layerDropReaction } from '@components/details/handler';
import { GenInterfaceProvider } from '@components/details/GenInterfaceContext';
import GeneralDescriptionFields from '@components/details/GeneralDescriptionFields';
import ElementDetailsFields from '@components/details/ElementDetailsFields';
import ResourceContextFields from '@components/details/ResourceContextFields';

const initialState = {
  showViewLayer: false,
  selectedLayerKey: '',
  showAnaModal: false,
};

const reducer = (state, action) => {
  return { ...state, ...action };
};

const GenInterface = (props) => {
  const [state, dispatch] = useReducerWithCallback(reducer, initialState);
  const {
    generic,
    fnChange,
    extLayers,
    genId,
    isPreview,
    isActiveWF,
    isSearch,
    fnNavi,
    isSpCall,
    aiComp,
    expandAll,
    editMode,
    genericType: propGenericType,
    refSource,
  } = props;

  if (Object.keys(generic).length === 0) return null;

  const { container, metadata = {} } = generic;
  const genericType = propGenericType || genericVariant(generic);

  const layerReactionDrop = (_field, _layerKey) => {
    layerDropReaction(generic, _field, _layerKey);
    fnChange(generic);
  };

  const layerReaction = (_layer) => {
    addLayer(generic, _layer, 'REACTION');
    fnChange(generic);
  };

  const layerDrop = (_source, _target) => {
    const { layers } = generic.properties;
    let sortedLayers = sortBy(layers, ['position', 'wf_position']);
    // swap or move
    const srcIdx = sortedLayers.findIndex((e) => e.key === _source);
    const tmpSrc = sortedLayers[srcIdx];
    let tarIdx = sortedLayers.findIndex((e) => e.key === _target);
    if (Math.abs(srcIdx - tarIdx) === 1) {
      sortedLayers = swapAryEls(sortedLayers, srcIdx, tarIdx);
    } else {
      // delete src
      sortedLayers.splice(srcIdx, 1);
      // keep tar
      tarIdx = sortedLayers.findIndex((e) => e.key === _target);
      const tmpTar = sortedLayers[tarIdx];
      // prepare new layer
      tmpSrc.position = tmpTar.position;
      tmpSrc.wf_position = (tmpTar.wf_position || 0) + 1;
      // insert new layer
      sortedLayers.splice(tarIdx + 1, 0, tmpSrc);
    }
    // re-count wf_position
    sortedLayers
      .filter((e) => e.position === tmpSrc.position)
      .map((e, idx) => {
        const el = e;
        el.wf_position = idx;
        return el;
      });
    const ll = orgLayerObject(sortedLayers);
    generic.properties.layers = ll;
    generic.changed = true;
    fnChange(generic);
  };

  const layerDataChange = (event, field, layer) => {
    const { properties } = generic;
    if (event) {
      const value = new Date(event)
        .toLocaleString('en-GB')
        .split(', ')
        .join(' ');
      properties.layers[layer.key][field] = value;
    } else {
      delete properties.layers[layer.key][field]; // remove the attribute of layer if event/value is null
    }
    generic.changed = true;
    fnChange(generic);
  };

  const layerRemove = (elId, layer) => {
    const { layers } = generic.properties;

    // remove layer(layer.key) if needed
    const group = (metadata.groups || []).find((g) =>
      g.layers?.includes(layer.key),
    );
    if (group) {
      const grpIdx = metadata.groups.findIndex((g) => g.id === group.id);
      const grpLayers = metadata.groups[grpIdx].layers || [];
      const layerIdx = grpLayers.indexOf(layer.key);
      if (layerIdx !== -1) {
        grpLayers.splice(layerIdx, 1);
      }
      metadata.groups[grpIdx].layers = grpLayers;
      generic.metadata = metadata;
    }

    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const selectedIdx = sortedLayers.findIndex((e) => e.key === layer.key);
    const selected = sortedLayers[selectedIdx];
    sortedLayers.splice(selectedIdx, 1);
    sortedLayers
      .filter((e) => e.position === selected.position)
      .map((e, idx) => {
        const el = e;
        el.wf_position = idx;
        return el;
      });
    generic.properties.layers = orgLayerObject(sortedLayers);
    generic.changed = true;
    fnChange(generic);
  };

  const layerNext = (event, layer) => {
    const value = event ? event.value : null;
    if (value) {
      const { properties, properties_release } = generic;
      // next step value if exists
      let rmNeeded = false;
      const preValue = properties.layers[`${layer}`].fields.find(
        (e) => e.field === '_wf_next',
      ).value;
      if (value !== preValue) {
        if (preValue && preValue !== '' && preValue !== value) {
          rmNeeded = true;
        }
        const { flow, flowObject } = properties_release;
        const preLayer = properties.layers[`${layer}`];

        const { nodes, edges, viewport } = flowObject
          ? cloneDeep(flowObject)
          : splitFlowElements(flow);

        // value is the next node's id
        const nxLayer = getFlowLayer(
          { nodes, edges, viewport },
          value,
          layer,
          preLayer.wf_position,
        );
        if (nxLayer) {
          properties.layers = addToObject(properties.layers, layer, nxLayer);
        }
        if (rmNeeded) {
          properties.layers = removeFromObject(
            properties.layers,
            layer,
            getWFNode({ nodes, edges, viewport }, preValue),
          );
        }
        // update next step value
        properties.layers[`${layer}`].fields.find(
          (e) => e.field === '_wf_next',
        ).value = value;
        generic.properties = properties;
        generic.changed = true;
        // this.props.onChange(segment, () => renderFlowModal(segment, false));
        fnChange(generic); // cb move to e.g. SampleDetails.js
      }
    }
  };

  const handleLinkAi = (pAiId, pLayer, pAct) => {
    let propsChange = false;
    const { layers } = generic.properties;
    const selectedLayer = layers[pLayer];
    let layerAi = selectedLayer.ai || [];
    switch (pAct) {
      case Constants.BTN_AI_UNLINK:
        layerAi = layerAi.filter((x) => x !== pAiId);
        propsChange = true;
        break;
      case Constants.BTN_AI_LINK:
        layerAi.push(pAiId);
        propsChange = true;
        break;
      default:
        break;
    }
    if (propsChange) {
      selectedLayer.ai = layerAi;
      generic.properties.layers[pLayer] = selectedLayer;
      dispatch({ showAnaModal: false, selectedLayerKey: pLayer }, () => {
        fnChange(generic);
      });
    }
  };

  const handleAddLayer = (event, _layer) => {
    const layer = _layer; // new layer object to add
    const { layers } = generic.properties;
    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const idx = sortedLayers.findIndex((e) => e.key === state.selectedLayerKey);

    // re-set added layer attributes
    const selectedLayer = sortedLayers[idx];
    layer.position = selectedLayer.position;
    layer.wf_position = selectedLayer.wf_position + 1;
    layer.wf = false;
    layer.wf_uuid = null;
    delete layer.cond_fields; // remove cond_fields if any
    // layer is standard layer (from released)
    const cnt = sortedLayers.filter(
      (e) => e.key === layer.key || e.key.startsWith(`${layer.key}.`),
    ).length;
    if (cnt > 0) {
      const origKey = layer.key;
      layer.key = `${layer.key}.${cnt}`;
      layer.fields = reformCondFields(layer, origKey);
    }

    // update if needed - this new added layer is the layer after the selectedLayerKey
    const group = (metadata.groups || []).find((g) =>
      g.layers?.includes(state.selectedLayerKey),
    );
    if (group) {
      // update group's layers - insert after selectedLayerKey
      const grpIdx = metadata.groups.findIndex((g) => g.id === group.id);
      const grpLayers = metadata.groups[grpIdx].layers || [];
      const selectedIdx = grpLayers.indexOf(state.selectedLayerKey);
      if (selectedIdx !== -1) {
        grpLayers.splice(selectedIdx + 1, 0, layer.key);
      } else {
        grpLayers.push(layer.key);
      }
      metadata.groups[grpIdx].layers = grpLayers;
      generic.metadata = metadata;
    }

    // insert new layer
    sortedLayers.splice(idx + 1, 0, layer);
    // re-count wf_position
    sortedLayers
      .filter((e) => e.position === selectedLayer.position)
      .map((e, ix) => {
        const el = e;
        el.wf_position = ix;
        return el;
      });
    const ll = orgLayerObject(sortedLayers);
    generic.properties.layers = ll;
    dispatch({ showViewLayer: false, selectedLayerKey: layer.key }, () => {
      fnChange(generic);
    });
  };

  const handleInputChange = (event, field, layer, type = FieldTypes.F_TEXT) => {
    const { properties } = generic;
    let value = '';
    let propsChange = true;
    switch (type) {
      case 'drop-layer':
        layerDrop(field, layer); // src, tar
        propsChange = false;
        break;
      case 'layer-data-change':
        layerDataChange(event, field, layer);
        propsChange = false;
        break;
      case 'layer-remove':
        event.stopPropagation();
        layerRemove(field, layer);
        propsChange = false;
        break;
      case FieldTypes.F_SYS_REACTION: {
        const { target } = event;
        propsChange = false;
        layerReactionDrop(target, layer);
        break;
      }
      case 'layer-add-reaction':
        event.stopPropagation();
        propsChange = false;
        layerReaction(layer);
        break;
      case 'layer-modal':
        event.stopPropagation();
        propsChange = false;
        dispatch({ showViewLayer: true, selectedLayerKey: layer.key });
        break;
      case 'ana-modal':
        event.stopPropagation();
        propsChange = false;
        dispatch({ showAnaModal: true, selectedLayerKey: layer.key });
        break;
      case FieldTypes.F_WF_NEXT:
        propsChange = false;
        layerNext(event, layer);
        break;
      case FieldTypes.F_CHECKBOX:
        value = event.target.checked;
        break;
      case FieldTypes.F_FORMULA_FIELD:
        if (event.target) {
          ({ value } = event.target);
        } else {
          value = event;
        }
        break;
      case FieldTypes.F_UPLOAD: {
        const vals = uploadFiles(properties, event, field, layer);
        value = vals[0];
        if (vals[1].length > 0)
          generic.files = (generic.files || []).concat(vals[1]);
        if (vals.length > 2) {
          const fileIdx = findIndex(
            generic.files || [],
            (o) => o.uid === event.uid,
          );
          if (fileIdx >= 0 && generic.files && generic.files.length > 0) {
            generic.files.splice(fileIdx, 1);
          }
        }
        break;
      }
      case FieldTypes.F_SELECT:
        value = event ? event.value : null;
        break;
      case FieldTypes.F_SELECT_MULTI:
        value = storeOptions(event || []);
        break;
      case FieldTypes.F_DRAG_MOLECULE:
      case FieldTypes.F_DRAG_SAMPLE:
      case FieldTypes.F_DRAG_ELEMENT:
      case FieldTypes.F_DATETIME_RANGE:
        value = event;
        break;
      case FieldTypes.F_DATETIME:
        value = new Date(event).toLocaleString('en-GB').split(', ').join(' ');
        break;
      case FieldTypes.F_INTEGER:
        ({ value } = event.target);
        value = Math.trunc(value);
        break;
      default:
        ({ value } = event.target);
    }
    if (
      layer === '' &&
      ['name', 'search_name', 'search_short_label'].includes(field)
    ) {
      ({ value } = event.target);
      generic[field] = value;
    }
    if (isSearch && type.startsWith('drag_')) {
      ({ value } = event.target);
    }
    if (propsChange) {
      if (type === FieldTypes.F_DATETIME) {
        if (event) {
          properties.layers[`${layer}`].fields.find(
            (e) => e.field === field,
          ).value = value;
          generic.properties = properties;
          if (isSearch) generic.search_properties = properties;
        } else {
          delete properties.layers[`${layer}`].fields.find(
            (e) => e.field === field,
          ).value;
        }
      } else if (type === FieldTypes.F_SELECT_MULTI) {
        properties.layers[layer].fields.find(
          (e) => e.field === field,
        ).sub_fields = value;
        generic.properties = properties;
        if (isSearch) generic.search_properties = properties;
      } else if (type === FieldTypes.F_DATETIME_RANGE) {
        properties.layers[layer].fields.find(
          (e) => e.field === field,
        ).sub_fields = value;
        generic.properties = properties;
        if (isSearch) generic.search_properties = properties;
      } else if (
        layer === '' &&
        ['name', 'search_name', 'search_short_label'].includes(field)
      ) {
        // console.log(field);
      } else {
        properties.layers[`${layer}`].fields.find(
          (e) => e.field === field,
        ).value = value;
        if (
          type === FieldTypes.F_SYSTEM_DEFINED &&
          (!properties.layers[`${layer}`].fields.find((e) => e.field === field)
            .value_system ||
            properties.layers[`${layer}`].fields.find((e) => e.field === field)
              .value_system === '')
        ) {
          const opt = properties.layers[`${layer}`].fields.find(
            (e) => e.field === field,
          ).option_layers;
          properties.layers[`${layer}`].fields.find(
            (e) => e.field === field,
          ).value_system = genUnits(opt)[0].key;
        }
        generic.properties = properties;
        if (isSearch) generic.search_properties = properties;
      }
      generic.changed = true;
      fnChange(generic);
    }
  };

  const handleSubChange = (layer, obj, valueOnly = false) => {
    const { properties } = generic;
    if (!valueOnly) {
      const subFields =
        properties.layers[`${layer}`].fields.find(
          (m) => m.field === obj.f.field,
        ).sub_fields || [];
      const idxSub = subFields.findIndex((m) => m.id === obj.sub.id);
      subFields.splice(idxSub, 1, obj.sub);
      properties.layers[`${layer}`].fields.find(
        (e) => e.field === obj.f.field,
      ).sub_fields = subFields;
    }
    properties.layers[`${layer}`].fields.find(
      (e) => e.field === obj.f.field,
    ).sub_values = obj.f.sub_values || [];
    generic.properties = properties;
    generic.changed = true;
    fnChange(generic);
  };

  const handleUnitClick = (layer, obj) => {
    const { properties } = generic;
    const newVal = unitConversion(
      obj.option_layers,
      obj.value_system,
      obj.value,
    );
    properties.layers[`${layer}`].fields.find(
      (e) => e.field === obj.field,
    ).value_system = obj.value_system;
    properties.layers[`${layer}`].fields.find(
      (e) => e.field === obj.field,
    ).value = newVal;
    generic.properties = properties;
    generic.changed = true;
    fnChange(generic);
  };

  let ai =
    (container && container.children && container.children[0].children) || [];
  ai = ai.filter((x) => !x.is_new); // get ai is not new

  const paramsLayersLayout = {
    generic,
    // layers: generic.properties.layers,
    // options: generic.properties_release?.select_options || {},
    funcChange: handleInputChange,
    funcSubChange: handleSubChange,
    funcClick: handleUnitClick,
    // classStr: generic?.short_label,
    extLys: extLayers || [],
    id: genId,
    isPreview: isPreview || false,
    activeWF: isActiveWF || false,
    isSearch,
    fnNavi,
    isSpCall,
    hasAi: ai.length > 0,
    aiComp,
    expandAll,
    editMode,
    genericType: genericType,
  };

  const layersLayout = <LayersLayout {...paramsLayersLayout} />;

  const anaModal = (
    <GenAnaModal
      show={state.showAnaModal}
      generic={generic}
      layer={state.selectedLayerKey}
      fnHide={() => dispatch({ showAnaModal: !state.showAnaModal })}
      fnLink={handleLinkAi}
    />
  );

  return (
    <GenInterfaceProvider value={{ refSource }}>
      {genericType === Constants.GENERIC_TYPES.DATASET && (
        <GeneralDescriptionFields
          disabled={false}
          readOnly={false}
        />
      )}
      {genericType === Constants.GENERIC_TYPES.DATASET && (
        <ElementDetailsFields />
      )}
      {genericType === Constants.GENERIC_TYPES.DATASET && (
        <ResourceContextFields />
      )}
      {layersLayout}
      <LayerModal
        show={state.showViewLayer}
        selectedLayerKey={state.selectedLayerKey}
        generic={cloneDeep(generic) || {}}
        fnClose={() => dispatch({ showViewLayer: !state.showViewLayer })}
        fnAdd={handleAddLayer}
      />
      {anaModal}
    </GenInterfaceProvider>
  );
};

GenInterface.propTypes = {
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
  extLayers: PropTypes.array,
  genId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isPreview: PropTypes.bool.isRequired,
  isActiveWF: PropTypes.bool.isRequired,
  isSearch: PropTypes.bool,
  fnNavi: PropTypes.func,
  isSpCall: PropTypes.bool,
  aiComp: PropTypes.any,
  expandAll: PropTypes.bool,
  editMode: PropTypes.bool,
  genericType: PropTypes.string, // from parent only for preview
  refSource: PropTypes.object,
};

GenInterface.defaultProps = {
  extLayers: [],
  isSearch: false,
  genId: 0,
  fnNavi: () => {},
  isSpCall: false,
  aiComp: null,
  expandAll: undefined,
  genericType: '',
  refSource: {
    element: {},
    datasetContainer: {},
    currentUser: {},
    fnRef: () => {},
  },
};

export default GenInterface;
