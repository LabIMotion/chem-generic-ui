/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Button, ButtonToolbar, ButtonGroup, ListGroupItem, Tabs, Tab, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { findIndex, sortBy, cloneDeep } from 'lodash';
import DetailActions from '../actions/DetailActions';
import LoadingActions from '../actions/LoadingActions';
import ElementActions from '../actions/ElementActions';
import ElementStore from '../stores/ElementStore';
import UIActions from '../actions/UIActions';
import UIStore from '../stores/UIStore';
import ConfirmClose from '../common/ConfirmClose';
import GenericElDetailsContainers from './GenericElDetailsContainers';
import { GenProperties, LayersLayout, UploadInputChange } from './GenericElCommon';
import GenericEl from '../models/GenericEl';
import Attachment from '../models/Attachment';
import CopyElementModal from '../common/CopyElementModal';
import { notification, genUnits, toBool, toNum, unitConversion, swapAryEls, renderFlowModal } from '../../admin/generic/Utils';
import { organizeSubValues } from '../../admin/generic/collate';
import GenericAttachments from './GenericAttachments';
import { SegmentTabs } from './SegmentDetails';
import { getWFNode, getFlowLayer, addToObject, removeFromObject, orgLayerObject, reformCondFields } from '../../admin/generic/orten';
import LayerModal from './LayerModal';
import FlowViewerBtn from './FlowViewerBtn';
import RevisionViewerBtn from './RevisionViewerBtn';

