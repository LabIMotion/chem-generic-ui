/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Form } from 'react-bootstrap';
import JsonDiffCompact from '@ui/diff/JsonDiffCompact';
import JsonDiffTreeGrid from '@ui/diff/JsonDiffTreeGrid';
import JsonDiffTree from '@ui/diff/JsonDiffTree';
import JsonDiffAgGrid from '@ui/diff/JsonDiffAgGrid';
import JsonDiffTreeAgGrid from '@ui/diff/JsonDiffTreeAgGrid';

const CompareModal = ({ showProps, selectedRevisions }) => {
  const { show, setShow } = showProps;
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);

  if (!show) return null;

  // Get the first two selected revisions for comparison
  const revisionsToCompare = selectedRevisions.slice(0, 2);

  // Parse version string (e.g., "v1.2" -> [1, 2])
  const parseVersion = (versionStr) => {
    if (!versionStr || versionStr === '(In Progress)') {
      return null; // In Progress is not a valid version for comparison
    }

    const match = versionStr.match(/^v(\d+)\.(\d+)$/);
    if (!match) return null;

    return [parseInt(match[1], 10), parseInt(match[2], 10)];
  };

  // Compare versions: returns -1 if a < b, 1 if a > b, 0 if equal
  const compareVersions = (versionA, versionB) => {
    if (!versionA && !versionB) return 0;
    if (!versionA) return 1; // a is invalid/in-progress, so b is smaller
    if (!versionB) return -1; // b is invalid/in-progress, so a is smaller

    const [aMajor, aMinor] = versionA;
    const [bMajor, bMinor] = versionB;

    if (aMajor !== bMajor) return aMajor - bMajor;
    return aMinor - bMinor;
  };

  // Get version IDs for comparison
  const firstVersionId = revisionsToCompare[0]?._versionDisplay?.verBase || '(In Progress)';
  const secondVersionId = revisionsToCompare[1]?._versionDisplay?.verBase || '(In Progress)';

  // Parse versions
  const firstVersion = parseVersion(firstVersionId);
  const secondVersion = parseVersion(secondVersionId);

  // Determine which should be base (older/smaller version)
  const comparison = compareVersions(firstVersion, secondVersion);

  let oldJson, newJson, oldVersionId, newVersionId;

  if (comparison <= 0) {
    // First selection has smaller/equal version or is the only valid version
    oldJson = revisionsToCompare[0] || {}; // First = base (older)
    newJson = revisionsToCompare[1] || {}; // Second = comparison target (newer)
    oldVersionId = firstVersionId;
    newVersionId = secondVersionId;
  } else {
    // Second selection has smaller version
    oldJson = revisionsToCompare[1] || {}; // Second = base (older)
    newJson = revisionsToCompare[0] || {}; // First = comparison target (newer)
    oldVersionId = secondVersionId;
    newVersionId = firstVersionId;
  }

  const handleClose = () => {
    setShow(false);
  };

  const handleShowOnlyChangesToggle = (e) => {
    setShowOnlyChanges(e.target.checked);
  };

  return (
    <>
      <style>
        {`
          .modal-90w {
            --bs-modal-width: 90vw;
            max-width: 90vw;
          }
          .modal-90w .modal-dialog {
            width: 90vw;
            max-width: 90vw;
            margin: auto;
            display: flex;
            align-items: center;
            min-height: calc(100vh - 3.5rem);
          }
        `}
      </style>
      <Modal
        aria-labelledby="contained-modal-title-vcenter"
        show={show}
        onHide={handleClose}
        // fullscreen
        backdrop="static"
        dialogClassName="modal-90w"
        centered
      >
      <Modal.Header closeButton>
        <Modal.Title>
          Compare Revisions
          {revisionsToCompare.length === 2 && (
            <small className="text-muted ms-2">
              (Showing differences between selected versions)
            </small>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          maxHeight: '70vh',
          overflow: 'auto',
          padding: '1rem'
        }}
      >
        {revisionsToCompare.length < 2 ? (
          <div className="text-center p-4">
            <p className="text-muted">
              Please select exactly 2 revisions to compare.
            </p>
            <p className="text-muted">
              Currently selected: {selectedRevisions.length} revision(s)
            </p>
          </div>
        ) : (
          <div>
            <JsonDiffTreeAgGrid
              oldJson={oldJson}
              newJson={newJson}
              oldVersionId={oldVersionId}
              newVersionId={newVersionId}
            />
            {/* <JsonDiffTree oldJson={oldJson} newJson={newJson} /> */}
            {/* <JsonDiffTreeGrid oldJson={oldJson} newJson={newJson} /> */}
            {/* <div className="mb-3">
              <Form.Check
                type="checkbox"
                id="showOnlyChanges"
                label="Show only changes"
                checked={showOnlyChanges}
                onChange={handleShowOnlyChangesToggle}
              />
            </div>
            <JsonDiffCompact
              oldJson={oldJson}
              newJson={newJson}
              showOnlyChanges={showOnlyChanges}
            /> */}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="justify-content-start">
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

CompareModal.propTypes = {
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
  selectedRevisions: PropTypes.array.isRequired,
};

export default CompareModal;
