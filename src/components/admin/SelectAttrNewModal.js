import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  FormControl,
  FormGroup,
  InputGroup,
  Modal,
  Button,
} from 'react-bootstrap';

export default class SelectAttrNewModal extends Component {
  handleCreate() {
    const { fnCreate } = this.props;
    fnCreate(this.s_selectKey.value.trim());
  }

  render() {
    const { showModal, fnClose } = this.props;
    return (
      <Modal backdrop="static" show={showModal} onHide={() => fnClose()}>
        <Modal.Header closeButton>
          <Modal.Title>New Select List</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: 'auto' }}>
          <div className="col-md-12">
            <Form horizontal className="input-form">
              <FormGroup controlId="formControlSelectKey">
                <InputGroup>
                  <InputGroup.Addon>Name</InputGroup.Addon>
                  <FormControl
                    type="text"
                    inputRef={ref => {
                      this.s_selectKey = ref;
                    }}
                  />
                </InputGroup>
                <div className="help">
                  Select List name is unique in the template.
                  <br />
                  Select List name must start with a lowercase letter, and then
                  have one or more lowercase letters or underscores in the
                  middle, and end with a lowercase letter.
                  <br />
                  Select List name should not contain special characters like $,
                  !, %, etc.
                </div>
              </FormGroup>
            </Form>
            <FormGroup>
              <Button bsStyle="primary" onClick={() => this.handleCreate()}>
                Add new select list to template workarea
              </Button>
              &nbsp;
              <Button bsStyle="warning" onClick={() => fnClose()}>
                Cancel
              </Button>
            </FormGroup>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

SelectAttrNewModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnCreate: PropTypes.func.isRequired,
};
