/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import ElementSelectModal from '@components/shared/ElementSelectModal';

/**
 * Button component that opens the Element Select Modal
 * Allows users to search and select an element from available elements
 */
const ElementSelectButton = ({ onSelect, label, variant, size, className, disabled }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (element) => {
    onSelect(element);
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        onClick={() => setShowModal(true)}
      >
        {label}
      </Button>
      <ElementSelectModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSelect={handleSelect}
      />
    </>
  );
};

ElementSelectButton.propTypes = {
  onSelect: PropTypes.func.isRequired,
  label: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

ElementSelectButton.defaultProps = {
  label: 'Link Element',
  variant: 'success',
  size: 'xsm',
  className: '',
  disabled: false,
};

export default ElementSelectButton;
