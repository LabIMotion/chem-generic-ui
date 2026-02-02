import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

const ButtonEllipse = ({ children, condSet }) => {
  const [, setShow] = useState(false);
  const [, setIsOpen] = useState(false);

  const handleItemClick = (child, event) => {
    event.stopPropagation();
    setIsOpen(false);
    setShow(false);
    if (child.props.onClick) {
      child.props.onClick(event);
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
        onToggle={(nextShow) => setIsOpen(nextShow)}
      >
        {React.Children.map(
          children,
          (child) =>
            child.type !== Dropdown.Divider
              ? React.cloneElement(child, {
                  onClick: (event) => handleItemClick(child, event),
                })
              : child
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
