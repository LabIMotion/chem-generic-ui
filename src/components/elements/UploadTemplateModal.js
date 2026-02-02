/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Modal } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import Constants from '@components/tools/Constants';
import { handleTemplateUploading } from '@utils/template/action-handler';

const UploadTemplateModal = (props) => {
  const { data, fnUpload, genericType, showProps } = props;
  const { show, setShow } = showProps;
  const handleReaderLoaded = (e) => {
    const verify = handleTemplateUploading(e, genericType);
    if (verify.notify.isSuccess) {
      const newData = cloneDeep(data);

      if (Object.prototype.hasOwnProperty.call(verify.element, 'metadata')) {
        newData.metadata = cloneDeep(verify.element.metadata);
      } else {
        delete newData.metadata;
      }

      const properties = cloneDeep(verify.element);
      delete properties.metadata;
      newData.properties_template = properties;

      verify.element = newData;
    }
    fnUpload(verify);
    setShow(false);
  };

  const handleUploadTemplate = (file) => {
    const reader = new FileReader();
    reader.onload = handleReaderLoaded;
    reader.readAsText(file[0]);
  };

  return (
    <Modal centered show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Upload template to Work Area</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'auto' }}>
        <Dropzone
          onDrop={(attach) => handleUploadTemplate(attach)}
          className="lu-drop-zone"
          style={{ height: 50 }}
        >
          <div style={{ paddingTop: 12 }}>Drop File, or Click to Select.</div>
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
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnUpload: PropTypes.func.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
};

export default UploadTemplateModal;
