import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import {
  Form,
  FormControl,
  FormGroup,
  InputGroup,
  Button,
} from 'react-bootstrap';

export default class SegmentAttrForm extends Component {
  render() {
    const { element, editable, klasses } = this.props;

    const klassOptions = klasses?.map(k => (
      <option key={uuid()} value={k.id}>
        {k.label}
      </option>
    ));

    return (
      <Form horizontal className="input-form">
        <FormGroup controlId="formControlLabel">
          <InputGroup>
            <InputGroup.Addon>Segment Label</InputGroup.Addon>
            <FormControl
              type="text"
              defaultValue={element.label}
              inputRef={ref => {
                this.k_label = ref;
              }}
            />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId="formControlDescription">
          <InputGroup>
            <InputGroup.Addon>Description</InputGroup.Addon>
            <FormControl
              type="text"
              defaultValue={element.desc}
              inputRef={ref => {
                this.k_desc = ref;
              }}
            />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId="formControlAssignKlass">
          <InputGroup>
            <InputGroup.Addon>Assign to Element</InputGroup.Addon>
            <FormControl
              componentClass="select"
              value={element?.element_klass?.id}
              inputRef={ref => {
                this.k_klass = ref;
              }}
              disabled={!editable}
              readOnly={!editable}
            >
              {klassOptions}
            </FormControl>
          </InputGroup>
        </FormGroup>
      </Form>
    );
  }
}

SegmentAttrForm.propTypes = {
  element: PropTypes.object.isRequired,
  klasses: PropTypes.array.isRequired,
  editable: PropTypes.bool.isRequired,
};
