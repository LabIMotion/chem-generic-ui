/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import { Card } from 'react-bootstrap';
import { genUnits } from 'generic-ui-core';
import GenInterface from './GenInterface';
import { toBool, toNum } from '../tools/utils';
import organizeSubValues from '../tools/collate';
import mergeExt from '../../utils/ext-utils';

const ext = mergeExt();

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
            const units = genUnits(newProps.layers[key].fields[idx].option_layers, ext);
            const vs = units.find(u => u.key === segment.properties.layers[key].fields[curIdx].value_system);
            newProps.layers[key].fields[idx].value_system = (vs && vs.key) || units[0].key;
            newProps.layers[key].fields[idx].value = toNum(curVal);
          }
          if (newProps.layers[key].fields[idx].type === 'input-group') {
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
            if (segment.properties.layers[key].fields[curIdx].type
              === newProps.layers[key].fields[idx].type) {
              newProps.layers[key].fields[idx].value = segment.properties.layers[key].fields[curIdx].value;
            } else {
              newProps.layers[key].fields[idx].value = {};
            }
          }
          if (newProps.layers[key].fields[idx].type === 'table') {
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
