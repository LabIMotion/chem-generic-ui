/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import { Card } from 'react-bootstrap';
import { FieldTypes, genUnits } from 'generic-ui-core';
import GenInterface from '@components/details/GenInterface';
import organizeSubValues from '@components/tools/collate';
import { toBool, toNum } from '@utils/pureUtils';

class SegmentDetails extends Component {
  constructor(props) {
    super(props);
    this.handleReload = this.handleReload.bind(this);
  }

  handleReload() {
    const { klass, segment, onChange } = this.props;
    const newProps = cloneDeep(klass.properties_release);
    newProps.klass_uuid = klass.uuid;
    Object.keys(newProps.layers).forEach(key => {
      const newLayer = newProps.layers[key] || {};
      const curFields = (segment.properties.layers[key] && segment.properties.layers[key].fields)
        || [];
      (newLayer.fields || []).forEach((f, idx) => {
        const curIdx = findIndex(curFields, o => o.field === f.field);
        if (curIdx >= 0) {
          const curVal = segment.properties.layers[key].fields[curIdx].value;
          const curType = typeof curVal;
          if ([FieldTypes.F_SELECT, FieldTypes.F_TEXT, FieldTypes.F_TEXTAREA, FieldTypes.F_FORMULA_FIELD].includes(newProps.layers[key].fields[idx].type)) {
            newProps.layers[key].fields[idx].value = curType !== 'undefined' ? curVal.toString() : '';
          }
          if (newProps.layers[key].fields[idx].type === FieldTypes.F_INTEGER) {
            newProps.layers[key].fields[idx].value = (curType === 'undefined' || curType === 'boolean' || isNaN(curVal)) ? 0 : parseInt(curVal, 10);
          }
          if (newProps.layers[key].fields[idx].type === FieldTypes.F_CHECKBOX) {
            newProps.layers[key].fields[idx].value = curType !== 'undefined' ? toBool(curVal) : false;
          }
          if (newProps.layers[key].fields[idx].type === FieldTypes.F_SYSTEM_DEFINED) {
            const units = genUnits(newProps.layers[key].fields[idx].option_layers);
            const vs = units.find(u => u.key === segment.properties.layers[key].fields[curIdx].value_system);
            newProps.layers[key].fields[idx].value_system = (vs && vs.key) || units[0].key;
            newProps.layers[key].fields[idx].value = toNum(curVal);
          }
          if (newProps.layers[key].fields[idx].type === FieldTypes.F_INPUT_GROUP) {
            if (segment.properties.layers[key].fields[curIdx].type
              !== newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].value = undefined;
            } else {
              const nSubs = newProps.layers[key].fields[idx].sub_fields || [];
              const cSubs = segment.properties.layers[key].fields[curIdx].sub_fields || [];
              const exSubs = [];
              if (nSubs.length < 1) {
                newProps.layers[key].fields[idx].value = undefined;
              } else {
                nSubs.forEach(nSub => {
                  const hitSub = cSubs.find(c => c.id === nSub.id) || {};
                  if (nSub.type === FieldTypes.F_LABEL) { exSubs.push(nSub); }
                  if (nSub.type === FieldTypes.F_TEXT) {
                    if (hitSub.type === FieldTypes.F_LABEL) {
                      exSubs.push(nSub);
                    } else { exSubs.push({ ...nSub, value: (hitSub.value || '').toString() }); }
                  }

                  if ([FieldTypes.F_NUMBER, FieldTypes.F_SYSTEM_DEFINED].includes(nSub.type)) {
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
          if (newProps.layers[key].fields[idx].type === FieldTypes.F_UPLOAD) {
            if (segment.properties.layers[key].fields[curIdx].type
              === newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].value = segment.properties.layers[key].fields[curIdx].value;
            } else {
              newProps.layers[key].fields[idx].value = {};
            }
          }
          if (newProps.layers[key].fields[idx].type === FieldTypes.F_TABLE) {
            if (segment.properties.layers[key].fields[curIdx].type
              !== newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].sub_values = [];
            } else {
              newProps.layers[key].fields[idx].sub_values = organizeSubValues(
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
    onChange(segment);
  }

  elementalPropertiesItem(segment) {
    const { onChange, fnNavi, isSearch } = this.props;
    const layersLayout = (
      <GenInterface
        generic={segment}
        fnChange={onChange}
        extLayers={[]}
        genId={0}
        isPreview={false}
        isSearch={isSearch}
        isActiveWF
        fnNavi={fnNavi}
      />
    );
    return (<div style={{ margin: '5px' }}>{layersLayout}</div>);
  }

  render() {
    const { uiCtrl, segment } = this.props;
    if (!uiCtrl || Object.keys(segment).length === 0) return null;
    return (
      <div>
        <Card>
          <Card.Body style={{ position: 'relative', minHeight: 260, overflowY: 'unset' }}>
            {this.elementalPropertiesItem(segment)}
          </Card.Body>
        </Card>
      </div>
    );
  }
}

SegmentDetails.propTypes = {
  uiCtrl: PropTypes.bool.isRequired,
  segment: PropTypes.object,
  klass: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  fnNavi: PropTypes.func,
};

SegmentDetails.defaultProps = { segment: {}, klass: {}, fnNavi: () => {} };

export default SegmentDetails;
