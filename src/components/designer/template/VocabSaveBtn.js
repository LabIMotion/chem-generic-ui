/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useReducer } from 'react';
import { Button } from 'react-bootstrap';
import { cloneDeep } from 'lodash';
import { FieldTypes } from 'generic-ui-core';
import VocabForm from './VocabForm';
import LayerSaveModal from '../../elements/LayerSaveModal';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';
import VocabManager from '../../../utils/vocMgr';
import NotificationMessage from './NotificationMessage';
import TermLink from '../../fields/TermLink';

const extractOptionsFromField = (_field, _data) => {
  const options = { select_options: {} };
  const field = cloneDeep(_field);
  const data = cloneDeep(_data);
  // Extract the "select" type fields
  if (field.type === FieldTypes.F_SELECT) {
    const optionLayerKey = field.option_layers;
    // Check if it has options for this layer key
    if (data?.properties_template?.select_options?.[optionLayerKey]) {
      // Add the entire matching object to the result
      options.select_options[optionLayerKey] =
        data.properties_template.select_options[optionLayerKey];
      options.select_options[optionLayerKey].desc = optionLayerKey;
    }
  }
  // Check if any options, otherwise return null
  if (Object.keys(options.select_options || {}).length === 0) {
    return null;
  }
  return options;
};

const initialState = {
  show: false,
  field: null,
  data: null,
  notify: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'reset':
      return {
        ...initialState,
        field: action.payload.field,
        data: action.payload.data,
      };
    default: {
      return { ...state, [action.type]: action.payload };
    }
  }
};

const VocabSaveBtn = (props) => {
  const { field: initialField, data: initialData } = props;

  // 1. State declarations
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    field: initialField,
    data: initialData,
  });

  // 2. Side effects
  useEffect(() => {
    dispatch({ type: 'field', payload: initialField });
  }, [initialField]);

  useEffect(() => {
    dispatch({ type: 'data', payload: initialData });
  }, [initialData]);

  const handleSave = async () => {
    const options = extractOptionsFromField(state.field, state.data);
    const saveInput = {
      ...state.field,
      ...options,
    };
    // console.log('saveInput=', saveInput);
    const res = await VocabManager.saveVocabulary(saveInput);
    dispatch({ type: 'notify', payload: res.notify });
  };

  const handleReset = () => {
    dispatch({
      type: 'reset',
      payload: { field: initialField, data: initialData },
    });
  };

  // 3. Render-related variables
  const saveButton = (
    <Button
      key="success"
      bsStyle="success"
      onClick={handleSave}
      disabled={!TermLink(initialField.ontology, initialField.ontology?.label)}
    >
      Save
    </Button>
  );

  const resetButton = (
    <Button key="primary" bsStyle="primary" onClick={handleReset}>
      Close
    </Button>
  );

  // 4. Return statement (JSX)
  return (
    <>
      <LTooltip idf="voc_add">
        <Button
          bsSize="sm"
          onClick={() => dispatch({ type: 'show', payload: true })}
        >
          {FIcons.faSpellCheck}
        </Button>
      </LTooltip>
      <LayerSaveModal
        acts={[saveButton, resetButton]}
        title="Vocabulary"
        showProps={{
          show: state.show,
          setShow: (value) => dispatch({ type: 'show', payload: value }),
        }}
        close={handleReset}
      >
        <>
          <NotificationMessage
            notify={state.notify}
            onClose={() => dispatch({ type: 'notify', payload: null })}
          />
          <VocabForm init={initialField} />
        </>
      </LayerSaveModal>
    </>
  );
};

export default VocabSaveBtn;
