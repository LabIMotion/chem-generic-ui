/* eslint-disable no-restricted-globals */
/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findIndex, cloneDeep, sortBy } from 'lodash';
import { Panel } from 'react-bootstrap';
// import { DragDropContext } from 'react-dnd';
// import HTML5Backend from 'react-dnd-html5-backend';
import LayersLayout from '../layers/LayersLayout';
import { genUnits, toBool, toNum, swapAryEls, unitConversion, uploadFiles } from '../tools/utils';
import { getWFNode, orgLayerObject, getFlowLayer, addToObject, removeFromObject, reformCondFields } from '../tools/orten';
import organizeSubValues from '../tools/collate';
import LayerModal from '../layers/LayerModal';

class SegmentDetails extends Component {
  constructor(props) {
    super(props);
    this.state = { showViewLayer: false, selectedLayerKey: '' };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubChange = this.handleSubChange.bind(this);
    this.handleUnitClick = this.handleUnitClick.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.setViewLayer = this.setViewLayer.bind(this);
    this.dropLayer = this.dropLayer.bind(this);
    this.removeLayer = this.removeLayer.bind(this);
    this.handleWFNext = this.handleWFNext.bind(this);
  }

  setViewLayer() {
    this.setState({ showViewLayer: !this.state.showViewLayer });
  }

  handleSubChange(layer, obj, valueOnly = false) {
    const { segment } = this.props;
    const { properties } = segment;
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
    segment.properties = properties;
    segment.changed = true;
    this.props.onChange(segment);
  }

