/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, InputGroup, Panel } from 'react-bootstrap';
import renderDeleteButton from './renderDeleteButton';
import SelectAttrNewModal from './SelectAttrNewModal';
import SelectOption from './SelectOption';
import ButtonTooltip from '../fields/ButtonTooltip';
import {
  handleAddOption,
  handleAddSelect,
  handleOptionInput,
} from '../../utils/template/action-handler';

const SelectOptionLayer = props => {
  const { generic, fnChange } = props;

  const [showAddSelect, setShowAddSelect] = useState(false);

  const onAdd = (_key, _optionKey, _selectOptions) => {
    const result = handleAddOption(generic, _key, _optionKey, _selectOptions);
    fnChange(result);
    setShowAddSelect(false);
  };

  const onCreate = selectName => {
    const sos = { ...generic.properties_template?.select_options };
    sos[selectName] = {};
    const result = handleAddSelect(generic, selectName, sos);
    fnChange(result);
    setShowAddSelect(false);
  };

  const onOptionInputChange = (event, optionKey, selectKey) => {
    const input = event.target.value;
    const result = handleOptionInput(generic, optionKey, selectKey, input);
    fnChange(result);
  };

  const optionR = _params => {
    const { key, root, label } = _params;
    return (
      <FormGroup bsSize="sm" controlId={`_cgu_frmCtrlSelectOption_${key}`}>
        <InputGroup>
          <InputGroup.Addon>{key}</InputGroup.Addon>
          <FormControl
            type="text"
            name="lf_label"
            defaultValue={label}
            onChange={event => onOptionInputChange(event, key, root)}
          />
          <InputGroup.Button>
            {renderDeleteButton(generic, 'Option', key, root, fnChange)}
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  };

  const selects = [];
  Object.keys(generic.properties_template?.select_options).forEach(root => {
    const selectOptions =
      (generic.properties_template?.select_options[root] &&
        generic.properties_template?.select_options[root].options) ||
      [];
    const options = selectOptions.map(f => (
      <div key={`${f.key}_${root}`} style={{ marginTop: '10px' }}>
        {optionR({ key: f.key, root, label: f.label })}
      </div>
    ));

    const selectNode = (
      <Panel
        className="panel_generic_properties"
        defaultExpanded
        key={`select_options_${root}`}
      >
        <Panel.Heading className="template_panel_heading">
          <Panel.Title toggle>{root}</Panel.Title>
          <SelectOption
            generic={generic}
            root={root}
            fnAddOption={onAdd}
            fnChange={fnChange}
          />
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>{options}</Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
    selects.push(selectNode);
  });

  return (
    <div>
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Select Lists
            <ButtonTooltip
              tip="Add new select list"
              fnClick={() => setShowAddSelect(true)}
              fa="faPlus"
              txt="Add new select list"
              btnCls="button-right btn-gxs"
            />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <div>{selects}</div>
        </Panel.Body>
      </Panel>
      <SelectAttrNewModal
        showModal={showAddSelect}
        fnClose={() => setShowAddSelect(false)}
        fnCreate={onCreate}
      />
    </div>
  );
};

SelectOptionLayer.propTypes = {
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
};

export default SelectOptionLayer;
