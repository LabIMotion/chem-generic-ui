/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Modal } from 'react-bootstrap';
import Constants from '../tools/Constants';
import { handleTemplateUploading } from '../../utils/template/action-handler';

const UploadTemplateModal = props => {
  const { data, genericType, fnUpload, showProps } = props;
  const { show, setShow } = showProps;

  const handleReaderLoaded = e => {
    const verify = handleTemplateUploading(e, genericType);
    const newData = data;
    newData.properties_template = verify.element;
    verify.element = newData;
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
        <Modal.Title>{`Upload ${genericType} Templates`}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'auto' }}>
        <Dropzone
          onDrop={attach => handleUploadTemplate(attach)}
          style={{ height: 50, width: '100%', border: '3px dashed lightgray' }}
        >
          <div style={{ textAlign: 'center', paddingTop: 12, color: 'gray' }}>
            Drop File, or Click to Select.
          </div>
        </Dropzone>
      </Modal.Body>
    </Modal>
  );
};

UploadTemplateModal.propTypes = {
  data: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
  ]).isRequired,
  fnUpload: PropTypes.func.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
};

export default UploadTemplateModal;
