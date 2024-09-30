/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { handleAddVocabulary } from '../../../utils/template/field-handler';
import LTooltip from '../../shared/LTooltip';
import FIcons from '../../icons/FIcons';
import VocabGrid from './VocabGrid';
import VocabManager from '../../../utils/vocMgr';

const VocabularyListBtn = (props) => {
  const { element, fnUpdate, layer } = props;
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleDeleteVoc = async (params) => {
    await VocabManager.deleteVocabulary(params.data.id);
    setShow(false);
  };

  const handleSelectVoc = (params) => {
    const result = handleAddVocabulary(element, layer, params.data);
    fnUpdate(result);
    setShow(false);
  };

  return (
    <>
      <LTooltip idf="sel_voc2tpl">
        <Button bsSize="sm" onClick={handleShow}>
          {FIcons.faSpellCheck}
        </Button>
      </LTooltip>
      <Modal show={show} onHide={handleClose} dialogClassName="gu_modal-68w">
        <Modal.Header closeButton>
          <Modal.Title>LabIMotion Vocabulary (Lab-Vocab) List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VocabGrid
            onVocSelect={handleSelectVoc}
            onVocDelete={handleDeleteVoc}
          />
        </Modal.Body>
        <Modal.Footer>
          <LTooltip idf="close">
            <Button bsStyle="primary" onClick={handleClose}>
              Close
            </Button>
          </LTooltip>
        </Modal.Footer>
      </Modal>
      {/* <VocabularyListModal
        showModal={show}
        vocabularies={vocabularies}
        layer={layer}
        allLayers={sortedLayers}
        layerKey={layer.key}
        updSub={() => {}} // updSubField, for field condition
        fnApi={addVocabulary} // fnApi, for field condition
        updLayer={updLayerSubField}
        field={null} // field, for field condition
        element={element}
        fnClose={onClose}
      /> */}
    </>
  );
};

VocabularyListBtn.propTypes = {
  element: PropTypes.object.isRequired,
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
};

export default VocabularyListBtn;
