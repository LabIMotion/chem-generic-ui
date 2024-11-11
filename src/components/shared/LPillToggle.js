import React from 'react';
import PropTypes from 'prop-types';
import '../../assets/pill-toggle.scss';

const LPillToggle = ({ leftText, rightText, isRight, onChange, disabled }) => {
  return (
    <button
      type="button"
      className="pill-toggle-container"
      onClick={() => !disabled && onChange(!isRight)}
      disabled={disabled}
    >
      <div
        className={`border border-primary bg-primary pill-toggle ${
          isRight ? 'active' : ''
        }`}
      >
        <span className="text-white pill-toggle-text">
          {isRight ? rightText : leftText}
        </span>
        <div className="bg-white border border-primary pill-toggle-circle" />
      </div>
    </button>
  );
};

LPillToggle.propTypes = {
  leftText: PropTypes.string.isRequired,
  rightText: PropTypes.string.isRequired,
  isRight: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

LPillToggle.defaultProps = {
  disabled: false,
};

export default LPillToggle;
