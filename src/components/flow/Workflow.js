/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import DnDFlow from './DnDFlow';

const Workflow = props => {
  const { element, fnSaveFlow } = props;
  if (Object.keys(element).length < 1) return null;
  return <DnDFlow element={element} fnSave={fnSaveFlow} />;
};

Workflow.propTypes = {
  element: PropTypes.object.isRequired,
  fnSaveFlow: PropTypes.func.isRequired,
};

export default Workflow;
