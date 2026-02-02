import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import FIcons from '@components/icons/FIcons';
import { fnToggle } from '@ui/common/fnToggle';
import { FN_ID } from '@ui/common/fnConstants';

const ContributeTemplateButton = ({ onClick, disabled = false, text = '' }) => {
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant="primary"
      disabled={disabled}
      className="me-2"
    >
      {FIcons.faPaperPlane} Contribute to Template Hub {text}
    </Button>
  );
};

ContributeTemplateButton.fnId = FN_ID.FN_CONTRIBUTE_TEMPLATE;

ContributeTemplateButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  text: PropTypes.string,
};

ContributeTemplateButton.defaultProps = {
  disabled: false,
  text: '',
};

export default fnToggle(ContributeTemplateButton);
