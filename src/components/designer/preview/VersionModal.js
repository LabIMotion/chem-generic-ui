/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import PreviewFunctional from '@components/designer/preview/PreviewFunctional';
import LoadingSpinner from '@components/icons/LoadingSpinner';

const VersionModal = ({ show, fnClose, fnRetrieve, element, genericType }) => {
  const [loading, setLoading] = useState(false);

  if (
    ![
      Constants.GENERIC_TYPES.ELEMENT,
      Constants.GENERIC_TYPES.SEGMENT,
      Constants.GENERIC_TYPES.DATASET,
    ].includes(genericType)
  )
    return null;

  const handleClose = () => {
    fnClose();
  };

  const retrieveRevision = (revision, cb) => {
    fnRetrieve(revision, cb);
  };

  return (
    <Modal
      centered
      show={show}
      onHide={handleClose}
      fullscreen
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Previous Versions</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex flex-column"
        style={{ height: 'calc(100vh - 56px)' }}
      >
        {loading ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex-grow-1 overflow-auto">
            <PreviewFunctional
              genericType={genericType}
              data={element}
              fnRetrieve={retrieveRevision}
              src="properties"
            />
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

VersionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnRetrieve: PropTypes.func,
  element: PropTypes.object,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
};

VersionModal.defaultProps = { element: {}, fnRetrieve: () => {} };

export default VersionModal;
