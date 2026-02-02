/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import LayerAttrForm from '@components/elements/LayerAttrForm';

function LayerAttrModal(props) {
  const { actions, isAttrOnWF, layer, showProps } = props;
  const { show, setShow } = showProps;
  const formRef = useRef();

  const handleCreate = (_fnAction) => {
    const buildLayer = {
      key: formRef.current.attLayerKey.value.trim(),
      label: formRef.current.attLabel.value.trim(),
      color: formRef.current.attColor.value.trim(),
      style: formRef.current.attStyle.value.trim(),
      cols: parseInt(formRef.current.attCols.value.trim() || 1, 10),
      position: -1, // Use -1 to ensure new layer sorts first, reorderPositions assigns sequential from 0
      wf:
        formRef.current.attWf.value === 'true' ||
        formRef.current.attWf.value === true ||
        false,
      label_fields: formRef.current.labelFields || [],
    };
    _fnAction(buildLayer);
    setShow(false);
  };

  const handleUpdate = (_fnAction) => {
    const updates = {
      key: formRef.current.attLayerKey.value.trim(),
      label: formRef.current.attLabel.value.trim(),
      color: formRef.current.attColor.value.trim(),
      style: formRef.current.attStyle.value.trim(),
      cols: parseInt(formRef.current.attCols.value.trim() || 1, 10),
      position: layer.position, // Preserve existing position on update
      wf:
        formRef.current.attWf.value === 'true' ||
        formRef.current.attWf.value === true ||
        false,
      label_fields: formRef.current.labelFields || [],
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
            variant="warning"
            onClick={_fnAction ? () => handleCreate(_fnAction) : () => {}}
          >
            Create
          </Button>
        );
        break;
      case 'u':
        button = (
          <Button
            key={`_layer_attr_modal_btn_${_action}`}
            variant="warning"
            onClick={_fnAction ? () => handleUpdate(_fnAction) : () => {}}
          >
            Update
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
    actions.forEach((e) => {
      buttons.push(actionBtn(e.action, e.fnAction));
      // buttons.push(
      //   <span key={`_layer_attr_modal_span_${e.action}`}>&nbsp;</span>,
      // );
    });
    return buttons;
  };

  const addTitles = () => {
    const title = [];
    const mapping = { c: 'New Layer', u: 'Edit Layer attributes' };
    actions.map((e) => title.push(mapping[e.action]));
    return title.join('/');
  };

  return (
    <Modal
      centered
      size="lg"
      backdrop="static"
      show={show}
      onHide={() => setShow(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>{addTitles()}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflow: 'auto' }}>
        <div className="col-md-12">
          <LayerAttrForm
            ref={formRef}
            layer={layer}
            isAttrOnWF={isAttrOnWF}
            isCreateMode={actions.some((a) => a.action === 'c')}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-start">
        <Button variant="secondary" onClick={() => setShow(false)}>
          Cancel
        </Button>
        {addActions()}
      </Modal.Footer>
    </Modal>
  );
}

LayerAttrModal.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      action: PropTypes.oneOf(['c', 'u']),
      fnAction: PropTypes.func,
    }),
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
