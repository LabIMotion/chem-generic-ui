/* eslint-disable max-len */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Col, PanelGroup, Row } from 'react-bootstrap';
import GenProperties from '../fields/GenProperties';
import { genUnits, showProperties, unitConversion } from '../tools/utils';
import PanelDnD from '../dnd/PanelDnD';

export default class GenPropertiesLayer extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubChange = this.handleSubChange.bind(this);
    this.moveLayer = this.moveLayer.bind(this);
  }

  handleChange(e, f, k, t) {
    this.props.onChange(e, f, k, t);
  }

  handleSubChange(e, id, f, valueOnly = false) {
    const sub = f.sub_fields.find(m => m.id === id);
    if (!valueOnly) {
      if (e.type === 'system-defined') {
        const units = genUnits(e.option_layers);
        let uIdx = units.findIndex(u => u.key === e.value_system);
        if (uIdx < units.length - 1) uIdx += 1; else uIdx = 0;
        sub.value_system = units.length > 0 ? units[uIdx].key : '';
        sub.value = unitConversion(e.option_layers, sub.value_system, e.value);
      } else {
        sub.value = e.target.value;
      }
    }
    const { layer } = this.props;
    const obj = { f, sub };
    this.props.onSubChange(layer.key, obj, valueOnly);
  }

  handleClick(keyLayer, obj, val) {
    const units = genUnits(obj.option_layers);
    let uIdx = units.findIndex(e => e.key === val);
    if (uIdx < units.length - 1) uIdx += 1; else uIdx = 0;
    const update = obj;
    update.value_system = units.length > 0 ? units[uIdx].key : '';
    this.props.onClick(keyLayer, update);
  }

  views() {
    const {
      layer, selectOptions, id, layers, isPreview
    } = this.props;
    const { cols, fields, key } = layer;
    const perRow = cols || 1;
    const col = Math.floor(12 / perRow);
    const klaz = (12 % perRow) > 0 ? 'g_col_w' : '';
    const vs = [];
    let op = [];
    let newRow = 0;
    let rowId = 1;
    (fields || []).forEach((f, i) => {
      if (showProperties(f, layers)) {
        const unit = genUnits(f.option_layers)[0] || {};
        const tabCol = (f.cols || 1) * 1;
        const rCol = (f.type === 'table') ? (12 / (tabCol || 1)) : col;
        newRow = (f.type === 'table') ? newRow += (perRow / (tabCol || 1)) : newRow += 1;

        if (newRow > perRow) {
          vs.push(<Row key={rowId}>{op}</Row>);
          rowId += 1;
          op = [];
          newRow = (f.type === 'table') ? newRow = (perRow / (tabCol || 1)) : newRow = 1;
        }
        const eachCol = (
          <Col key={`prop_${key}_${f.priority}_${f.field}`} md={rCol} lg={rCol} className={f.type === 'table' ? '' : klaz}>
            <GenProperties
              key={`${id}_${layer}_${f.field}_GenPropertiesLayer`}
              layers={layers}
              id={id}
              layer={layer}
              f_obj={f}
              label={f.label}
              value={f.value || ''}
              description={f.description || ''}
              type={f.type || 'text'}
              field={f.field || 'field'}
              formula={f.formula || ''}
              options={(selectOptions && selectOptions[f.option_layers] && selectOptions[f.option_layers].options) || []}
              onChange={event => this.handleChange(event, f.field, key, f.type)}
              onSubChange={this.handleSubChange}
              isEditable
              isPreview={isPreview}
              readOnly={false}
              isRequired={f.required || false}
              placeholder={f.placeholder || ''}
              option_layers={f.option_layers}
              value_system={f.value_system || unit.key}
              onClick={() => this.handleClick(key, f, (f.value_system || unit.key))}
              selectOptions={selectOptions || {}}
            />
          </Col>
        );
        op.push(eachCol);
        if (newRow % perRow === 0) newRow = 0;
        if ((newRow === 0) || (fields.length === (i + 1))) {
          vs.push(<Row key={rowId}>{op}</Row>);
          rowId += 1;
          op = [];
        }
      } else if (fields.length === (i + 1)) {
        vs.push(<Row key={rowId}>{op}</Row>);
        rowId += 1;
        op = [];
      }
    });
    return vs;
  }

  moveLayer(src, tar) {
    this.handleChange(null, src, tar, 'drop-layer');
  }

  render() {
    const { id, layer, activeWF } = this.props;
    const { color, style, label } = layer;
    let bs = color || 'default';
    const cl = (style || 'panel_generic_heading').replace('panel_generic_heading', 'panel_generic_heading_slim');
    // panel header color is based on input bs value
    const panelDnD = (<PanelDnD
      type="gen_panel"
      layer={layer}
      field="layer"
      rowValue={{ id: layer.key }}
      handleMove={this.moveLayer}
      id={id}
      handleChange={this.handleChange}
      bs={bs}
    />);
    const panelHeader = label === '' ? (<span />) : (
      <Panel.Heading className={cl}>
        <Panel.Title toggle>{label}</Panel.Title>
      </Panel.Heading>
    );
    const noneKlass = bs === 'none' ? 'generic_panel_none' : '';
    if (bs === 'none') bs = 'default';
    return (
      <PanelGroup accordion id="accordion_generic_layer" defaultActiveKey="1" style={{ marginBottom: '0px' }}>
        <Panel bsStyle={bs} className={`panel_generic_properties ${noneKlass}`} eventKey="1">
          {activeWF ? panelDnD : panelHeader}
          <Panel.Collapse>
            <Panel.Body className="panel_generic_properties_body">{this.views()}</Panel.Body>
          </Panel.Collapse>
        </Panel>
      </PanelGroup>
    );
  }
}

GenPropertiesLayer.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // element id or new id
  layer: PropTypes.object,
  selectOptions: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onSubChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  layers: PropTypes.object.isRequired,
  isPreview: PropTypes.bool,
  activeWF: PropTypes.bool
};

GenPropertiesLayer.defaultProps = {
  id: 0,
  selectOptions: {},
  onClick: () => {},
  isPreview: false,
  activeWF: false
};
