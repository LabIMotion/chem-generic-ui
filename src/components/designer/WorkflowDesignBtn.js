/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from '../tools/Constants';
import WorkflowModal from '../elements/WorkflowModal';

const WorkflowDesignBtn = props => {
  const { element, fnSave, genericType } = props;
  const [show, setShow] = useState(false);
  console.log('WorkflowDesignBtn: element=', element);
  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_template_upload">Design workflow</Tooltip>
        }
      >
        <Button bsSize="xs" onClick={() => setShow(true)}>
          Workflow&nbsp;
          <i className="fa fa-sitemap" aria-hidden="true" />
        </Button>
      </OverlayTrigger>
      <WorkflowModal
        element={element}
        fnSaveFlow={fnSave}
        genericType={genericType}
        showProps={{ show, setShow }}
      />
    </>
  );
};

WorkflowDesignBtn.propTypes = {
  element: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
  ]).isRequired,
  fnSave: PropTypes.func.isRequired,
};

export default WorkflowDesignBtn;
