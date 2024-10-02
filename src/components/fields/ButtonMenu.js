import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from 'react-bootstrap';

const ButtonMenu = ({ children, id, fnClick, bls }) => {
  return (
    <MenuItem eventKey={`${id}_menu_item`} onClick={fnClick} className={bls}>
      <>{children}</>
    </MenuItem>
  );
};

ButtonMenu.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  fnClick: PropTypes.func.isRequired,
  bls: PropTypes.string,
};

ButtonMenu.defaultProps = { bls: '' };

export default ButtonMenu;
