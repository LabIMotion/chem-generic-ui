import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import FIcons from '@components/icons/FIcons';

const FULL_SCREEN_CONFIG = new Map([
  [
    false,
    {
      idf: 'scn_full',
      fa: 'faUpRightAndDownLeftFromCenter',
      label: 'Full Screen',
    },
  ],
  [
    true,
    {
      idf: 'scn_full_exit',
      fa: 'faDownLeftAndUpRightToCenter',
      label: 'Exit Full Screen',
    },
  ],
]);

const FullScreenToggle = ({ isFullScreen, onToggle }) => {
  const config = FULL_SCREEN_CONFIG.get(isFullScreen);

  return (
    <Button onClick={onToggle} size="sm" variant="light">
      {FIcons[config?.fa]} {config?.label}
    </Button>
  );
};

FullScreenToggle.propTypes = {
  isFullScreen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default FullScreenToggle;
