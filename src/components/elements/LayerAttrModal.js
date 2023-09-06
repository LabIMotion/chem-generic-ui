/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Modal, Button } from 'react-bootstrap';
import LayerAttrForm from './LayerAttrForm';

const LayerAttrModal = props => {
  const { actions, isAttrOnWF, layer, showProps } = props;
  const { show, setShow } = showProps;
  const formRef = useRef();

  const handleCreate = _fnAction => {
    const buildLayer = {
      key: formRef.current.lf_layerKey.value.trim(),
      label: formRef.current.lf_label.value.trim(),
      color: formRef.current.lf_color.value.trim(),
      style: formRef.current.lf_style.value.trim(),
      cols: parseInt(formRef.current.lf_cols.value.trim() || 1, 10),
      position: parseInt(formRef.current.lf_position.value.trim() || 1, 10),
      wf:
        formRef.current.lf_wf.value === 'true' ||
        formRef.current.lf_wf.value === true ||
        false,
    };
    _fnAction(buildLayer);
    setShow(false);
  };

  const handleUpdate = _fnAction => {
    const updates = {
      key: formRef.current.lf_layerKey.value.trim(),
      label: formRef.current.lf_label.value.trim(),
      color: formRef.current.lf_color.value.trim(),
      style: formRef.current.lf_style.value.trim(),
      cols: parseInt(formRef.current.lf_cols.value.trim() || 1, 10),
      position: parseInt(formRef.current.lf_position.value.trim() || 1, 10),
      wf:
        formRef.current.lf_wf.value === 'true' ||
        formRef.current.lf_wf.value === true ||
        false,
    };
    _fnAction(layer.key, updates);
    setShow(false);
  };

  const actionBtn = (_action, _fnAction) => {
    let button = null;
    switch (_action) {
      case 'c':
        button = (
          <Button
            key={`_layer_attr_modal_btn_${_action}`}
            bsStyle="primary"
            onClick={_fnAction ? () => handleCreate(_fnAction) : () => {}}
          >
            Create&nbsp; <i className="fa fa-save" aria-hidden="true" />
          </Button>
        );
        break;
      case 'u':
        button = (
          <Button
            key={`_layer_attr_modal_btn_${_action}`}
            bsStyle="primary"
            onClick={_fnAction ? () => handleUpdate(_fnAction) : () => {}}
          >
            Update&nbsp; <i className="fa fa-save" aria-hidden="true" />
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
      buttons.push(
        <span key={`_layer_attr_modal_span_${e.action}`}>&nbsp;</span>
      );
    });
    return buttons;
  };

  const addTitles = () => {
    const title = [];
    const mapping = { c: 'New Layer11', u: 'Edit Layer attributes' };
    actions.map(e => title.push(mapping[e.action]));
    return title.join('/');
  };

  return (
    <Modal backdrop="static" show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{addTitles()}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'auto' }}>
        <div className="col-md-12">
          <LayerAttrForm ref={formRef} layer={layer} isAttrOnWF={isAttrOnWF} />
          <FormGroup>
            {addActions()}
            <Button bsStyle="warning" onClick={() => setShow(false)}>
              Cancel
            </Button>
          </FormGroup>
        </div>
      </Modal.Body>
    </Modal>
  );
};

LayerAttrModal.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      action: PropTypes.oneOf(['c', 'u']),
      fnAction: PropTypes.func,
    })
  ).isRequired,
  isAttrOnWF: PropTypes.bool,
  layer: PropTypes.object,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
};

LayerAttrModal.defaultProps = { isAttrOnWF: false, layer: {} };

export default LayerAttrModal;
