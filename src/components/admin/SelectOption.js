/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, FormGroup, InputGroup } from 'react-bootstrap';
import { cloneDeep } from 'lodash';
import renderDeleteButton from './renderDeleteButton';
import ButtonTooltip from '../fields/ButtonTooltip';

export default class SelectOption extends Component {
  handleCreate() {
    const { generic, root, fnAddOption } = this.props;
    const input = this.inputNewOption.value.trim();
    const newOption = { key: input, label: input };

    // prepare generic with new options of root
    const deep = cloneDeep(generic);
    const selectObj =
      deep?.properties_template?.select_options[root]?.options || [];
    selectObj.push(newOption);

    fnAddOption(root, input, selectObj); // return [root, new option, new options]
  }

  render() {
    const { generic, root, fnChange } = this.props;
    return (
      <FormGroup
        bsSize="sm"
        style={{ marginBottom: 'unset', display: 'inline-table' }}
      >
        <InputGroup>
          <InputGroup.Button>
            {renderDeleteButton(generic, 'Select', root, '', fnChange)}
          </InputGroup.Button>
          <FormControl
            type="text"
            name="input_newOption"
            inputRef={ref => {
              this.inputNewOption = ref;
            }}
            placeholder="Input new option"
            bsSize="sm"
          />
          <InputGroup.Button>
            <ButtonTooltip
              tip="Add new option"
              fnClick={() => this.handleCreate()}
              fa="faPlus"
            />
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
}

SelectOption.propTypes = {
  generic: PropTypes.object.isRequired,
  root: PropTypes.string.isRequired,
  fnChange: PropTypes.func.isRequired,
  fnAddOption: PropTypes.func.isRequired,
};
