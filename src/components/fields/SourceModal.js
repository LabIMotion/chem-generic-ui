/* eslint-disable react/forbid-prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import LoadingSpinner from '@components/icons/LoadingSpinner';

const SourceModal = ({
  show,
  fnClose,
  fnRetrieve,
  element,
  // fetcher,
  // fetcherFn,
  // fnDelete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    fnClose();
  };

  return (
    <Modal
      centered
      show={show}
      onHide={handleClose}
      backdrop="static"
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>Sources Overview</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex flex-column"
        style={{ height: '70vh' }}
      >
        {loading ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex-grow-1 overflow-auto">
            {/* Properties Table */}
            <div className="mb-4">
              <h5 className="mb-3">Properties</h5>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Field</th>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Short Label</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Link Sample</td>
                      <td>39888</td>
                      <td>Sample</td>
                      <td>CHI-835-1</td>
                      <td>CHI-R208-A</td>
                    </tr>
                    <tr>
                      <td>Link Molecule</td>
                      <td>10111</td>
                      <td>Molecule</td>
                      <td>{' '}</td>
                      <td>{' '}</td>
                    </tr>
                    <tr>
                      <td>Link Element</td>
                      <td>2658</td>
                      <td>Polymer Element</td>
                      <td>posk</td>
                      <td>kowek</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* T1 Table */}
            <div className="mb-4">
              <h5 className="mb-3">T1</h5>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Field</th>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Short Label</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Exp. Sample</td>
                      <td>16588</td>
                      <td>Sample</td>
                      <td>CHI-860-1</td>
                      <td>CHI-R688-A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

SourceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnRetrieve: PropTypes.func,
  element: PropTypes.object,
  // fetcher: PropTypes.func.isRequired,
  // fetcherFn: PropTypes.string.isRequired,
  // fnDelete: PropTypes.func.isRequired,
};

SourceModal.defaultProps = { element: {}, fnRetrieve: () => {} };

export default SourceModal;
