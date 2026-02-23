import React from 'react';
import PropTypes from 'prop-types';

/**
 * A progress bar that uses dots/circles to indicate progress.
 */
const DotProgressBar = ({
  now,
  maxDots = 10,
  variant = 'primary',
  shape = 'dot',
  className = '',
}) => {
  const filledDots = Math.round((now / 100) * maxDots);
  const dots = Array.from({ length: maxDots });

  const getDotClass = (index) => {
    const isFilled = index < filledDots;
    return `lu_dot ${isFilled ? 'filled' : 'empty'} variant-${variant} shape-${shape}`;
  };

  return (
    <div className={`lu_dot-progress-container ${className}`}>
      {dots.map((_, i) => (
        <div key={i} className={getDotClass(i)} />
      ))}
    </div>
  );
};

DotProgressBar.propTypes = {
  now: PropTypes.number.isRequired,
  maxDots: PropTypes.number,
  variant: PropTypes.string,
  shape: PropTypes.oneOf(['dot', 'square']),
  className: PropTypes.string,
};

export default DotProgressBar;
