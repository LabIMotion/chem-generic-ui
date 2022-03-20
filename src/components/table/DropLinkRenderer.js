/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
// import Aviator from 'aviator';
// import UIStore from '../stores/UIStore';

// const linkSample = (type, id) => {
//   const { currentCollection, isSync } = UIStore.getState();
//   const collectionUrl = (!isNaN(id)) ?
//     `${currentCollection.id}/${type}/${id}` : `${currentCollection.id}/${type}`;
//   Aviator.navigate(isSync ? `/scollection/${collectionUrl}` : `/collection/${collectionUrl}`);
// };

const DropLinkRenderer = (props) => {
  const { sField, node, onLink } = props;
  const dId = ((node.data[sField.id] || {}).value || {}).el_id || '';
  const dVal = ((node.data[sField.id] || {}).value || {}).el_short_label || ' ';
  if (dId === '') return <div />;
  return (
    <a role="link" onClick={() => onLink('sample', dId)} style={{ cursor: 'pointer' }}>
      <span className="reaction-material-link">{dVal}</span>
    </a>
  );
};

DropLinkRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  onLink: PropTypes.func.isRequired
};

export default DropLinkRenderer;
