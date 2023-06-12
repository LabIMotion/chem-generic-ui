import React, { useState } from 'react';
import Constants from '../components/tools/Constants';
import FlowViewerModal from '../components/flow/FlowViewerModal';
import WorkflowModal from '../components/elements/WorkflowModal';
import WorkflowDesignBtn from '../components/designer/WorkflowDesignBtn';
import el from './_el_sem_v.json';

const SimDnDWF = () => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <h2>Flow Editor</h2>
      <WorkflowDesignBtn
        element={el}
        fnSave={() => {}}
        genericType={Constants.GENERIC_TYPES.ELEMENT}
      />
      {/* <div>
        <Button onClick={() => setShow(true)}>click</Button>
        <WorkflowModal
          element={el}
          fnSaveFlow={() => {}}
          genericType={Constants.GENERIC_TYPES.ELEMENT}
          showProps={{ show, setShow }}
        />
      </div> */}
    </div>
  );
};

export default SimDnDWF;
