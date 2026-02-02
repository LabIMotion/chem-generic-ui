/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

const DropLinkRenderer = (props) => {
  const { sField, node, onNavi } = props;
  const dId = ((node.data[sField.id] || {}).value || {}).el_id || '';
  const dVal = ((node.data[sField.id] || {}).value || {}).el_short_label || ' ';
  if (dId === '') return <div />;
  return (
    <a role="link" onClick={() => onNavi('sample', dId)} className="lu-link">
      <span className="reaction-material-link">{dVal}</span>
    </a>
  );
};

DropLinkRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  onNavi: PropTypes.func,
};

DropLinkRenderer.defaultProps = { onNavi: () => {} };
export default DropLinkRenderer;
