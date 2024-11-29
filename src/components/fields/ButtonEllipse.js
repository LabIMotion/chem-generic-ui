import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import FIcons from '../icons/FIcons';

const ButtonEllipse = ({ children, condSet }) => {
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (child, event) => {
    event.stopPropagation();
    setIsOpen(false); // Close the dropdown
    setShow(false); // Hide the tooltip
    if (child.props.onClick) {
      child.props.onClick(event); // Trigger original onClick handler if any
    }
  };

  return (
    <>
      <DropdownButton
        variant={condSet ? 'warning' : 'default'}
        title={FIcons.faEllipsis}
        as={ButtonGroup}
        className="ug-no-caret"
        id="dropdown-no-caret"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => !isOpen && setShow(true)} // Show tooltip on hover if dropdown is closed
        onMouseLeave={() => setShow(false)} // Hide tooltip when not hovering
        onToggle={(nextShow) => setIsOpen(nextShow)} // Set dropdown open/close state
      >
        {React.Children.map(
          children,
          (child) =>
            child.type !== Dropdown.Divider
              ? React.cloneElement(child, {
                  onClick: (event) => handleItemClick(child, event), // Handle item click
                })
              : child // Pass dividers directly
        )}
      </DropdownButton>
    </>
  );
};

ButtonEllipse.propTypes = {
  children: PropTypes.node.isRequired,
  condSet: PropTypes.bool.isRequired,
};

export default ButtonEllipse;
