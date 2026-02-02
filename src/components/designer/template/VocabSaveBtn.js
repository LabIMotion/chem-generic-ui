/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useReducer } from 'react';
import { Button } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import { FieldTypes } from 'generic-ui-core';
import VocabForm from '@components/designer/template/VocabForm';
import LayerSaveModal from '@components/elements/LayerSaveModal';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import VocabManager from '@utils/vocMgr';
import NotificationMessage from '@components/designer/template/NotificationMessage';
import TermLink from '@components/fields/TermLink';
import { UnsVocBase } from '@components/elements/BaseFields';

const extractOptionsFromField = (_field, _data) => {
  const options = { select_options: {} };
  const field = cloneDeep(_field);
  const data = cloneDeep(_data);
  // Extract the "select"/"select-multi" type fields
  if ([FieldTypes.F_SELECT, FieldTypes.F_SELECT_MULTI].includes(field.type)) {
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
  layer: null,
  data: null,
  notify: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'reset':
      return {
        ...initialState,
        field: action.payload.field,
        layer: action.payload.layer,
        data: action.payload.data,
      };
    default: {
      return { ...state, [action.type]: action.payload };
    }
  }
};

const VocabSaveBtn = (props) => {
  const {
    field: initialField,
    data: initialData,
    layer: initialLayer,
    genericType,
  } = props;

  // 1. State declarations
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    field: initialField,
    data: initialData,
    layer: initialLayer,
  });

  // 2. Side effects
  useEffect(() => {
    dispatch({ type: 'field', payload: initialField });
  }, [initialField]);

  useEffect(() => {
    dispatch({ type: 'data', payload: initialData });
  }, [initialData]);

  useEffect(() => {
    dispatch({ type: 'layer', payload: initialLayer });
  }, [initialLayer]);

  const handleSave = async () => {
    const extra = {
      source: genericType,
      source_id: state.data.identifier,
      layer_id: state.layer.key,
    };
    const options = extractOptionsFromField(state.field, state.data);
    const saveInput = {
      ...state.field,
      ...options,
      term_id: state.field.ontology?.short_form,
      ...extra,
      voc: { ...extra },
    };
    // change the attribute 'field' to 'name', and 'type' to 'field_type'
    saveInput.name = saveInput.field;
    saveInput.field_type = saveInput.type;
    delete saveInput.field;
    delete saveInput.type;
    const res = await VocabManager.saveVocabulary(saveInput);
    dispatch({ type: 'notify', payload: res.notify });
  };

  const handleReset = () => {
    dispatch({
      type: 'reset',
      payload: { field: initialField, data: initialData, layer: initialLayer },
    });
  };

  // 3. Render-related variables
  const saveButton = (
    <Button
      key="success"
      variant="success"
      onClick={handleSave}
      disabled={
        !TermLink(state.field.ontology, state.field.ontology?.label) ||
        UnsVocBase.some((item) => item.name === state.field.type)
      }
    >
      Save
    </Button>
  );

  const resetButton = (
    <Button key="secondary" variant="secondary" onClick={handleReset}>
      Close
    </Button>
  );

  // 4. Return statement (JSX)
  return (
    <>
      <LTooltip idf="voc_add">
        <Button
          variant="light"
          onClick={() => dispatch({ type: 'show', payload: true })}
        >
          {FIcons.faSpellCheck}
        </Button>
      </LTooltip>
      <LayerSaveModal
        acts={[saveButton, resetButton]}
        title="LabIMotion Vocabulary (Lab-Vocab)"
        showProps={{
          show: state.show,
          setShow: (value) => dispatch({ type: 'show', payload: value }),
        }}
        close={handleReset}
      >
        <div>
          <NotificationMessage
            notify={state.notify}
            onClose={() => dispatch({ type: 'notify', payload: null })}
          />
          <VocabForm init={state.field} />
        </div>
      </LayerSaveModal>
    </>
  );
};

export default VocabSaveBtn;
