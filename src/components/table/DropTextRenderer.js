/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import LTooltip from '../shared/LTooltip';

const DropTextRenderer = (props) => {
  const { attr, sField, node } = props;
  let displayValue =
    ((node.data[sField.id] || {}).value || {})[`el_${attr.value}`] || '';
  displayValue =
    attr.value === 'molecular_weight' && displayValue !== ''
      ? displayValue.toFixed(6)
      : displayValue;

  const handleCopy = () => {
    copy(displayValue);
  };

  return (
    <LTooltip idf="clipboard">
      <div
        role="button"
        tabIndex={0}
        className="clipboardBtn"
        onClick={handleCopy}
        onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
        style={{ wordBreak: 'break-all', cursor: 'copy' }}
      >
        {displayValue}
      </div>
    </LTooltip>
  );
};
DropTextRenderer.propTypes = {
  attr: PropTypes.object.isRequired,
  sField: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
};

export default DropTextRenderer;
