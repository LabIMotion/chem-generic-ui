import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import Constants from '@components/tools/Constants';
import { handleKlassUploading } from '@utils/template/action-handler';
import GModal from '@ui/modals/GModal';

function UploadKlassModal(props) {
  const { genericType, fnUpload, showProps } = props;
  const { show, setShow } = showProps;

  const handleReaderLoaded = (e) => {
    const verify = handleKlassUploading(e, genericType);
    fnUpload(verify);
    setShow(false);
  };

  const handleUploadTemplate = (file) => {
    const reader = new FileReader();
    reader.onload = handleReaderLoaded;
    reader.readAsText(file[0]);
  };

  return (
    <GModal size="lg" show={show} onHide={() => setShow(false)}>
      <GModal.Header>
        <GModal.Title>{`Import ${genericType} and its template`}</GModal.Title>
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

UploadKlassModal.propTypes = {
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
