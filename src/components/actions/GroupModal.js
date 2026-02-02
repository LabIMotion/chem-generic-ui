/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import SimpleGroupLayer from '@/ui/groups/SimpleGroupLayer';
import NoticeBtn from '@ui/groups/NoticeBtn';

function GroupModal({ generic, onSave, showProps }) {
  const { show, setShow } = showProps;
  const [updatedMetadata, setUpdatedMetadata] = useState(null);
  const [workingKlass, setWorkingKlass] = useState(null);
  const [workingMetadata, setWorkingMetadata] = useState(null);

  // Initialize working copies when modal opens
  React.useEffect(() => {
    if (show) {
      // Deep clone to avoid mutating original data
      setWorkingKlass(
        JSON.parse(JSON.stringify(generic?.properties_template || {})),
      );
      setWorkingMetadata(
        JSON.parse(
          JSON.stringify(generic?.metadata || { groups: [], restrict: {} }),
        ),
      );
      setUpdatedMetadata(null);
    }
  }, [show, generic]);

  if (!show) return null;

  const handleMetadataChange = (newMetadata) => {
    setUpdatedMetadata(newMetadata);
    // Update working copies
    if (newMetadata.klass) {
      setWorkingKlass(newMetadata.klass);
    }
    if (
      newMetadata.groups !== undefined ||
      newMetadata.restrict !== undefined
    ) {
      setWorkingMetadata({
        groups: newMetadata.groups,
        restrict: newMetadata.restrict,
      });
    }
  };

  const handleSave = () => {
    // Pass the complete working state, not just the last update
    onSave({
      groups: workingMetadata.groups,
      restrict: workingMetadata.restrict,
      klass: workingKlass,
    });
    setShow(false);
  };

  const handleCancel = () => {
    setUpdatedMetadata(null);
    setWorkingKlass(null);
    setWorkingMetadata(null);
    setShow(false);
  };

  // Don't render content until working copies are ready
  if (!workingKlass || !workingMetadata) {
    return null;
  }

  return (
    <Modal
      centered
      show={show}
      onHide={() => setShow(false)}
      size="xl"
      backdrop="static"
      scrollable
      style={{ maxWidth: '90%', margin: '0 auto' }}
      dialogClassName="h-auto"
    >
      <Modal.Header closeButton>
        <Modal.Title>Group Layers and Set Conditions</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex flex-column p-3"
        style={{ overflowY: 'auto', maxHeight: '70vh' }}
      >
        <div>
          <NoticeBtn />
        </div>
        <SimpleGroupLayer
          klass={workingKlass}
          klassMetadata={workingMetadata}
          onMetadataChange={handleMetadataChange}
        />
      </Modal.Body>
      <Modal.Footer className="justify-content-start">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleSave}
          disabled={!updatedMetadata}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

GroupModal.propTypes = {
  generic: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
};

export default GroupModal;
