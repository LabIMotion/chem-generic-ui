/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Modal } from 'react-bootstrap';
import Constants from '../tools/Constants';
import { handleKlassUploading } from '../../utils/template/action-handler';

const UploadKlassModal = props => {
  const { data, genericType, fnUpload, showProps } = props;
  const { show, setShow } = showProps;

  const handleReaderLoaded = e => {
    const verify = handleKlassUploading(e, genericType);
    fnUpload(verify);
    setShow(false);
  };

  const handleUploadTemplate = file => {
    const reader = new FileReader();
    reader.onload = handleReaderLoaded;
    reader.readAsText(file[0]);
  };

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{`Import ${genericType} and its template`}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'auto' }}>
        <Dropzone
          onDrop={attach => handleUploadTemplate(attach)}
          className="gu-drop-zone"
          style={{ height: 50 }}
        >
          <div style={{ paddingTop: 12 }}>Drop File, or Click to Select.</div>
        </Dropzone>
      </Modal.Body>
    </Modal>
  );
};

UploadKlassModal.propTypes = {
  data: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnUpload: PropTypes.func.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
};

export default UploadKlassModal;
