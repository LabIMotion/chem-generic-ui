import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton } from 'react-bootstrap';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const ButtonEllipse = React.forwardRef(
  ({ children, show, setShow, condSet }, ref) => {
    return (
      <LTooltip idf="more_func">
        <DropdownButton
          bsStyle={condSet ? 'warning' : 'default'}
          title={FIcons.faEllipsis}
          noCaret
          id="dropdown-no-caret"
          bsSize="sm"
        >
          {children}
        </DropdownButton>
      </LTooltip>
    );
  }
);

ButtonEllipse.propTypes = {
  children: PropTypes.node.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  condSet: PropTypes.bool.isRequired,
};

ButtonEllipse.displayName = 'ButtonEllipse';

export default ButtonEllipse;
