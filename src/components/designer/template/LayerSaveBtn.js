/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useReducer } from 'react';
import { Button } from 'react-bootstrap';
import LayerForm from './LayerForm';
import LayerSaveModal from '../../elements/LayerSaveModal';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';
import LayerManager from '../../../utils/desMgr';
import NotificationMessage from './NotificationMessage';
import { validateLayerInput } from '../../../utils/template/standard-validation';

const initialState = {
  show: false,
  layer: null,
  notify: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'reset':
      return { ...initialState, layer: action.payload };
    default: {
      return { ...state, [action.type]: action.payload };
    }
  }
};

const LayerSaveBtn = (props) => {
  const { layer: initialLayer } = props;

  // 1. State declarations
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    layer: initialLayer,
  });

  // 2. Side effects
  useEffect(() => {
    dispatch({ type: 'layer', payload: initialLayer });
  }, [initialLayer]);

  // 3. Event handlers and other functions
  const inputChange = (_field, _value) => {
    dispatch({ type: 'layer', payload: { ...state.layer, [_field]: _value } });
  };

  const handleSave = async () => {
    console.log('layer=', state.layer);
    let res = validateLayerInput(state.layer);
    if (!res.isSuccess) {
      dispatch({ type: 'notify', payload: res });
    } else {
      res = await LayerManager.saveStandardLayer(state.layer);
      dispatch({ type: 'notify', payload: res });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'reset', payload: initialLayer });
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
          {FIcons.faFloppyDisk}
        </Button>
      </LTooltip>
      <LayerSaveModal
        acts={[saveButton, resetButton]}
        title="Layer Standards"
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
