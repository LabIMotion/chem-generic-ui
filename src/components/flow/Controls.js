import React, { memo, useCallback } from 'react';
import { useZoomPanHelper } from 'react-flow-renderer';
import { Button, OverlayTrigger, Tooltip, Popover, ControlLabel } from 'react-bootstrap';

const Controls = ({ rfInstance, setElements, element, fnSave }) => {
  const { transform } = useZoomPanHelper();

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      fnSave({ flowObject: flow });
    }
  }, [rfInstance]);

  return (
    <div className="save__controls">
      <Button bsSize="xs" onClick={() => fnSave()}>Save to draft&nbsp;<i className="fa fa-floppy-o" aria-hidden="true" /></Button>
    </div>
  );
};

export default memo(Controls);
