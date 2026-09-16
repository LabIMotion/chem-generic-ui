/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import cloneDeep from 'lodash/cloneDeep';
import Constants from '@components/tools/Constants';
import { handleTemplateUploading } from '@utils/template/action-handler';
import GModal from '@ui/modals/GModal';

function UploadTemplateModal(props) {
  const { data, fnUpload, genericType, showProps } = props;
  const { show, setShow } = showProps;
  const handleReaderLoaded = (e) => {
    const verify = handleTemplateUploading(e, genericType);
    if (verify.notify.isSuccess) {
      const newData = cloneDeep(data);

      // Preserve registries across upload — authorization stays with the document
      const keepRegistries = data?.metadata?.registries;
      if (Object.prototype.hasOwnProperty.call(verify.element, 'metadata')) {
        newData.metadata = cloneDeep(verify.element.metadata);
        if (keepRegistries) newData.metadata.registries = keepRegistries;
      } else if (keepRegistries) {
        newData.metadata = { registries: keepRegistries };
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
    <GModal show={show} onHide={() => setShow(false)}>
      <GModal.Header>
        <GModal.Title>Upload template to Work Area</GModal.Title>
      </GModal.Header>
      <GModal.Body style={{ overflow: 'auto' }}>
        <Dropzone
          onDrop={(attach) => handleUploadTemplate(attach)}
          className="lu-drop-zone"
          style={{ height: 50 }}
        >
          <div style={{ paddingTop: 12 }}>Drop File, or Click to Select.</div>
        </Dropzone>
      </GModal.Body>
    </GModal>
  );
}

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
