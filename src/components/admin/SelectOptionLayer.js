/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, FormControl, InputGroup, Panel
} from 'react-bootstrap';
import { findIndex } from 'lodash';
import renderDeleteButton from './renderDeleteButton';
import SelectAttrNewModal from './SelectAttrNewModal';
import SelectOption from './SelectOption';
import ButtonTooltip from '../fields/ButtonTooltip';

const onOptionInputChange = (event, optionKey, selectKey, generic, fnChange) => {
  const options = (generic && generic.properties_template
    && generic.properties_template.select_options[selectKey]
    && generic.properties_template.select_options[selectKey].options) || [];
  const idx = findIndex(options, o => o.key === optionKey);
  const op = {};
  op.key = optionKey;
  op.label = event.target.value;
  options.splice(idx, 1, op);
  fnChange(generic);
};

const optionR = (props) => {
  const {
    generic, key, root, label, fnChange
  } = props;
  return (
    <FormGroup bsSize="sm" controlId={`_cgu_frmCtrlSelectOption_${key}`}>
      <InputGroup>
        <InputGroup.Addon>{key}</InputGroup.Addon>
        <FormControl
          type="text"
          name="lf_label"
          defaultValue={label}
          onChange={event => onOptionInputChange(event, key, root, generic, fnChange)}
        />
        <InputGroup.Button>
          {renderDeleteButton(generic, 'Option', key, root, fnChange)}
        </InputGroup.Button>
      </InputGroup>
    </FormGroup>
  );
};

const SelectOptionLayer = (props) => {
  const {
    generic, fnChange, fnAddSelect, fnAddOption
  } = props;

  const [showAddSelect, setShowAddSelect] = useState(false);

  const selects = [];
  Object.keys(generic.properties_template.select_options).forEach((root) => {
    const soptions = (generic.properties_template.select_options[root]
    && generic.properties_template.select_options[root].options) || [];
    const options = soptions.map(f => (
      <div key={`${f.key}_${root}`} style={{ marginTop: '10px' }}>
        {optionR({
          generic, key: f.key, root, label: f.label, fnChange
        })}
      </div>
    ));

    const snode = (
      <Panel className="panel_generic_properties" defaultExpanded key={`select_options_${root}`}>
        <Panel.Heading className="template_panel_heading">
          <Panel.Title toggle>{root}</Panel.Title>
          <div>
            <SelectOption
              generic={generic}
              root={root}
              fnAddOption={fnAddOption}
              fnChange={fnChange}
            />
          </div>
        </Panel.Heading>
        <Panel.Collapse><Panel.Body>{options}</Panel.Body></Panel.Collapse>
      </Panel>
    );
    selects.push(snode);
  });

  // data validation is outside of this project
  const handleAddSelect = (selectName) => {
    const sos = { ...generic.properties_template.select_options };
    sos[selectName] = {};
    fnAddSelect(selectName, sos); // return [new select name, new select_options]
    setShowAddSelect(false);
  };

  return (
    <div>
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Select Lists
            <ButtonTooltip
              tip="Add new select list"
              fnClick={() => setShowAddSelect(true)}
              fa="fa-plus"
              size="xs"
              txt="Add new select list"
              btnCls="button-right"
            />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body><div>{ selects }</div></Panel.Body>
      </Panel>
      <SelectAttrNewModal
        showModal={showAddSelect}
        fnClose={() => setShowAddSelect(false)}
        fnCreate={handleAddSelect}
      />
    </div>
  );
};

SelectOptionLayer.propTypes = {
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
  fnAddSelect: PropTypes.func,
  fnAddOption: PropTypes.func
};

SelectOptionLayer.defaultProps = { fnAddSelect: () => {}, fnAddOption: () => {} };

export default SelectOptionLayer;
