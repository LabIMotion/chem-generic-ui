import React from 'react';
import PropTypes from 'prop-types';
import FIcons from '@components/icons/FIcons';

export const LHText = ({ title, children }) => {
  return (
    <span>
      <span className="h5 d-inline">{title}: </span>
      {children}
    </span>
  );
};

LHText.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export const LWf = ({ wf = false }) => {
  if (!wf) return null;
  return <span>{FIcons.faChartDiagram}</span>;
};

LWf.propTypes = { wf: PropTypes.bool };
LWf.defaultProps = { wf: false };
