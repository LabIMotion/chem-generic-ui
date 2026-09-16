import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, ListGroup, Badge } from 'react-bootstrap';
import GModal from '@ui/modals/GModal';

export function RemoveAllModal({ show, onConfirm, onCancel }) {
  return (
    <GModal show={show} onHide={onCancel}>
      <GModal.Header>
        <GModal.Title>Remove all variations?</GModal.Title>
      </GModal.Header>
      <GModal.Body>
        This will delete every variation row for this element. This cannot be
        undone without reverting your changes.
      </GModal.Body>
      <GModal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Remove all variations
        </Button>
      </GModal.Footer>
    </GModal>
  );
}
RemoveAllModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export function ImportConfirmModal({
  show,
  fileName,
  importing,
  onConfirm,
  onCancel,
}) {
  return (
    <GModal show={show} onHide={onCancel}>
      <GModal.Header>
        <GModal.Title>Import variations from Excel?</GModal.Title>
      </GModal.Header>
      <GModal.Body>
        <p>
          Import <strong>{fileName}</strong> into this element&apos;s
          variations.
        </p>
        <ul>
          <li>
            Rows are matched by their <strong>Row ID</strong>: matching
            variations are updated.
          </li>
          <li>A row with an empty Row ID is added as a new variation.</li>
          <li>Variations missing from the file are left untouched.</li>
          <li>
            Values are tagged with the unit shown in the column header. Changing
            a unit in the file does <strong>not</strong> convert the values.
          </li>
        </ul>
      </GModal.Body>
      <GModal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={importing}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={importing}>
          {importing ? 'Importing…' : 'Import'}
        </Button>
      </GModal.Footer>
    </GModal>
  );
}
ImportConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  fileName: PropTypes.string,
  importing: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
ImportConfirmModal.defaultProps = {
  fileName: '',
  importing: false,
};

export function DeleteRowModal({ show, rowName, onConfirm, onCancel }) {
  return (
    <GModal show={show} onHide={onCancel}>
      <GModal.Header>
        <GModal.Title>Delete variation?</GModal.Title>
      </GModal.Header>
      <GModal.Body>
        Delete variation <strong>{rowName}</strong>?
      </GModal.Body>
      <GModal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </GModal.Footer>
    </GModal>
  );
}
DeleteRowModal.propTypes = {
  show: PropTypes.bool.isRequired,
  rowName: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export function NotesEditorModal({ show, value, onSave, onCancel }) {
  const [draft, setDraft] = useState(value || '');
  useEffect(() => {
    setDraft(value || '');
  }, [value, show]);
  return (
    <GModal show={show} onHide={onCancel} size="lg">
      <GModal.Header>
        <GModal.Title>Notes</GModal.Title>
      </GModal.Header>
      <GModal.Body>
        <Form.Control
          as="textarea"
          rows={10}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </GModal.Body>
      <GModal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(draft)}>
          Save
        </Button>
      </GModal.Footer>
    </GModal>
  );
}
NotesEditorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  value: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
NotesEditorModal.defaultProps = { value: '' };

export function AnalysesEditorModal({
  show,
  analyses,
  selectedIds,
  onSave,
  onCancel,
}) {
  const [draft, setDraft] = useState(selectedIds || []);
  useEffect(() => {
    setDraft(selectedIds || []);
  }, [selectedIds, show]);

  const toggle = (id) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <GModal show={show} onHide={onCancel} size="lg">
      <GModal.Header>
        <GModal.Title>Link analyses to this variation</GModal.Title>
      </GModal.Header>
      <GModal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {analyses.length === 0 ? (
          <p className="text-muted">This element has no analyses yet.</p>
        ) : (
          <ListGroup>
            {analyses.map((a) => (
              <ListGroup.Item
                key={a.id}
                action
                active={draft.includes(a.id)}
                onClick={() => toggle(a.id)}
              >
                <div className="d-flex justify-content-between">
                  <span>{a.name}</span>
                  {a.kind && <Badge bg="secondary">{a.kind}</Badge>}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </GModal.Body>
      <GModal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(draft)}>
          Save
        </Button>
      </GModal.Footer>
    </GModal>
  );
}
AnalysesEditorModal.propTypes = {
  show: PropTypes.bool.isRequired,

  analyses: PropTypes.array.isRequired,

  selectedIds: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export function HideColumnWarningModal({
  show,
  columnLabel,
  onConfirm,
  onCancel,
}) {
  return (
    <GModal show={show} onHide={onCancel}>
      <GModal.Header>
        <GModal.Title>Hide column?</GModal.Title>
      </GModal.Header>
      <GModal.Body>
        Column <strong>{columnLabel}</strong> has data in one or more
        variations. Hiding the column will clear the stored values for this
        column on save.
      </GModal.Body>
      <GModal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="warning" onClick={onConfirm}>
          Hide and clear
        </Button>
      </GModal.Footer>
    </GModal>
  );
}
HideColumnWarningModal.propTypes = {
  show: PropTypes.bool.isRequired,
  columnLabel: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