  handleInputChange(event, field, layer, type = 'text') {
    const { segment } = this.props;
    const { properties } = segment;
    let value = '';
    let propsChange = true;
    switch (type) {
      case 'drop-layer':
        this.dropLayer(field, layer);
        propsChange = false;
        break;
      case 'layer-remove':
        event.stopPropagation();
        this.removeLayer(field, layer);
        propsChange = false;
        break;
      case 'layer-modal':
        event.stopPropagation();
        propsChange = false;
        this.setState({ selectedLayerKey: layer.key, showViewLayer: true });
        break;
      case 'wf-next':
        propsChange = false;
        this.handleWFNext(event, layer);
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
        if (vals[1].length > 0) segment.files = (segment.files || []).concat(vals[1]);
        if (vals.length > 2) {
          const fileIdx = findIndex((segment.files || []), o => o.uid === event.uid);
          if (fileIdx >= 0 && segment.files && segment.files.length > 0) {
            segment.files.splice(fileIdx, 1);
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
      case 'integer':
        ({ value } = event.target);
        value = Math.trunc(value);
        break;
      default:
        ({ value } = event.target);
    }
    if (propsChange) {
      properties.layers[`${layer}`].fields.find(e => e.field === field).value = value;
      if (type === 'system-defined' && (!properties.layers[`${layer}`].fields.find(e => e.field === field).value_system || properties.layers[`${layer}`].fields.find(e => e.field === field).value_system === '')) {
        const opt = properties.layers[`${layer}`].fields
          .find(e => e.field === field).option_layers;
        properties.layers[`${layer}`].fields
          .find(e => e.field === field).value_system = genUnits(opt)[0].key;
      }
      segment.properties = properties;
      segment.changed = true;
      this.props.onChange(segment);
    }
  }

  handleUnitClick(layer, obj) {
    const { segment } = this.props;
    const { properties } = segment;
    const newVal = unitConversion(obj.option_layers, obj.value_system, obj.value);
    properties.layers[`${layer}`].fields
      .find(e => e.field === obj.field).value_system = obj.value_system;
    properties.layers[`${layer}`].fields.find(e => e.field === obj.field).value = newVal;
    segment.properties = properties;
    segment.changed = true;
    this.props.onChange(segment);
  }

  handleReload() {
    const { klass, segment } = this.props;
    const newProps = cloneDeep(klass.properties_release);
    newProps.klass_uuid = klass.uuid;
    Object.keys(newProps.layers).forEach((key) => {
      const newLayer = newProps.layers[key] || {};
      const curFields = (segment.properties.layers[key] && segment.properties.layers[key].fields)
        || [];
      (newLayer.fields || []).forEach((f, idx) => {
        const curIdx = findIndex(curFields, o => o.field === f.field);
        if (curIdx >= 0) {
          const curVal = segment.properties.layers[key].fields[curIdx].value;
          const curType = typeof curVal;
          if (['select', 'text', 'textarea', 'formula-field'].includes(newProps.layers[key].fields[idx].type)) {
            newProps.layers[key].fields[idx].value = curType !== 'undefined' ? curVal.toString() : '';
          }
          if (newProps.layers[key].fields[idx].type === 'integer') {
            newProps.layers[key].fields[idx].value = (curType === 'undefined' || curType === 'boolean' || isNaN(curVal)) ? 0 : parseInt(curVal, 10);
          }
          if (newProps.layers[key].fields[idx].type === 'checkbox') {
            newProps.layers[key].fields[idx].value = curType !== 'undefined' ? toBool(curVal) : false;
          }
          if (newProps.layers[key].fields[idx].type === 'system-defined') {
            const units = genUnits(newProps.layers[key].fields[idx].option_layers);
            const vs = units.find(u =>
              u.key === segment.properties.layers[key].fields[curIdx].value_system);
            newProps.layers[key].fields[idx].value_system = (vs && vs.key) || units[0].key;
            newProps.layers[key].fields[idx].value = toNum(curVal);
          }
          if (newProps.layers[key].fields[idx].type === 'input-group') {
            if (segment.properties.layers[key].fields[curIdx].type !==
              newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].value = undefined;
            } else {
              const nSubs = newProps.layers[key].fields[idx].sub_fields || [];
              const cSubs = segment.properties.layers[key].fields[curIdx].sub_fields || [];
              const exSubs = [];
              if (nSubs.length < 1) {
                newProps.layers[key].fields[idx].value = undefined;
              } else {
                nSubs.forEach((nSub) => {
                  const hitSub = cSubs.find(c => c.id === nSub.id) || {};
                  if (nSub.type === 'label') { exSubs.push(nSub); }
                  if (nSub.type === 'text') {
                    if (hitSub.type === 'label') {
                      exSubs.push(nSub);
                    } else { exSubs.push({ ...nSub, value: (hitSub.value || '').toString() }); }
                  }

                  if (['number', 'system-defined'].includes(nSub.type)) {
                    const nvl = (typeof hitSub.value === 'undefined' || hitSub.value == null || hitSub.value.length === 0) ? '' : toNum(hitSub.value);
                    if (nSub.option_layers === hitSub.option_layers) {
                      exSubs.push({ ...nSub, value: nvl, value_system: hitSub.value_system });
                    } else {
                      exSubs.push({ ...nSub, value: nvl });
                    }
                  }
                });
              }
              newProps.layers[key].fields[idx].sub_fields = exSubs;
            }
          }
          if (newProps.layers[key].fields[idx].type === 'upload') {
            if (segment.properties.layers[key].fields[curIdx].type ===
              newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].value =
              segment.properties.layers[key].fields[curIdx].value;
            } else {
              newProps.layers[key].fields[idx].value = {};
            }
          }
          if (newProps.layers[key].fields[idx].type === 'table') {
            if (segment.properties.layers[key].fields[curIdx].type !==
              newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].sub_values = [];
            } else {
              newProps.layers[key].fields[idx].sub_values =
              organizeSubValues(
                newProps.layers[key].fields[idx],
                segment.properties.layers[key].fields[curIdx]
              );
            }
          }
        }
      });
    });
    segment.properties = newProps;
    segment.changed = true;
    this.props.onChange(segment);
  }

  handleAddLayer(event, _layer) {
    const { segment } = this.props;
    const { selectedLayerKey } = this.state;
    const layer = _layer;
    const { layers } = segment.properties;
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
    segment.properties.layers = ll;
    this.setState(
      { selectedLayerKey: layer.key, showViewLayer: false },
      this.props.onChange(segment)
    );
  }

  dropLayer(_source, _target) {
    const { segment } = this.props;
    const { layers } = segment.properties;
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
    segment.properties.layers = ll;
    segment.changed = true;
    this.props.onChange(segment);
  }

  removeLayer(elId, layer) {
    const { segment } = this.props;
    const { layers } = segment.properties;
    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const selectedIdx = sortedLayers.findIndex(e => e.key === layer.key);
    const selected = sortedLayers[selectedIdx];
    sortedLayers.splice(selectedIdx, 1);
    sortedLayers.filter(e => e.position === selected.position).map((e, idx) => {
      const el = e;
      el.wf_position = idx;
      return el;
    });
    segment.properties.layers = orgLayerObject(sortedLayers);
    segment.changed = true;
    this.props.onChange(segment);
  }

  handleWFNext(event, layer) {
    const value = event ? event.value : null;
    if (value) {
      const { segment } = this.props;
      const { properties, properties_release } = segment;
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
        segment.properties = properties;
        segment.changed = true;
        // this.props.onChange(segment, () => renderFlowModal(segment, false));
        this.props.onChange(segment); // cb move to e.g. SampleDetails.js
      }
    }
  }

  elementalPropertiesItem(segment) {
    const layersLayout = LayersLayout(
      segment.properties.layers,
      segment.properties_release.select_options || {},
      this.handleInputChange,
      this.handleSubChange,
      this.handleUnitClick,
      [], 0, false, true
    );
    return (<div style={{ margin: '5px' }}>{layersLayout}</div>);
  }

  render() {
    const { uiCtrl, segment } = this.props;
    if (!uiCtrl || Object.keys(segment).length === 0) return null;
    const { showViewLayer } = this.state;
    const addLayerModal = (
      <LayerModal
        show={showViewLayer}
        layers={cloneDeep(segment.properties_release.layers) || {}}
        fnClose={this.setViewLayer}
        fnAdd={this.handleAddLayer}
      />
    );
    return (
      <div>
        <Panel>
          <Panel.Body style={{ position: 'relative', minHeight: 260, overflowY: 'unset' }}>
            {this.elementalPropertiesItem(segment)}
          </Panel.Body>
        </Panel>
        {addLayerModal}
      </div>
    );
  }
}

SegmentDetails.propTypes = {
  uiCtrl: PropTypes.bool.isRequired,
  segment: PropTypes.object,
  klass: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

SegmentDetails.defaultProps = { segment: {}, klass: {} };

// export default DragDropContext(HTML5Backend)(SegmentDetails);
export default SegmentDetails;
