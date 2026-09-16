import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import '@components/icons/fa4-to-fa7-map';

function LoadingSpinner() {
  return (
    <div>
      <FontAwesomeIcon
        icon={findIconDefinition({ prefix: 'fas', iconName: 'spinner' })}
        spin
        size="2x"
      />
      <p>Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
