/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, Modal, Button, ButtonGroup } from 'react-bootstrap';
import { Content } from './AttrForm';
import Constants from '../tools/Constants';
import Response from '../../utils/response';
import {
  validateElementKlassInput,
  validateSegmentKlassInput,
} from '../../utils/template/input-validation';

const AttrModal = props => {
  const { actions, data, editable, genericType, klasses, showProps } = props;
  const { show, setShow } = showProps;
  const formRef = useRef();

  const handleCreate = _fnAction => {
    switch (genericType) {
      case Constants.GENERIC_TYPES.SEGMENT: {
        const inputs = {
          label: formRef.current.k_label.value.trim(),
          desc: formRef.current.k_desc.value.trim(),
          element_klass: formRef.current.k_klass.value,
        };
        const verify = validateSegmentKlassInput(inputs);
        _fnAction(new Response(verify, inputs));
        if (verify.isSuccess) setShow(false);
        break;
      }
      case Constants.GENERIC_TYPES.ELEMENT: {
        const inputs = {
          name: formRef.current.k_name.value.trim(),
          label: formRef.current.k_label.value.trim(),
          klass_prefix: formRef.current.k_prefix.value.trim(),
          icon_name: formRef.current.k_iconname.value.trim(),
          desc: formRef.current.k_desc.value.trim(),
        };
        const verify = validateElementKlassInput(inputs);
        _fnAction(new Response(verify, inputs));
        if (verify.isSuccess) setShow(false);
        break;
      }
      default:
        console.log(`Warning: ${genericType} is not supported.`);
    }
  };

  const handleCopy = _fnAction => {
    switch (genericType) {
      case Constants.GENERIC_TYPES.SEGMENT: {
        const updates = {
          label: formRef.current.k_label.value.trim(),
          desc: formRef.current.k_desc.value.trim(),
          identifier: formRef.current.k_identifier.value.trim(),
        };
        const inputs = { ...data, ...updates };
        const verify = validateSegmentKlassInput(inputs);
        _fnAction(new Response(verify, inputs));
        if (verify.isSuccess) setShow(false);
        break;
      }
      case Constants.GENERIC_TYPES.ELEMENT: {
        const updates = {
          label: formRef.current.k_label.value.trim(),
          klass_prefix: formRef.current.k_prefix.value.trim(),
          icon_name: formRef.current.k_iconname.value.trim(),
          desc: formRef.current.k_desc.value.trim(),
        };
        const inputs = { ...data, ...updates };
        const verify = validateElementKlassInput(inputs);
        _fnAction(new Response(verify, inputs));
        if (verify.isSuccess) setShow(false);
        break;
      }
      default:
        console.log(`Warning: ${genericType} is not supported.`);
    }
  };

  const handleDelete = _fnAction => {
    _fnAction(data);
    setShow(false);
  };

  const handleUpdate = _fnAction => {
    switch (genericType) {
      case Constants.GENERIC_TYPES.SEGMENT: {
        const updates = {
          label: formRef.current.k_label.value.trim(),
          desc: formRef.current.k_desc.value.trim()
        };
        const inputs = { ...data, ...updates };
        const verify = validateSegmentKlassInput(inputs);
        _fnAction(new Response(verify, inputs));
        if (verify.isSuccess) setShow(false);
        break;
      }
      case Constants.GENERIC_TYPES.ELEMENT: {
        const updates = {
          label: formRef.current.k_label.value.trim(),
          klass_prefix: formRef.current.k_prefix.value.trim(),
          icon_name: formRef.current.k_iconname.value.trim(),
          desc: formRef.current.k_desc.value.trim(),
        };
        const inputs = { ...data, ...updates };
        const verify = validateElementKlassInput(inputs);
        _fnAction(new Response(verify, inputs));
        if (verify.isSuccess) setShow(false);
        break;
      }
      default:
        console.log(`Warning: ${genericType} is not supported.`);
    }
  };

  const actionBtn = (_action, _fnAction) => {
    let button = null;
    switch (_action) {
      case 'c':
        button = (
          <Button
            key={`_attr_modal_btn_${_action}`}
            bsStyle="primary"
            onClick={_fnAction ? () => handleCreate(_fnAction) : () => {}}
          >
            Create&nbsp; <i className="fa fa-save" aria-hidden="true" />
          </Button>
        );
        break;
      case 'cc':
        button = (
          <Button
            key={`_attr_modal_btn_${_action}`}
            bsStyle="primary"
            onClick={_fnAction ? () => handleCopy(_fnAction) : () => {}}
          >
            Copy&nbsp; <i className="fa fa-save" aria-hidden="true" />
          </Button>
        );
        break;
      case 'u':
        button = (
          <Button
            key={`_attr_modal_btn_${_action}`}
            bsStyle="primary"
            onClick={_fnAction ? () => handleUpdate(_fnAction) : () => {}}
          >
            Update&nbsp; <i className="fa fa-save" aria-hidden="true" />
          </Button>
        );
        break;
      case 'd':
        button = (
          <Button
            key={`_attr_modal_btn_${_action}`}
            bsStyle="danger"
            onClick={_fnAction ? () => handleDelete(_fnAction) : () => {}}
          >
            Delete&nbsp; <i className="fa fa-save" aria-hidden="true" />
          </Button>
        );
        break;
      default:
        button = null;
    }
    return button;
  };

  const addActions = () => {
    const buttons = [];
    actions.forEach(e => {
      buttons.push(actionBtn(e.action, e.fnAction));
      buttons.push(<span key={`_attr_modal_span_${e.action}`}>&nbsp;</span>);
    });
    return buttons;
  };

  const addTitles = () => {
    const title = [];
    const mapping = { c: 'New', cc: 'Copy', u: 'Edit', d: 'Delete' };
    actions.map(e => title.push(mapping[e.action]));
    return title.join('/').concat(' ').concat(genericType);
  };

  return (
    <>
      <Modal backdrop="static" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{addTitles()}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: 'auto' }}>
          <div className="col-md-12">
            <Content
              ref={formRef}
              content={genericType}
              klasses={klasses}
              element={data}
              editable={editable}
            />
            <Form horizontal>
              <FormGroup>
                {addActions()}
                <ButtonGroup>
                  <Button bsStyle="warning" onClick={() => setShow(false)}>
                    Cancel
                  </Button>
                </ButtonGroup>
              </FormGroup>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

AttrModal.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      action: PropTypes.oneOf(['c', 'cc', 'u', 'd']),
      fnAction: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.object, // required for update action
  editable: PropTypes.bool,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  klasses: PropTypes.array, // required for Segment creation
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
};

AttrModal.defaultProps = {
  data: {},
  editable: true,
  klasses: [],
};

export default AttrModal;
