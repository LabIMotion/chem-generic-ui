/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import {
  verifyConditionLayer,
  handleLayerConditionChange,
} from '../../../utils/template/condition-handler';
import VocabularyListModal from '../../elements/VocabularyListModal';
import { handleAddVocabulary } from '../../../utils/template/field-handler';
import LTooltip from '../../shared/LTooltip';
import FIcons from '../../icons/FIcons';

const VocabularyListBtn = (props) => {
  const { element, fnUpdate, layer, sortedLayers, vocabularies } = props;
  const [show, setShow] = useState(false);

  const onClick = () => {
    const result = verifyConditionLayer(element, layer.key);
    const { notify } = result;
    if (notify.isSuccess) {
      setShow(true);
    } else {
      fnUpdate(result);
    }
  };

  const onClose = () => {
    setShow(false);
  };

  const updLayerSubField = (_layerKey, _layer) => {
    element.properties_template.layers[`${_layerKey}`] = _layer;
    const result = handleLayerConditionChange(element, _layerKey);
    fnUpdate(result);
  };

  const addVocabulary = (_e) => {
    const result = handleAddVocabulary(element, layer, _e);
    fnUpdate(result);
  };

  return (
    <>
      <LTooltip idf="voc_add">
        <Button bsSize="sm" onClick={onClick}>
          {FIcons.faSpellCheck}
        </Button>
      </LTooltip>
      <VocabularyListModal
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
      />
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
