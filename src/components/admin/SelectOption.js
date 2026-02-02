/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Row } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import FIcons from '@components/icons/FIcons';

const stopPropagation = (event) => {
  event.stopPropagation();
};
export default class SelectOption extends Component {
  constructor(props) {
    super(props);
    this.inputNewOption = React.createRef();
  }

  handleCreate() {
    const { generic, root, fnAddOption } = this.props;
    const input = this.inputNewOption.current.value.trim();
    const newOption = { key: input, label: input };

    // prepare generic with new options of root
    const deep = cloneDeep(generic);
    const selectObj =
      deep?.properties_template?.select_options[root]?.options || [];
    selectObj.push(newOption);

    fnAddOption(root, input, selectObj); // return [root, new option, new options]
  }

  render() {
    const { root, children } = this.props;
    return (
      <Form.Group
        size="sm"
        as={Row}
        style={{ marginBottom: 'unset', display: 'inline-table' }}
      >
        <Form.Label>
          {FIcons.faList}&nbsp;{root}
        </Form.Label>
        <InputGroup className="ug-input-group">
          <Form.Control
            type="text"
            name="input_newOption"
            ref={this.inputNewOption}
            placeholder="Input new option"
            size="sm"
            onClick={stopPropagation}
            onFocus={stopPropagation}
          />
          <ButtonTooltip
            idf="sel_opt_add"
            fnClick={() => this.handleCreate()}
            fa="faPlus"
          />
          {children}
        </InputGroup>
      </Form.Group>
    );
  }
}

SelectOption.propTypes = {
  generic: PropTypes.object.isRequired,
  root: PropTypes.string.isRequired,
  fnAddOption: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
