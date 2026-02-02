import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingSpinner = () => {
  return (
    <div>
      <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
