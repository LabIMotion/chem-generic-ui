import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, ListGroup } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import { FieldTypes } from 'generic-ui-core';
import LayerAttrModal from '@components/elements/LayerAttrModal';
import ArrangeModal from '@components/actions/ArrangeModal';
import FieldOrderContent from '@components/designer/template/FieldOrderContent';
import TooltipButton from '@ui/common/TooltipButton';
import ActionRow from '@ui/common/ActionRow';
import FIcons from '@components/icons/FIcons';
import TAs from '@components/tools/TAs';
import Constants from '@components/tools/Constants';
import Response from '@utils/response';
import { notifySuccess } from '@utils/template/designer-message';
import { handleDelete } from '@utils/template/action-handler';
import GModal from '@ui/modals/GModal';

/**
 * Replaces the old per-layer "…" dropdown (which frequently stayed open) with a
 * compact modal listing the layer actions. Edit-attributes and arrange-fields
 * open their own modals (LayerAttrModal / ArrangeModal), driven from here;
 * deletion sits in a separate danger zone behind a confirm checkbox.
 */
function LayerActionsBtn(props) {
  const {
    layer,
    layerKey,
    data,
    genericType,
    fnUpdate,
    onLayerUpdate,
    onDummyAdd,
    onLayerDelete,
    isAttrOnWF,
  } = props;

  const [show, setShow] = useState(false);
  const [showAttr, setShowAttr] = useState(false);
  const [showArrange, setShowArrange] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const arrangeRef = useRef(null);

  const label = layer.label || layer.key;
  const fieldCount = (layer.fields || []).length;
  const hasFields = fieldCount > 0;

  const close = () => {
    setShow(false);
    setConfirmDel(false);
  };

  const openEdit = () => {
    setShow(false);
    setShowAttr(true);
  };

  const openArrange = () => {
    setShow(false);
    setShowArrange(true);
  };

  const addDummy = () => {
    onDummyAdd({ layerKey, field: null });
    setShow(false);
  };

  // Mirrors FieldOrderBtn: persist the reordered fields back onto the layer.
  const handleArrangeSave = (updatedFields) => {
    const updates = cloneDeep(data);
    updates.properties_template.layers[layer.key].fields = updatedFields;
    updates.changed = true;
    fnUpdate(new Response(notifySuccess(), updates));
  };

  const doDelete = () => {
    const result = handleDelete(FieldTypes.DEL_LAYER, layerKey, '', data);
    onLayerDelete(result);
    close();
  };

  return (
    <>
      <TooltipButton
        tooltipId="lyr_more_act"
        aria-label={TAs.lyr_more_act}
        variant="light"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setShow(true);
        }}
      >
        {FIcons.faEllipsis}
      </TooltipButton>

      {/*
        These modals sit inside the layer accordion header, whose toggle listens
        for clicks. React replays portal events through the component tree, not
        the DOM tree, so every click landing in a modal would otherwise bubble
        into that toggle and expand/collapse the layer behind it.

        This span is a real DOM node next to the button, so keep the button out
        of a .btn-group: the group's :not(:last-child) rule would see the span
        and square off the button's right corners.
      */}
      <span role="presentation" onClick={(e) => e.stopPropagation()}>
        <GModal size="lg" show={show} onHide={close}>
          <GModal.Header className="py-2">
            <GModal.Title className="fs-6">Layer actions</GModal.Title>
          </GModal.Header>
          <GModal.Body className="p-3">
            <div className="text-muted small mb-2 text-truncate" title={label}>
              {label}
            </div>
            <ListGroup className="mb-3 gap-2">
              <ActionRow
                icon={FIcons.faPencil}
                label="Edit layer attributes"
                hint="Name, label, colour, style, columns and label fields."
                onClick={openEdit}
              />
              <ActionRow
                icon={FIcons.faPlus}
                label="Add dummy field"
                hint="Insert a placeholder that reserves space in the layout."
                onClick={addDummy}
              />
              {hasFields && (
                <ActionRow
                  icon={FIcons.faBars}
                  label="Arrange fields order"
                  hint="Drag and drop to reorder the fields of this layer."
                  onClick={openArrange}
                />
              )}
            </ListGroup>

            <div className="border border-danger rounded p-3">
              <div className="text-danger fw-bold small mb-2">
                {FIcons.faTriangleExclamation} Danger zone
              </div>
              <p className="small mb-2">
                Deleting <strong>{label}</strong> removes the layer and its{' '}
                {fieldCount} field{fieldCount === 1 ? '' : 's'} from this
                template. Restrictions pointing at the layer and its group
                membership are dropped with it.
              </p>
              <Form.Check
                type="checkbox"
                id={`gu_confirm_del_${layerKey}`}
                className="small mb-2"
                label="I understand, delete this layer"
                checked={confirmDel}
                onChange={(e) => setConfirmDel(e.target.checked)}
              />
              <Button
                variant="danger"
                size="sm"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={!confirmDel}
                onClick={doDelete}
              >
                {FIcons.faTrashCan}
                Delete layer
              </Button>
            </div>
          </GModal.Body>
        </GModal>

        <LayerAttrModal
          actions={[{ action: 'u', fnAction: onLayerUpdate }]}
          isAttrOnWF={isAttrOnWF}
          layer={layer}
          showProps={{ show: showAttr, setShow: setShowAttr }}
        />
        <ArrangeModal
          genericType={genericType}
          showProps={{ show: showArrange, setShow: setShowArrange }}
          onSave={handleArrangeSave}
        >
          <FieldOrderContent ref={arrangeRef} layer={layer} />
        </ArrangeModal>
      </span>
    </>
  );
}

LayerActionsBtn.propTypes = {
  layer: PropTypes.object.isRequired,
  layerKey: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnUpdate: PropTypes.func.isRequired,
  onLayerUpdate: PropTypes.func.isRequired,
  onDummyAdd: PropTypes.func.isRequired,
  onLayerDelete: PropTypes.func.isRequired,
  isAttrOnWF: PropTypes.bool,
};

LayerActionsBtn.defaultProps = { isAttrOnWF: false };

export default LayerActionsBtn;
