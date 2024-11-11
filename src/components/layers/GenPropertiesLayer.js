/* eslint-disable max-len */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Accordion from 'react-bootstrap/Accordion';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {
  genUnits,
  unitConversion,
  FieldTypes,
  showProperties,
} from 'generic-ui-core';
import GenProperties from '../fields/GenProperties';
import PanelDnD from '../dnd/PanelDnD';
import DateTimeRange from '../fields/DateTimeRange';
import Prop from '../designer/template/Prop';
import { bgColor } from '../tools/format-utils';
import mergeExt from '../../utils/ext-utils';

const ext = mergeExt();

export default class GenPropertiesLayer extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubChange = this.handleSubChange.bind(this);
    this.handleDTRChange = this.handleDTRChange.bind(this);
    this.moveLayer = this.moveLayer.bind(this);
  }

  handleChange(e, f, k, t) {
    const { onChange } = this.props;
    onChange(e, f, k, t);
  }

  handleSubChange(e, id, f, valueOnly = false) {
    const { onSubChange } = this.props;
    const sub = f.sub_fields.find((m) => m.id === id);
    if (!valueOnly) {
      if (e.type === FieldTypes.F_SYSTEM_DEFINED) {
        const units = genUnits(e.option_layers, ext);
        let uIdx = units.findIndex((u) => u.key === e.value_system);
        if (uIdx < units.length - 1) uIdx += 1;
        else uIdx = 0;
        sub.value_system = units.length > 0 ? units[uIdx].key : '';
        sub.value = unitConversion(e.option_layers, sub.value_system, e.value, ext);
      } else {
        sub.value = e.target.value;
      }
    }
    const { layer } = this.props;
    const obj = { f, sub };
    onSubChange(layer.key, obj, valueOnly);
  }

  handleDTRChange(params) {
    const { field, layer, subFields, type } = params;
    // event, field, layer, type = 'text'
    this.handleChange(subFields, field, layer, type);
  }

  handleClick(keyLayer, obj, val) {
    const { onClick } = this.props;
    const units = genUnits(obj.option_layers, ext);
    let uIdx = units.findIndex((e) => e.key === val);
    if (uIdx < units.length - 1) uIdx += 1;
    else uIdx = 0;
    const update = obj;
    update.value_system = units.length > 0 ? units[uIdx].key : '';
    onClick(keyLayer, update);
  }

  views() {
    const {
      layer,
      selectOptions,
      id,
      layers,
      classStr,
      isPreview,
      isSearch,
      onNavi,
      isSpCall,
    } = this.props;
    const { fields, key, sp } = layer;
    let { cols } = layer;

    // TODO: review isSpCall scenarios
    if (isSpCall && !!sp) cols = 1;

    // layer level settings
    let perRow = cols || 1;
    let colWidth = Math.floor(12 / perRow);

    const vs = [];
    let op = [];
    let remainingWidth = 12;
    let columnCount = 0; // Add counter to track columns in current row

    (fields || []).forEach((f, idx) => {
      const [showProp, showLabel] = showProperties(f, layers);
      if (showProp) {
        let fieldWidth;

        if (f.type === FieldTypes.F_DATETIME_RANGE) {
          // If there are fields in the current row, push them to the rows array
          if (op.length > 0) {
            vs.push(<Row key={`${key}_${vs.length}`}>{op}</Row>);
            op = [];
            remainingWidth = 12;
          }
          vs.push(
            <DateTimeRange
              key={`${key}_${vs.length}`}
              layer={layer}
              opt={{ f_obj: f }}
              onInputChange={this.handleDTRChange}
            />
          );
          columnCount = 0;
          return;
        }
        if (f.hasOwnRow) {
          // If there are fields in the current row, push them to the rows array
          if (op.length > 0) {
            vs.push(<Row key={`${key}_${vs.length}`}>{op}</Row>);
            op = [];
            remainingWidth = 12;
          }
          fieldWidth = 12;
          columnCount = 0;
        } else if (f.type === FieldTypes.F_TABLE) {
          fieldWidth = 12 / (f.cols || 1);
          columnCount = 0;
        } else {
          // field level settings
          perRow = f.cols || perRow;
          colWidth = Math.floor(12 / perRow);
          fieldWidth = colWidth;
        }

        if ((perRow === 5 && columnCount >= 5) || remainingWidth < fieldWidth) {
          vs.push(<Row key={`${key}_${vs.length}`}>{op}</Row>);
          op = [];
          remainingWidth = 12;
          columnCount = 0;
        }

        const unit = genUnits(f.option_layers, ext)[0] || {};
        const cls =
          perRow === 5 &&
          ![FieldTypes.F_TABLE, FieldTypes.F_DATETIME_RANGE].includes(f.type) &&
          !f.hasOwnRow
            ? 'g_col_w'
            : '';

        op.push(
          <Col
            key={`prop_${key}_${f.priority}_${f.field}`}
            md={fieldWidth}
            lg={fieldWidth}
            className={cls}
          >
            <GenProperties
              key={`${id}_${layer}_${f.field}_GenPropertiesLayer`}
              layers={layers}
              id={id}
              layer={layer}
              classStr={classStr || ''}
              f_obj={f}
              label={showLabel || f.label}
              value={f.value || ''}
              description={f.description || ''}
              type={f.type || 'text'}
              field={f.field || 'field'}
              formula={f.formula || ''}
              options={
                (selectOptions &&
                  selectOptions[f.option_layers] &&
                  selectOptions[f.option_layers].options) ||
                []
              }
              onChange={(event) =>
                this.handleChange(event, f.field, key, f.type)
              }
              onSubChange={this.handleSubChange}
              isEditable
              isPreview={isPreview}
              isSearch={isSearch}
              readOnly={false}
              isRequired={f.required || false}
              placeholder={f.placeholder || ''}
              option_layers={f.option_layers}
              value_system={f.value_system || unit.key}
              onClick={() =>
                this.handleClick(key, f, f.value_system || unit.key)
              }
              selectOptions={selectOptions || {}}
              onNavi={onNavi}
              isSpCall={isSpCall}
            />
          </Col>
        );

        remainingWidth -= fieldWidth;
        columnCount += 1;

        if (
          fieldWidth === 12 ||
          idx === fields.length - 1 ||
          (perRow === 5 && columnCount >= 5)
        ) {
          vs.push(<Row key={`${key}_${vs.length}`}>{op}</Row>);
          op = [];
          remainingWidth = 12;
          columnCount = 0;
        }
      }
    });

    if (op.length > 0) {
      vs.push(<Row key={`${key}_${vs.length}`}>{op}</Row>);
    }
    return vs;
  }

  moveLayer(src, tar) {
    this.handleChange(null, src, tar, 'drop-layer');
  }

  render() {
    const { id, layer, layers, activeWF, hasAi, aiComp, expandAll } =
      this.props;
    const { color = 'default', style, label } = layer;
    // const ai = layer.ai || [];
    const bgColorClass = bgColor(color);
    let klz = style || 'panel_generic_heading';
    klz = ['bg-light', 'bg-white'].includes(bgColorClass)
      ? `${klz} text-dark`
      : `${klz} text-white`;
    // panel header color is based on input bs value
    const panelDnD = (
      <PanelDnD
        type="gen_panel"
        layer={layer}
        field="layer"
        rowValue={{ id: layer.key }}
        handleMove={this.moveLayer}
        id={id}
        handleChange={this.handleChange}
        onAttrChange={(event) =>
          this.handleChange(event, 'timeRecord', layer, 'layer-data-change')
        }
        hasAi={hasAi}
      />
    );
    const panelHeader = (
      <Accordion.Header
        as="div"
        className={`custom-accordion-header ${bgColorClass} flex-grow-1`}
      >
        {label === '' ? <span className={klz}>&nbsp;</span> : <span className={klz}>{label}</span>}
      </Accordion.Header>
    );
    // const panelDiv = (
    //   <div className="flex-grow-1">
    //     {label === '' ? <span /> : <span className={klz}>{label}</span>}
    //   </div>
    // );

    const newPanel = (
      <Prop
        key={`_usr_prop_content_${layer.key}`}
        dnd={activeWF ? panelDnD : undefined}
        layerKey={layer.key}
        propHeader={panelHeader}
        extClass={bgColorClass}
        layers={layers}
        expandAll={expandAll}
      >
        {this.views()}
        {aiComp && aiComp[layer.key]}
      </Prop>
    );

    return newPanel;
  }
}

GenPropertiesLayer.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // element id or new id
  layer: PropTypes.object,
  selectOptions: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onSubChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  classStr: PropTypes.string,
  layers: PropTypes.object.isRequired,
  isPreview: PropTypes.bool,
  isSearch: PropTypes.bool,
  activeWF: PropTypes.bool,
  isSpCall: PropTypes.bool,
  onNavi: PropTypes.func,
  hasAi: PropTypes.bool,
  aiComp: PropTypes.any,
  expandAll: PropTypes.bool,
};

GenPropertiesLayer.defaultProps = {
  id: 0,
  selectOptions: {},
  onClick: () => {},
  isPreview: false,
  classStr: '',
  isSearch: false,
  activeWF: false,
  isSpCall: false,
  onNavi: () => {},
  hasAi: false,
  aiComp: null,
  expandAll: undefined,
};
