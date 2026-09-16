import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import TooltipButton from '@ui/common/TooltipButton';
import ActionRow from '@ui/common/ActionRow';
import FIcons from '@components/icons/FIcons';
import TAs from '@components/tools/TAs';
import { handleDelete } from '@utils/template/action-handler';
import GModal from '@ui/modals/GModal';

/**
 * Replaces the old per-field "…" dropdown (ButtonEllipse) with a compact
 * modal listing the field actions, mirroring LayerActionsBtn. Deletion sits
 * in a separate danger zone behind a confirm checkbox.
 */
function FieldActionsBtn(props) {
  const { field, layerKey, generic, onDummyAdd, onDelete } = props;

  const [show, setShow] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const isDummy = field.type === FieldTypes.F_DUMMY;
  const label = field.label || (isDummy ? 'dummy field' : field.field);

  const close = () => {
    setShow(false);
    setConfirmDel(false);
  };

  const addDummy = () => {
    onDummyAdd({ layerKey, field: field.field });
    close();
  };

  const doDelete = () => {
    const result = handleDelete(
      FieldTypes.DEL_FIELD,
      field.field,
      layerKey,
      generic,
    );
    onDelete(result);
    close();
  };

  return (
    <>
      <TooltipButton
        tooltipId="fld_more_act"
        aria-label={TAs.fld_more_act}
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
        Same reasoning as LayerActionsBtn: the modal sits inside the field's
        Prop header, which toggles on click. React replays portal events
        through the component tree, so this span stops the click from
        bubbling into the header toggle behind it.
      */}
      <span role="presentation" onClick={(e) => e.stopPropagation()}>
        <GModal size="lg" show={show} onHide={close}>
          <GModal.Header className="py-2">
            <GModal.Title className="fs-6">Field actions</GModal.Title>
          </GModal.Header>
          <GModal.Body className="p-3">
            <div className="text-muted small mb-2 text-truncate" title={label}>
              {label}
            </div>
            <ListGroup className="mb-3 gap-2">
              <ActionRow
                icon={FIcons.faSquare}
                label="Add dummy field"
                hint="Insert a placeholder field next to this one."
                onClick={addDummy}
              />
            </ListGroup>

            <div className="border border-danger rounded p-3">
              <div className="text-danger fw-bold small mb-2">
                {FIcons.faTriangleExclamation} Danger zone
              </div>
              <p className="small mb-2">
                Deleting <strong>{label}</strong> removes the field from this
                layer. Restrictions and display-name references pointing at it
                are dropped with it.
              </p>
              <Form.Check
                type="checkbox"
                id={`gu_confirm_del_fld_${layerKey}_${field.field}`}
                className="small mb-2"
                label="I understand, delete this field"
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
                Delete field
              </Button>
            </div>
          </GModal.Body>
        </GModal>
      </span>
    </>
  );
}

FieldActionsBtn.propTypes = {
  field: PropTypes.object.isRequired,
  layerKey: PropTypes.string.isRequired,
  generic: PropTypes.object.isRequired,
  onDummyAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default FieldActionsBtn;
