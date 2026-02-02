/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useReducer } from 'react';
import { Button } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import { FieldTypes } from 'generic-ui-core';
import LayerForm from '@components/designer/template/LayerForm';
import LayerSaveModal from '@components/elements/LayerSaveModal';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import LayerManager from '@utils/desMgr';
import NotificationMessage from '@components/designer/template/NotificationMessage';
import { validateLayerInput } from '@utils/template/standard-validation';
import { mergeOptions } from '@utils/template/remodel-handler';

const extractOptionsFromTable = (_layer, _data) => {
  const options = { select_options: {} };
  const layer = cloneDeep(_layer);
  const data = cloneDeep(_data);
  const selectFields = layer.fields.filter(
    (field) => field.type === FieldTypes.F_TABLE
  );
  selectFields.forEach((selectField) => {
    // TODO: Implement the logic to extract options from table fields
    // For each table field, a property "sub_fields" is an array of objects, each object has a property "type"
    // If the type is "select", then a property "option_layers" may exist, which is a string, and we use it to search the data?.properties_template?.select_options to get the options
    (selectField.sub_fields || []).forEach((subField) => {
      if (
        [FieldTypes.F_SELECT, FieldTypes.F_SELECT_MULTI].includes(subField.type) &&
        subField.option_layers
      ) {
        const optionLayerKey = subField.option_layers;
        if (data?.properties_template?.select_options?.[optionLayerKey]) {
          // Add the entire matching object to the result
          options.select_options[optionLayerKey] =
            data.properties_template.select_options[optionLayerKey];
          options.select_options[optionLayerKey].desc = optionLayerKey;
        }
      }
    });
  });
  // Check if any options, otherwise return null
  if (Object.keys(options.select_options || {}).length === 0) {
    return null;
  }
  return options;
};

const extractOptions = (_layer, _data) => {
  const options = { select_options: {} };
  const layer = cloneDeep(_layer);
  const data = cloneDeep(_data);
  // Extract the "select" type fields
  const selectFields = layer.fields.filter((field) =>
    [FieldTypes.F_SELECT, FieldTypes.F_SELECT_MULTI].includes(field.type)
  );
  // For each select field, use the option_layers to find the matching options
  selectFields.forEach((selectField) => {
    const optionLayerKey = selectField.option_layers;
    // Check if it has options for this layer key
    if (data?.properties_template?.select_options?.[optionLayerKey]) {
      // Add the entire matching object to the result
      options.select_options[optionLayerKey] =
        data.properties_template.select_options[optionLayerKey];
      options.select_options[optionLayerKey].desc = optionLayerKey;
    }
  });
  // Check if any options, otherwise return null
  if (Object.keys(options.select_options || {}).length === 0) {
    return null;
  }
  return options;
};

const initialState = {
  show: false,
  layer: null,
  data: null,
  notify: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'reset':
      return {
        ...initialState,
        layer: action.payload.layer,
        data: action.payload.data,
      };
    default: {
      return { ...state, [action.type]: action.payload };
    }
  }
};

const LayerSaveBtn = (props) => {
  const { layer: initialLayer, data: initialData } = props;

  // 1. State declarations
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    layer: initialLayer,
    data: initialData,
  });

  // 2. Side effects
  useEffect(() => {
    dispatch({ type: 'layer', payload: initialLayer });
  }, [initialLayer]);

  useEffect(() => {
    dispatch({ type: 'data', payload: initialData });
  }, [initialData]);

  // 3. Event handlers and other functions
  const inputChange = (_field, _value) => {
    dispatch({ type: 'layer', payload: { ...state.layer, [_field]: _value } });
  };

  const handleSave = async () => {
    let res = validateLayerInput(state.layer);
    if (!res.isSuccess) {
      dispatch({ type: 'notify', payload: res });
    } else {
      const options = extractOptions(state.layer, state.data);
      const optionsFromTable = extractOptionsFromTable(state.layer, state.data);
      const mergedOptions = mergeOptions(optionsFromTable || {}, options || {});
      const saveInput = {
        ...state.layer,
        ...mergedOptions,
      };
      res = await LayerManager.saveStandardLayer(saveInput);
      dispatch({ type: 'notify', payload: res.notify });
    }
  };

  const handleReset = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    dispatch({
      type: 'reset',
      payload: { layer: initialLayer, data: initialData },
    });
  };

  // 4. Render-related variables
  const saveButton = (
    <Button
      key="success"
      variant="success"
      onClick={(e) => {
        e.stopPropagation();
        handleSave();
      }}
    >
      Save
    </Button>
  );

  const resetButton = (
    <Button key="primary" variant="secondary" onClick={(e) => handleReset(e)}>
      Close
    </Button>
  );

  // 5. Return statement (JSX)
  return (
    <>
      <LTooltip idf="lyr_add2std">
        <Button
          variant="light"
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'show', payload: true });
          }}
        >
          {FIcons.faGlobe}
        </Button>
      </LTooltip>
      <LayerSaveModal
        acts={[saveButton, resetButton]}
        title="Standard Layer"
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
          <LayerForm
            init={initialLayer}
            layer={state.layer}
            onChange={inputChange}
          />
        </>
      </LayerSaveModal>
    </>
  );
};

export default LayerSaveBtn;
