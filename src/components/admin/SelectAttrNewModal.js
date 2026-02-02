import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Modal, Button } from 'react-bootstrap';

export default class SelectAttrNewModal extends Component {
  constructor(props) {
    super(props);
    this.s_selectKey = React.createRef();
  }

  handleCreate() {
    const { fnCreate } = this.props;
    fnCreate(this.s_selectKey.current.value.trim());
  }

  render() {
    const { showModal, fnClose } = this.props;
    return (
      <Modal
        centered
        backdrop="static"
        show={showModal}
        onHide={() => fnClose()}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>New Select List</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: 'auto' }}>
          <div className="col-md-12">
            <Form className="row mb-3 input-form">
              <Form.Group controlId="formControlSelectKey">
                <InputGroup>
                  <InputGroup.Text>Name</InputGroup.Text>
                  <Form.Control type="text" ref={this.s_selectKey} />
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
              </Form.Group>
            </Form>
            <Form.Group>
              <Button variant="primary" onClick={() => this.handleCreate()}>
                Add new select list to template workarea
              </Button>
              &nbsp;
              <Button variant="secondary" onClick={() => fnClose()}>
                Cancel
              </Button>
            </Form.Group>
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
