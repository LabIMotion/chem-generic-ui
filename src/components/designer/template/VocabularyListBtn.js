/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { handleAddVocabulary } from '@utils/template/field-handler';
import LTooltip from '@components/shared/LTooltip';
import FIcons from '@components/icons/FIcons';
import VocabGrid from '@components/designer/template/VocabGrid';
import VocabManager from '@utils/vocMgr';
import GModal from '@ui/modals/GModal';

function VocabularyListBtn(props) {
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
        <Button
          variant="light"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleShow();
          }}
        >
          {FIcons.faSpellCheck}
        </Button>
      </LTooltip>

      <GModal show={show} onHide={handleClose} dialogClassName="gu_modal-68w">
        <GModal.Header>
          <GModal.Title>LabIMotion Vocabulary (Lab-Vocab) List</GModal.Title>
        </GModal.Header>
        <GModal.Body>
          <VocabGrid
            onVocSelect={handleSelectVoc}
            onVocDelete={handleDeleteVoc}
          />
        </GModal.Body>
        <GModal.Footer>
          <LTooltip idf="close">
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              Close
            </Button>
          </LTooltip>
        </GModal.Footer>
      </GModal>
    </>
  );
}

VocabularyListBtn.propTypes = {
  element: PropTypes.object.isRequired,
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
};

export default VocabularyListBtn;
