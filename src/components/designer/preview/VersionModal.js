/* eslint-disable react/forbid-prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { pascalize } from 'humps';
import Preview from './Preview';
import LoadingSpinner from '../../icons/LoadingSpinner';
import ExtMgr from '../../../utils/extMgr';

const VersionModal = ({
  show,
  fnClose,
  fnRetrieve,
  element,
  // fetcher,
  // fetcherFn,
  // fnDelete,
}) => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRevisions = useCallback(async () => {
    setLoading(true);
    const res = await ExtMgr.getVersions(
      element.properties.klass.toLowerCase(),
      { id: element.id }
    );
    (res.element?.data?.revisions || []).map((r) =>
      Object.assign(r, { released_at: r.created_at })
    );
    setRevisions(res.element?.data?.revisions || []);
    setLoading(false);
  }, [element]);

  useEffect(() => {
    fetchRevisions();
  }, [show, fetchRevisions]);

  const handleClose = () => {
    setRevisions([]);
    fnClose();
  };

  const retrieveRevision = (revision, cb) => {
    fnRetrieve(revision, cb);
  };

  const handleDelete = (revision) => {
    const deleteVersion = async () => {
      const params = {
        id: revision.id,
        element_id: element.id,
        klass: pascalize(element.properties.klass),
      };
      const res = await ExtMgr.deleteVersion(params);
      console.log('res=', res);
      fetchRevisions();
    };

    deleteVersion();
  };

  if (revisions.length < 1) return null;
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
            <Preview
              revisions={revisions}
              fnRetrieve={retrieveRevision}
              fnDelete={handleDelete}
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
  // fetcher: PropTypes.func.isRequired,
  // fetcherFn: PropTypes.string.isRequired,
  // fnDelete: PropTypes.func.isRequired,
};

VersionModal.defaultProps = { element: {}, fnRetrieve: () => {} };

export default VersionModal;
