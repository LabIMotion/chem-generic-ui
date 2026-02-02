import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { fnToggle } from '@ui/common/fnToggle';
import { FN_ID } from '@ui/common/fnConstants';

const CompareButton = ({
  onClick,
  disabled = false,
  selectedCount = 0
}) => {
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={
        selectedCount !== 2
          ? 'Select exactly 2 revisions to compare'
          : 'Compare selected revisions'
      }
    >
      Compare ({selectedCount})
    </Button>
  );
};

CompareButton.fnId = FN_ID.FN_DIFF;

CompareButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  selectedCount: PropTypes.number,
};

CompareButton.defaultProps = {
  disabled: false,
  selectedCount: 0,
};

export default fnToggle(CompareButton);