export default class GenericElDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genericEl: props.genericEl, activeTab: 0, showViewLayer: false, selectedLayerKey: '' // , showWorkflow: false
    };
    this.onChangeUI = this.onChangeUI.bind(this);
    this.onChangeElement = this.onChangeElement.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubChange = this.handleSubChange.bind(this);
    this.handleUnitClick = this.handleUnitClick.bind(this);
    this.handleAttachmentDrop = this.handleAttachmentDrop.bind(this);
    this.handleAttachmentDelete = this.handleAttachmentDelete.bind(this);
    this.handleAttachmentEdit = this.handleAttachmentEdit.bind(this);
    this.handleSegmentsChange = this.handleSegmentsChange.bind(this);
    this.handleRetriveRevision = this.handleRetriveRevision.bind(this);
    this.handleWFNext = this.handleWFNext.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.setViewLayer = this.setViewLayer.bind(this);
    this.dropLayer = this.dropLayer.bind(this);
    this.removeLayer = this.removeLayer.bind(this);
  }

  componentDidMount() {
    UIStore.listen(this.onChangeUI);
    ElementStore.listen(this.onChangeElement);
  }

  componentWillUnmount() {
    UIStore.unlisten(this.onChangeUI);
    ElementStore.unlisten(this.onChangeElement);
  }

  onChangeElement(state) {
    if (state.currentElement) {
      if (state.currentElement !== this.state.genericEl && (state.currentElement.klassType === 'GenericEl' && state.currentElement.type != null)) {
        this.setState({ genericEl: state.currentElement });
      }
    }
  }

  onChangeUI(state) {
    if (state[this.state.genericEl.type]) {
      if (state[this.state.genericEl.type].activeTab !== this.state.activeTab) {
        this.setState({ activeTab: state[this.state.genericEl.type].activeTab });
      }
    }
  }

  setViewLayer() {
    this.setState({ showViewLayer: !this.state.showViewLayer });
  }

  handleGenericElChanged(el) {
    const genericEl = el;
    genericEl.changed = true;
    this.setState({ genericEl }, () => renderFlowModal(genericEl, false));
  }

  handleSelect(eventKey, type) {
    UIActions.selectTab({ tabKey: eventKey, type });
    UIActions.showGenericWorkflowModal.defer(false);
    this.setState({ activeTab: eventKey });
  }

  handleRetriveRevision(revision, cb) {
    const { genericEl } = this.state;
    genericEl.properties = revision;
    genericEl.changed = true;
    this.setState({ genericEl }, cb);
  }

  handleReload() {
    const { genericEl } = this.state;
    const newProps = genericEl.element_klass.properties_release;
    newProps.klass_uuid = genericEl.element_klass.uuid;
    Object.keys(newProps.layers).forEach((key) => {
      const newLayer = newProps.layers[key] || {};
      const curFields = (genericEl.properties.layers[key] &&
        genericEl.properties.layers[key].fields) || [];
      (newLayer.fields || []).forEach((f, idx) => {
        const curIdx = findIndex(curFields, o => o.field === f.field);
        if (curIdx >= 0) {
          const curVal = genericEl.properties.layers[key].fields[curIdx].value;
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
          if ((newProps.layers[key].fields[idx].type === 'drag_sample' && genericEl.properties.layers[key].fields[curIdx].type === 'drag_sample')
          || (newProps.layers[key].fields[idx].type === 'drag_molecule' && genericEl.properties.layers[key].fields[curIdx].type === 'drag_molecule')) {
            if (typeof curVal !== 'undefined') newProps.layers[key].fields[idx].value = curVal;
          }
          if (newProps.layers[key].fields[idx].type === 'system-defined') {
            const units = genUnits(newProps.layers[key].fields[idx].option_layers);
            const vs = units.find(u =>
              u.key === genericEl.properties.layers[key].fields[curIdx].value_system);
            newProps.layers[key].fields[idx].value_system = (vs && vs.key) || units[0].key;
            newProps.layers[key].fields[idx].value = toNum(curVal);
          }
          if (newProps.layers[key].fields[idx].type === 'input-group') {
            if (genericEl.properties.layers[key].fields[curIdx].type !==
              newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].value = undefined;
            } else {
              const nSubs = newProps.layers[key].fields[idx].sub_fields || [];
              const cSubs = genericEl.properties.layers[key].fields[curIdx].sub_fields || [];
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
            if (genericEl.properties.layers[key].fields[curIdx].type ===
              newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].value =
              genericEl.properties.layers[key].fields[curIdx].value;
            } else {
              newProps.layers[key].fields[idx].value = {};
            }
          }
          if (newProps.layers[key].fields[idx].type === 'table') {
            if (genericEl.properties.layers[key].fields[curIdx].type !==
              newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].sub_values = [];
            } else {
              newProps.layers[key].fields[idx].sub_values =
              organizeSubValues(
                newProps.layers[key].fields[idx],
                genericEl.properties.layers[key].fields[curIdx]
              );
            }
          }
        }
      });
    });
    genericEl.changed = true;
    genericEl.properties = newProps;
    this.setState({ genericEl });
  }

  handleSubmit(closeView = false) {
    const { genericEl } = this.state;
    const el = new GenericEl(genericEl);
    if (!el.isValidated()) {
      notification({
        title: 'Save failed!', lvl: 'error', msg: 'Please fill out all required fields!', uid: 'save_mof_notification'
      });
      return false;
    }
    LoadingActions.start();
    genericEl.name = genericEl.name.trim();
    (Object.keys(genericEl.properties.layers) || {}).forEach((key) => {
      genericEl.properties.layers[key].fields = (genericEl.properties.layers[key].fields || [])
        .map((f) => {
          const field = f;
          if (field.type === 'text' && typeof field.value !== 'undefined' && field.value != null) {
            field.value = field.value.trim();
          }
          return (field);
        });
    });
    if (genericEl && genericEl.isNew) {
      ElementActions.createGenericEl(genericEl);
    } else {
      ElementActions.updateGenericEl(genericEl, closeView);
    }
    if (genericEl.is_new || closeView) {
      DetailActions.close(genericEl, true);
    }
    return true;
  }

  handleSubChange(layer, obj, valueOnly = false) {
    const { genericEl } = this.state;
    const { properties } = genericEl;
    if (!valueOnly) {
      const subFields = properties.layers[`${layer}`].fields.find(m => m.field === obj.f.field).sub_fields || [];
      const idxSub = subFields.findIndex(m => m.id === obj.sub.id);
      subFields.splice(idxSub, 1, obj.sub);
      properties.layers[`${layer}`].fields.find(e => e.field === obj.f.field).sub_fields = subFields;
    }
    properties.layers[`${layer}`].fields.find(e => e.field === obj.f.field).sub_values = obj.f.sub_values || [];
    genericEl.properties = properties;
    this.handleGenericElChanged(genericEl);
  }

  // 'wf-next', current layer.key
  handleWFNext(event, layer) {
    const value = event ? event.value : null;
    if (value) {
      const { genericEl } = this.state;
      const { properties, properties_release } = genericEl;
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
        genericEl.properties = properties;
        this.handleGenericElChanged(genericEl);
      }
    }
  }

  handleAddLayer(event, _layer) {
    const { selectedLayerKey, genericEl } = this.state;
    const layer = _layer;
    const { layers } = genericEl.properties;
    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const idx = sortedLayers.findIndex(e => e.key === selectedLayerKey);
    // re-set added layer attributes
    const selectedLayer = sortedLayers[idx];
    layer.position = selectedLayer.position;
    layer.wf_position = selectedLayer.wf_position + 1;
    layer.wf = false;
    layer.wf_uuid = null;
    // layer is standard layer (from released)
    const cnt = sortedLayers.filter(e => e.key === layer.key || e.key.startsWith(`${layer.key}.`)).length;
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
    genericEl.properties.layers = ll;
    this.handleGenericElChanged(genericEl);
    this.setState({ selectedLayerKey: layer.key, showViewLayer: false });
  }

  dropLayer(_source, _target) {
    const { genericEl } = this.state;
    const { layers } = genericEl.properties;
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

    /* START */
    // keep src
    // const srcIdx = sortedLayers.findIndex(e => e.key === _source);
    // const tmpSrc = sortedLayers[srcIdx];
    // // delete src
    // sortedLayers.splice(srcIdx, 1);

    // // keep tar
    // const tarIdx = sortedLayers.findIndex(e => e.key === _target);
    // const tmpTar = sortedLayers[tarIdx];

    // // prepare new layer
    // tmpSrc.position = tmpTar.position;
    // tmpSrc.wf_position = (tmpTar.wf_position || 0) + 1;

    // // insert new layer
    // sortedLayers.splice(tarIdx + 1, 0, tmpSrc);
    /* END */

    // re-count wf_position
    sortedLayers.filter(e => e.position === tmpSrc.position).map((e, idx) => {
      const el = e;
      el.wf_position = idx;
      return el;
    });

    const ll = orgLayerObject(sortedLayers);
    genericEl.properties.layers = ll;
    this.handleGenericElChanged(genericEl);
  }

  removeLayer(elId, layer) {
    const { genericEl } = this.state;
    const { layers } = genericEl.properties;
    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const selectedIdx = sortedLayers.findIndex(e => e.key === layer.key);
    const selected = sortedLayers[selectedIdx];
    sortedLayers.splice(selectedIdx, 1);
    sortedLayers.filter(e => e.position === selected.position).map((e, idx) => {
      const el = e;
      el.wf_position = idx;
      return el;
    });
    genericEl.properties.layers = orgLayerObject(sortedLayers);
    this.handleGenericElChanged(genericEl);
  }

  handleInputChange(event, field, layer, type = 'text') {
    if (type === 'drop-layer') {
      this.dropLayer(field, layer);
    } else if (type === 'layer-remove') {
      event.stopPropagation();
      this.removeLayer(field, layer);
    } else if (type === 'layer-modal') {
      event.stopPropagation();
      this.setState({ selectedLayerKey: layer.key, showViewLayer: true });
    } else if (type === 'wf-next') {
      this.handleWFNext(event, layer);
    } else {
      const { genericEl } = this.state;
      const { properties } = genericEl;
      let value = '';
      if (type === 'select') {
        value = event ? event.value : null;
      } else if (type.startsWith('drag')) {
        value = event;
      } else if (type === 'checkbox') {
        value = event.target.checked;
      } else if (type === 'upload') {
        const vals = UploadInputChange(properties, event, field, layer);
        value = vals[0];
        if (vals[1].length > 0) genericEl.files = (genericEl.files || []).concat(vals[1]);
        if (vals.length > 2) {
          const fileIdx = findIndex((genericEl.files || []), o => o.uid === event.uid);
          if (fileIdx >= 0 && genericEl.files && genericEl.files.length > 0) {
            genericEl.files.splice(fileIdx, 1);
          }
        }
      } else if (type === 'formula-field') {
        if (event.target) {
          ({ value } = event.target);
        } else {
          value = event;
        }
      } else {
        ({ value } = event.target);
      }
      if (field === 'name' && layer === '') {
        genericEl.name = value;
      } else {
        properties.layers[`${layer}`].fields.find(e => e.field === field).value = value;
        if (type === 'system-defined' && (!properties.layers[`${layer}`].fields.find(e => e.field === field).value_system || properties.layers[`${layer}`].fields.find(e => e.field === field).value_system === '')) {
          const opt = properties.layers[`${layer}`].fields.find(e => e.field === field).option_layers;
          properties.layers[`${layer}`].fields.find(e => e.field === field).value_system = genUnits(opt)[0].key;
        }
      }
      genericEl.properties = properties;
      this.handleGenericElChanged(genericEl);
    }
  }

  handleUnitClick(layer, obj) {
    const { genericEl } = this.state;
    const { properties } = genericEl;
    const newVal = unitConversion(obj.option_layers, obj.value_system, obj.value);
    properties.layers[`${layer}`].fields.find(e => e.field === obj.field).value_system = obj.value_system;
    properties.layers[`${layer}`].fields.find(e => e.field === obj.field).value = newVal;
    genericEl.properties = properties;
    this.handleGenericElChanged(genericEl);
  }

  handleAttachmentDrop(files) {
    const { genericEl } = this.state;
    files.map(file => genericEl.attachments.push(Attachment.fromFile(file)));
    this.handleGenericElChanged(genericEl);
  }

  handleAttachmentDelete(attachment, isDelete = true) {
    const { genericEl } = this.state;
    const index = genericEl.attachments.indexOf(attachment);
    genericEl.attachments[index].is_deleted = isDelete;
    this.handleGenericElChanged(genericEl);
  }

  handleAttachmentEdit(attachment) {
    const { genericEl } = this.state;
    genericEl.attachments.map((currentAttachment) => {
      if (currentAttachment.id === attachment.id) return attachment;
    });
    this.handleGenericElChanged(genericEl);
  }

  handleSegmentsChange(se) {
    const { genericEl } = this.state;
    const { segments } = genericEl;
    const idx = findIndex(segments, o => o.segment_klass_id === se.segment_klass_id);
    if (idx >= 0) { segments.splice(idx, 1, se); } else { segments.push(se); }
    genericEl.segments = segments;
    genericEl.changed = true;
    this.setState({ genericEl });
  }

  elementalPropertiesItem(genericEl) {
    const options = [];
    const defaultName = <GenProperties key={`${genericEl.id}_elementalPropertiesItem`} label="" description={genericEl.description || ''} value={genericEl.name || ''} type="text" onChange={event => this.handleInputChange(event, 'name', '')} isEditable readOnly={false} isRequired />;
    options.push(defaultName);
    const layersLayout = LayersLayout(
      genericEl.properties.layers,
      genericEl.properties_release.select_options || {},
      this.handleInputChange,
      this.handleSubChange,
      this.handleUnitClick,
      options,
      genericEl.id || 0
    );
    const reloadBtn = (genericEl && (typeof genericEl.klass_uuid === 'undefined' || genericEl.klass_uuid === genericEl.element_klass.uuid || genericEl.is_new)) ? null : (
      <OverlayTrigger delayShow={1000} placement="top" overlay={<Tooltip id="_tooltip_reload">click to reload the template</Tooltip>}>
        <Button bsSize="xsmall" bsStyle="primary" onClick={() => this.handleReload()} disabled>Reload&nbsp;<i className="fa fa-refresh" aria-hidden="true" /></Button>
      </OverlayTrigger>
    );
    return (
      <div>
        <div>
          <ButtonToolbar style={{ margin: '5px 0px' }}>
            <ButtonGroup>
              <FlowViewerBtn generic={genericEl} />
              <RevisionViewerBtn fnRetrive={this.handleRetriveRevision} generic={genericEl} />
              {reloadBtn}
            </ButtonGroup>
          </ButtonToolbar>
        </div>
        {layersLayout}
      </div>
    );
  }

  propertiesTab(ind) {
    const genericEl = this.state.genericEl || {};
    return (
      <Tab eventKey={ind} title="Properties" key={`Props_${genericEl.id}`}>
        {this.elementalPropertiesItem(genericEl)}
        <LayerModal
          show={this.state.showViewLayer}
          layers={cloneDeep(genericEl.properties_release.layers) || {}}
          fnClose={this.setViewLayer}
          fnAdd={this.handleAddLayer}
        />
      </Tab>
    );
  }

  containersTab(ind) {
    const { genericEl } = this.state;
    return (
      <Tab eventKey={ind} title="Analyses" key={`Container_${genericEl.id}`}>
        <ListGroupItem style={{ paddingBottom: 20 }}>
          <GenericElDetailsContainers
            genericEl={genericEl}
            parent={this}
            readOnly={false}
          />
        </ListGroupItem>
      </Tab>
    );
  }

  attachmentsTab(ind) {
    const { genericEl } = this.state;
    return (
      <Tab eventKey={ind} title="Attachments" key={`Attachment_${genericEl.id}`}>
        <ListGroupItem style={{ paddingBottom: 20 }}>
          <GenericAttachments
            attachments={genericEl.attachments}
            onDrop={this.handleAttachmentDrop}
            onDelete={this.handleAttachmentDelete}
            onEdit={this.handleAttachmentEdit}
            readOnly={false}
          />
        </ListGroupItem>
      </Tab>
    );
  }

  header(genericEl) {
    const iconClass = (genericEl.element_klass && genericEl.element_klass.icon_name) || '';
    const { currentCollection } = UIStore.getState();
    const defCol = currentCollection && currentCollection.is_shared === false &&
    currentCollection.is_locked === false && currentCollection.label !== 'All' ? currentCollection.id : null;
    const copyBtn = (genericEl.can_copy && !genericEl.isNew) ? (
      <CopyElementModal element={genericEl} defCol={defCol} />
    ) : null;
    const saveBtnDisplay = genericEl.changed ? '' : 'none';
    const datetp = `Created at: ${genericEl.created_at} \n Updated at: ${genericEl.updated_at}`;
    return (
      <div>
        <OverlayTrigger placement="bottom" overlay={<Tooltip id="genericElDatesx">{datetp}</Tooltip>}>
          <span><i className={iconClass} />&nbsp;<span>{genericEl.short_label}</span> &nbsp;</span>
        </OverlayTrigger>
        <ConfirmClose el={genericEl} />
        {copyBtn}
        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tip_fullscreen_btn">FullScreen</Tooltip>}>
          <Button bsStyle="info" bsSize="xsmall" className="button-right" onClick={() => this.props.toggleFullScreen()}>
            <i className="fa fa-expand" aria-hidden="true" />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="saveScreen">Save</Tooltip>}
        >
          <Button
            bsStyle="warning"
            bsSize="xsmall"
            className="button-right"
            onClick={() => this.handleSubmit()}
            style={{ display: saveBtnDisplay }}
          >
            <i className="fa fa-floppy-o" aria-hidden="true" />
          </Button>
        </OverlayTrigger>
      </div>
    );
  }

  render() {
    const { genericEl } = this.state;
    const submitLabel = (genericEl && genericEl.isNew) ? 'Create' : 'Save';
    const saveBtnDisplay = ((genericEl && genericEl.isNew) || (genericEl && genericEl.changed) || false) ? { display: '' } : { display: 'none' };

    let tabContents = [
      i => this.propertiesTab(i),
      i => this.containersTab(i),
      i => this.attachmentsTab(i),
    ];

    const tablen = tabContents.length;
    const segTabs = SegmentTabs(genericEl, this.handleSegmentsChange, tablen);
    tabContents = tabContents.concat(segTabs);

    return (
      <Panel
        className="panel-detail"
        bsStyle={genericEl.isPendingToSave ? 'info' : 'primary'}
      >
        <Panel.Heading>
          {this.header(genericEl)}
        </Panel.Heading>
        <Panel.Body>
          <ListGroup>
            <Tabs activeKey={this.state.activeTab} onSelect={key => this.handleSelect(key, genericEl.type)} id="GenericElementDetailsXTab">
              {tabContents.map((e, i) => e(i))}
            </Tabs>
          </ListGroup>
          <hr />
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={() => DetailActions.close(genericEl, true)}>
              Close
            </Button>
            <Button bsStyle="warning" onClick={() => this.handleSubmit()} style={saveBtnDisplay}>
              {submitLabel}
            </Button>
          </ButtonToolbar>
        </Panel.Body>
      </Panel>
    );
  }
}

GenericElDetails.propTypes = {
  genericEl: PropTypes.object,
  toggleFullScreen: PropTypes.func.isRequired
};

GenericElDetails.defaultProps = {
  genericEl: {},
};
