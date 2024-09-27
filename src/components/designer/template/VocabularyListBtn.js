/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import {
  verifyConditionLayer,
  handleLayerConditionChange,
} from '../../../utils/template/condition-handler';
// import VocabularyListModal from '../../elements/VocabularyListModal';
import { handleAddVocabulary } from '../../../utils/template/field-handler';
import LTooltip from '../../shared/LTooltip';
import FIcons from '../../icons/FIcons';
import VocabGrid from './VocabGrid';

const VocabularyListBtn = (props) => {
  const { element, fnUpdate, layer, sortedLayers, vocabularies } = props;
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleSelectVoc = (params) => {
    console.log('params=', params);
    // addVocabulary(params.data?.properties);
    // setShow(false);
  };

  const handleDeleteVoc = (params) => {
    fnDelete(params.data);
    setShow(false);
  };

  const onClick = () => {
    const result = verifyConditionLayer(element, layer.key);
    const { notify } = result;
    if (notify.isSuccess) {
      setShow(true);
    } else {
      fnUpdate(result);
    }
  };

  const addVocabulary = (_e) => {
    const result = handleAddVocabulary(element, layer, _e);
    fnUpdate(result);
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
  sortedLayers: PropTypes.array.isRequired,
  vocabularies: PropTypes.array,
};

VocabularyListBtn.defaultProps = { vocabularies: [] };

export default VocabularyListBtn;
