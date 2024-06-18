/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findIndex, cloneDeep } from 'lodash';
import {
  Panel,
  Button,
  ButtonToolbar,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { genUnits } from 'generic-ui-core';
import GenInterface from './GenInterface';
import { toBool, toNum, absOlsTermLabel } from '../tools/utils';

class GenericDSDetails extends Component {
  constructor(props) {
    super(props);
    this.handleReload = this.handleReload.bind(this);
  }

  handleReload() {
    const { klass, genericDS, onChange } = this.props;
    if (klass.properties_release) {
      const newProps = cloneDeep(klass.properties_release);
      newProps.klass_uuid = klass.uuid;
      Object.keys(newProps.layers).forEach(key => {
        const newLayer = newProps.layers[key] || {};
        const curFields =
          (genericDS.properties.layers[key] &&
            genericDS.properties.layers[key].fields) ||
          [];
        (newLayer.fields || []).forEach((f, idx) => {
          const curIdx = findIndex(curFields, o => o.field === f.field);
          if (curIdx >= 0) {
            const curVal =
              genericDS.properties.layers[key].fields[curIdx].value;
            const curType = typeof curVal;
            if (
              ['select', 'text', 'textarea', 'formula-field'].includes(
                newProps.layers[key].fields[idx].type
              )
            ) {
              newProps.layers[key].fields[idx].value =
                curType !== 'undefined' ? curVal.toString() : '';
            }
            if (newProps.layers[key].fields[idx].type === 'integer') {
              // eslint-disable-next-line no-restricted-globals
              newProps.layers[key].fields[idx].value =
                curType === 'undefined' ||
                curType === 'boolean' ||
                isNaN(curVal)
                  ? 0
                  : parseInt(curVal, 10);
            }
            if (newProps.layers[key].fields[idx].type === 'checkbox') {
              newProps.layers[key].fields[idx].value =
                curType !== 'undefined' ? toBool(curVal) : false;
            }
            if (newProps.layers[key].fields[idx].type === 'system-defined') {
              const units = genUnits(
                newProps.layers[key].fields[idx].option_layers
              );
              const vs = units.find(
                u =>
                  u.key ===
                  genericDS.properties.layers[key].fields[curIdx].value_system
              );
              newProps.layers[key].fields[idx].value_system =
                (vs && vs.key) || units[0].key;
              newProps.layers[key].fields[idx].value = toNum(curVal);
            }
          }
        });
      });
      genericDS.properties = newProps;
      genericDS.dataset_klass_id = klass.id;
      genericDS.klass_ols = klass.ols_term_id;
      genericDS.klass_label = klass.label;
      genericDS.changed = true;
      onChange(genericDS);
    } else {
      onChange(undefined);
    }
  }

  elementalPropertiesItem(genericDS) {
    const { onChange } = this.props;
    const layersLayout = (
      <GenInterface
        generic={genericDS}
        fnChange={onChange}
        extLayers={[]}
        genId={0}
        isPreview={false}
        isSearch={false}
        isActiveWF={false}
      />
    );
    return <div style={{ margin: '5px' }}>{layersLayout}</div>;
  }

  render() {
    const { uiCtrl, genericDS, kind } = this.props;
    if (uiCtrl && Object.keys(genericDS).length !== 0 && kind && kind !== '') {
      return (
        <Panel className="panel-detail">
          <Panel.Body
            style={{ position: 'relative', minHeight: 260, overflowY: 'unset' }}
          >
            {this.elementalPropertiesItem(genericDS)}
            <span className="g-ds-note label">
              <span className="g-ds-title">Note</span>
              <br />
              Selected analysis type: {absOlsTermLabel(kind)}
              <br />
              Content is designed for: {genericDS.klass_label}
            </span>
            <ButtonToolbar className="pull-right">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="_tooltip_reload">
                    click to reload the content template
                  </Tooltip>
                }
              >
                <Button
                  className="btn-gxs"
                  bsStyle="danger"
                  onClick={() => this.handleReload()}
                >
                  Reload
                </Button>
              </OverlayTrigger>
            </ButtonToolbar>
          </Panel.Body>
        </Panel>
      );
    }
    return null;
  }
}

GenericDSDetails.propTypes = {
  uiCtrl: PropTypes.bool.isRequired, // MatrixCheck(currentUser.matrix, 'genericDataset')
  kind: PropTypes.string, // selected analysis type
  genericDS: PropTypes.object,
  klass: PropTypes.object, // dataset_klass
  onChange: PropTypes.func.isRequired, // change callback
};
GenericDSDetails.defaultProps = { kind: '', genericDS: {}, klass: {} };

// export default DragDropContext(HTML5Backend)(GenericDSDetails);
export default GenericDSDetails;
