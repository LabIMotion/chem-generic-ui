/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, findIndex, sortBy } from 'lodash';
import LayersLayout from '../layers/LayersLayout';
import LayerModal from '../layers/LayerModal';
import {
  getWFNode, getFlowLayer, addToObject, removeFromObject, orgLayerObject, reformCondFields
} from '../tools/orten';
import {
  genUnits, swapAryEls, unitConversion, uploadFiles
} from '../tools/utils';

class GenInterface1 extends Component {
  constructor(props) {
    super(props);
    this.state = { showViewLayer: false, selectedLayerKey: '' };
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  layerDrop = (_source, _target) => {
    const { generic, fnChange } = this.props;
    const { layers } = generic.properties;
    let sortedLayers = sortBy(layers, ['position', 'wf_position']);
    // swap or move
    const srcIdx = sortedLayers.findIndex(e => e.key === _source);
    const tmpSrc = sortedLayers[srcIdx];
    let tarIdx = sortedLayers.findIndex(e => e.key === _target);
    if (Math.abs(srcIdx - tarIdx) === 1) {
      sortedLayers = swapAryEls(sortedLayers, srcIdx, tarIdx);
    } else {
      // delete src
      sortedLayers.splice(srcIdx, 1);
      // keep tar
      tarIdx = sortedLayers.findIndex(e => e.key === _target);
      const tmpTar = sortedLayers[tarIdx];
      // prepare new layer
      tmpSrc.position = tmpTar.position;
      tmpSrc.wf_position = (tmpTar.wf_position || 0) + 1;
      // insert new layer
      sortedLayers.splice(tarIdx + 1, 0, tmpSrc);
    }
    // re-count wf_position
    sortedLayers.filter(e => e.position === tmpSrc.position).map((e, idx) => {
      const el = e;
      el.wf_position = idx;
      return el;
    });
    const ll = orgLayerObject(sortedLayers);
    generic.properties.layers = ll;
    generic.changed = true;
    fnChange(generic);
  };

  layerRemove = (elId, layer) => {
    const { generic, fnChange } = this.props;
    const { layers } = generic.properties;
    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const selectedIdx = sortedLayers.findIndex(e => e.key === layer.key);
    const selected = sortedLayers[selectedIdx];
    sortedLayers.splice(selectedIdx, 1);
    sortedLayers.filter(e => e.position === selected.position).map((e, idx) => {
      const el = e;
      el.wf_position = idx;
      return el;
    });
    generic.properties.layers = orgLayerObject(sortedLayers);
    generic.changed = true;
    fnChange(generic);
  };

  layerNext = (event, layer) => {
    const { generic, fnChange } = this.props;
    const value = event ? event.value : null;
    if (value) {
      const { properties, properties_release } = generic;
      // next step value if exists
      let rmNeeded = false;
      const preValue = properties.layers[`${layer}`].fields.find(e => e.field === '_wf_next').value;
      if (value !== preValue) {
        if (preValue && preValue !== '' && preValue !== value) {
          rmNeeded = true;
        }
        const { flow } = properties_release;
        const preLayer = properties.layers[`${layer}`];
        // value is the next node's id
        const nxLayer = getFlowLayer(flow, value, layer, preLayer.wf_position);
        if (nxLayer) {
          properties.layers = addToObject(properties.layers, layer, nxLayer);
        }
        if (rmNeeded) {
          properties.layers = removeFromObject(properties.layers, layer, getWFNode(flow, preValue));
        }
        // update next step value
        properties.layers[`${layer}`].fields.find(e => e.field === '_wf_next').value = value;
        generic.properties = properties;
        generic.changed = true;
        // this.props.onChange(segment, () => renderFlowModal(segment, false));
        fnChange(generic); // cb move to e.g. SampleDetails.js
      }
    }
  };

  handleAddLayer = (event, _layer) => {
    const { generic, fnChange } = this.props;
    const { selectedLayerKey } = this.state;
    console.log('handleAddLayer');
    const layer = _layer;
    const { layers } = generic.properties;
    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const idx = sortedLayers.findIndex(e => e.key === selectedLayerKey);
    // re-set added layer attributes
    const selectedLayer = sortedLayers[idx];
    layer.position = selectedLayer.position;
    layer.wf_position = selectedLayer.wf_position + 1;
    layer.wf = false;
    layer.wf_uuid = null;
    // layer is standard layer (from released)
    const cnt = sortedLayers
      .filter(e => e.key === layer.key || e.key.startsWith(`${layer.key}.`)).length;
    if (cnt > 0) {
      const origKey = layer.key;
      layer.key = `${layer.key}.${cnt}`;
      layer.fields = reformCondFields(layer, origKey);
    }
    // insert new layer
    sortedLayers.splice(idx + 1, 0, layer);
    // re-count wf_position
    sortedLayers.filter(e => e.position === selectedLayer.position).map((e, ix) => {
      const el = e;
      el.wf_position = ix;
      return el;
    });
    const ll = orgLayerObject(sortedLayers);
    generic.properties.layers = ll;
    this.setState({ showViewLayer: false, selectedLayerKey: layer.key }, () => fnChange(generic));
  };

  handleInputChange = (event, field, layer, type = 'text') => {
    const { generic, fnChange, isSearch } = this.props;
    const { properties } = generic;
    let value = '';
    let propsChange = true;
    switch (type) {
      case 'drop-layer':
        this.layerDrop(field, layer);
        propsChange = false;
        break;
      case 'layer-remove':
        event.stopPropagation();
        this.layerRemove(field, layer);
        propsChange = false;
        break;
      case 'layer-modal':
        event.stopPropagation();
        propsChange = false;
        this.setState({ showViewLayer: true, selectedLayerKey: layer.key });
        break;
      case 'wf-next':
        propsChange = false;
        this.layerNext(event, layer);
        break;
      case 'checkbox':
        value = event.target.checked;
        break;
      case 'formula-field':
        if (event.target) {
          ({ value } = event.target);
        } else {
          value = event;
        }
        break;
      case 'upload': {
        const vals = uploadFiles(properties, event, field, layer);
        value = vals[0];
        if (vals[1].length > 0) generic.files = (generic.files || []).concat(vals[1]);
        if (vals.length > 2) {
          const fileIdx = findIndex((generic.files || []), o => o.uid === event.uid);
          if (fileIdx >= 0 && generic.files && generic.files.length > 0) {
            generic.files.splice(fileIdx, 1);
          }
        }
        break;
      }
      case 'select':
        value = event ? event.value : null;
        break;
      case 'drag_molecule':
        value = event;
        break;
      case 'drag_sample':
        value = event;
        break;
      case 'drag_element':
        value = event;
        break;
      case 'integer':
        ({ value } = event.target);
        value = Math.trunc(value);
        break;
      default:
        ({ value } = event.target);
    }
    if (layer === '' && field === 'name') generic.name = value;
    if (layer === '' && field === 'search_name') generic.search_name = value;
    if (layer === '' && field === 'search_short_label') generic.search_short_label = value;

    if (propsChange) {
      properties.layers[`${layer}`].fields.find(e => e.field === field).value = value;
      if (type === 'system-defined' && (!properties.layers[`${layer}`].fields.find(e => e.field === field).value_system || properties.layers[`${layer}`].fields.find(e => e.field === field).value_system === '')) {
        const opt = properties.layers[`${layer}`].fields
          .find(e => e.field === field).option_layers;
        properties.layers[`${layer}`].fields
          .find(e => e.field === field).value_system = genUnits(opt)[0].key;
      }
      generic.properties = properties;
      if (isSearch) generic.search_properties = properties;
      generic.changed = true;
      fnChange(generic);
    }
  };

  handleSubChange = (layer, obj, valueOnly = false) => {
    const { generic, fnChange } = this.props;
    const { properties } = generic;
    if (!valueOnly) {
      const subFields = properties.layers[`${layer}`].fields
        .find(m => m.field === obj.f.field).sub_fields || [];
      const idxSub = subFields.findIndex(m => m.id === obj.sub.id);
      subFields.splice(idxSub, 1, obj.sub);
      properties.layers[`${layer}`].fields
        .find(e => e.field === obj.f.field).sub_fields = subFields;
    }
    properties.layers[`${layer}`].fields
      .find(e => e.field === obj.f.field).sub_values = obj.f.sub_values || [];
    generic.properties = properties;
    generic.changed = true;
    fnChange(generic);
  };

  handleUnitClick = (layer, obj) => {
    const { generic, fnChange } = this.props;
    const { properties } = generic;
    const newVal = unitConversion(obj.option_layers, obj.value_system, obj.value);
    properties.layers[`${layer}`].fields.find(e => e.field === obj.field).value_system = obj.value_system;
    properties.layers[`${layer}`].fields.find(e => e.field === obj.field).value = newVal;
    generic.properties = properties;
    generic.changed = true;
    fnChange(generic);
  };

  render() {
    const {
      generic, extLayers, genId, isPreview, isActiveWF, isSearch, fnNavi
    } = this.props;
    const { showViewLayer } = this.state;
    if (Object.keys(generic).length !== 0) {
      const layersLayout = LayersLayout(
        generic.properties.layers,
        generic.properties_release.select_options || {},
        this.handleInputChange,
        this.handleSubChange,
        this.handleUnitClick,
        extLayers,
        genId,
        isPreview,
        isActiveWF,
        isSearch,
        fnNavi
      );

      const addLayerModal = (
        <LayerModal
          show={showViewLayer}
          layers={cloneDeep(generic.properties_release.layers) || {}}
          fnClose={() => this.setState({ showViewLayer: !showViewLayer })}
          fnAdd={this.handleAddLayer}
        />
      );

      return (
        <div>
          {layersLayout}
          {addLayerModal}
        </div>
      );
    }
    return null;
  }
}

GenInterface1.propTypes = {
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
  extLayers: PropTypes.array,
  genId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isPreview: PropTypes.bool.isRequired,
  isActiveWF: PropTypes.bool.isRequired,
  isSearch: PropTypes.bool,
  fnNavi: PropTypes.func
};

GenInterface1.defaultProps = {
  extLayers: [],
  isSearch: false,
  genId: 0,
  fnNavi: () => {}
};

export default GenInterface1;
