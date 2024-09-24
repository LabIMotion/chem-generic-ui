/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useReducer } from 'react';
import { Button } from 'react-bootstrap';
import { cloneDeep } from 'lodash';
import LayerForm from './LayerForm';
import LayerSaveModal from '../../elements/LayerSaveModal';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';
import LayerManager from '../../../utils/desMgr';
import NotificationMessage from './NotificationMessage';
import { validateLayerInput } from '../../../utils/template/standard-validation';

const extractOptions = (_layer, _data) => {
  const options = { select_options: {} };
  const layer = cloneDeep(_layer);
  const data = cloneDeep(_data);
  // Extract the "select" type fields
  const selectFields = layer.fields.filter((field) => field.type === 'select');
  // For each select field, use the option_layers to find the matching options
  selectFields.forEach((selectField) => {
    const optionLayerKey = selectField.option_layers;
    // Check if it has options for this layer key
    if (data?.properties_template?.select_options?.[optionLayerKey]) {
      // Add the entire matching object to the result
      options.select_options[optionLayerKey] =
        data.properties_template.select_options[optionLayerKey];
    }
  });
  // Check if any options, otherwise return null
  if (Object.keys(options.select_options).length === 0) {
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
      const saveInput = {
        ...state.layer,
        ...options,
      };
      // console.log('saveInput', saveInput);
      res = await LayerManager.saveStandardLayer(saveInput);
      dispatch({ type: 'notify', payload: res.notify });
    }
  };

  const handleReset = () => {
    dispatch({
      type: 'reset',
      payload: { layer: initialLayer, data: initialData },
    });
  };

  // 4. Render-related variables
  const saveButton = (
    <Button key="success" bsStyle="success" onClick={handleSave}>
      Save
    </Button>
  );

  const resetButton = (
    <Button key="primary" bsStyle="primary" onClick={handleReset}>
      Close
    </Button>
  );

  // 5. Return statement (JSX)
  return (
    <>
      <LTooltip idf="add_std_layer">
        <Button
          bsSize="sm"
          onClick={() => dispatch({ type: 'show', payload: true })}
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
