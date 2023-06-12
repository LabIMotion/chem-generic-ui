/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  FormControl,
  FormGroup,
  InputGroup,
  Panel,
} from 'react-bootstrap';
import { filter, sortBy } from 'lodash';
import LayerAttrEditBtn from '../LayerAttrEditBtn';
import LayerAttrNewBtn from '../LayerAttrNewBtn';
import Constants from '../../tools/Constants';
import ButtonTooltip from '../../fields/ButtonTooltip';
import PropFields from './PropFields';
import {
  handleAddDummy,
  handleCondition,
  handleCreateLayer,
  handleUpdateLayer,
} from '../../../utils/template/action-handler';
import { notifyFieldAdd } from '../../../utils/template/designer-message';
import { isValidField } from '../../../utils/template/input-validation';
import RemovePropBtn from './RemovePropBtn';

const PropLayers = props => {
  console.log('PropLayers props', props);
  const { data, genericType, fnDelete, fnUpdate } = props;

  const newFieldRef = useRef('');

  const onConditionAdd = ({ _layerKey, _field }) => {
    const verify = handleCondition(data, _layerKey, _field);
    fnUpdate(verify, _layerKey, data);
  };

  const onFieldAdd = e => {
    const { layerKey } = e;
    const newFieldKey = newFieldRef.current.value;
    if (newFieldKey === null || newFieldKey.trim().length === 0) {
      fnUpdate(
        notifyFieldAdd(false, 'please input field name first!'),
        layerKey,
        data
      );
      return;
    }
    if (!isValidField(newFieldKey)) {
      fnUpdate(
        notifyFieldAdd(
          false,
          'only can be alphanumeric (a-z, A-Z, 0-9 and underscores).'
        ),
        layerKey,
        data
      );
      return;
    }
    const layer = data?.properties_template?.layers[layerKey];
    const fields = layer.fields || [];
    const dupfields = filter(fields, o => o.field === newFieldKey);
    if (dupfields && dupfields.length > 0) {
      fnUpdate(
        notifyFieldAdd(
          false,
          'this field is used already, please change a field name'
        ),
        layerKey,
        data
      );
      return;
    }
    const newField = {
      type: 'text',
      field: newFieldKey,
      position: 100,
      label: newFieldKey,
      default: '',
    };
    fields.push(newField);
    data.properties_template.layers[layerKey].fields = fields;
    fnUpdate(notifyFieldAdd(), layerKey, data);
  };

  const onDummyAdd = ({ _layerKey, _field }) => {
    const result = handleAddDummy(data, _layerKey, _field);
    fnUpdate(result);
  };

  const onLayerCreate = _layer => {
    const result = handleCreateLayer(_layer, data);
    fnUpdate(result);
  };

  const onLayerUpdate = (_layerKey, _updates) => {
    const result = handleUpdateLayer(data, _layerKey, _updates);
    fnUpdate(result);
  };

  const layers = [];
  const sortedLayers = sortBy(data.properties_template.layers, l => l.position);
  (sortedLayers || []).forEach(layer => {
    const layerKey = `${layer.key}`;

    const fields = (
      <PropFields
        generic={data}
        genericType={genericType}
        fnUpdate={fnUpdate}
        layer={layer}
      />
    );

    const hasCond = layer?.cond_fields?.length > 0 || false;
    const btnCond = (
      <ButtonTooltip
        tip="Restriction Setting"
        fnClick={onConditionAdd}
        bs={hasCond ? 'warning' : ''}
        element={{ l: layerKey, f: null }}
        fa="fa fa-cogs"
        place="top"
        size="sm"
      />
    );

    const node = (
      <Panel
        className="panel_generic_properties"
        defaultExpanded
        key={`idxLayer_${layerKey}`}
      >
        <Panel.Heading className="template_panel_heading">
          <Panel.Title toggle>
            {layer.label}&nbsp;<Badge>{layer.key}</Badge>&nbsp;
            <Badge>Columns per Row:&nbsp;{layer.cols}</Badge>&nbsp;
            <Badge className="bg-bs-primary">
              Fields:&nbsp;{layer?.fields?.length || 0}
            </Badge>
            {layer.wf ? (
              <span>
                &nbsp;<Badge className="bg-bs-warning">workflow</Badge>
              </span>
            ) : null}
          </Panel.Title>
          <div>
            <FormGroup
              bsSize="sm"
              style={{ marginBottom: 'unset', display: 'inline-table' }}
            >
              <InputGroup>
                <InputGroup.Button>
                  {btnCond}
                  <LayerAttrEditBtn
                    fnUpdate={onLayerUpdate}
                    isAttrOnWF
                    layer={layerKey}
                  />
                  <RemovePropBtn
                    delStr="Layer"
                    delKey={layerKey}
                    element={data}
                    fnDelete={fnDelete}
                  />
                </InputGroup.Button>
                <FormControl
                  type="text"
                  name="nf_newfield"
                  placeholder="Input new field name"
                  bsSize="sm"
                  ref={newFieldRef}
                />
                <InputGroup.Button>
                  <ButtonTooltip
                    tip="Add new field"
                    fnClick={onFieldAdd}
                    element={{ layerKey }}
                    fa="fa fa-plus"
                    place="top"
                    size="sm"
                  />
                  <ButtonTooltip
                    tip="Add Dummy field"
                    fnClick={onDummyAdd}
                    element={{ l: layerKey, f: null }}
                    fa="fa fa-plus-circle"
                    place="top"
                    size="sm"
                  />
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </div>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body style={{ padding: '15px 0px 15px 0px' }}>
            {fields}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
    layers.push(node);
  });

  return (
    <div>
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Layers
            <LayerAttrNewBtn fnCreate={onLayerCreate} />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <div>{layers}</div>
        </Panel.Body>
      </Panel>
    </div>
  );
};

PropLayers.propTypes = {
  data: PropTypes.object.isRequired,
  fnDelete: PropTypes.func.isRequired, // { notify, element, selectOptions }
  fnUpdate: PropTypes.func.isRequired, // { notify, element }
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
  ]).isRequired,
};

export default PropLayers;
