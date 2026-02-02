import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'react-bootstrap';
import { condOperatorOptions } from 'generic-ui-core';

/**
 * OperatorSelector - Shared component for restriction operator selection
 * Displays explanation text and buttons for Match One/All/None operators
 */
function OperatorSelector({ selectedOp, onOpChange }) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <small className="text-muted">
        The visibility is controlled by configurable [Layer, Field, Value]
        criteria using <strong>Match One, Match All, or Match None</strong>{' '}
        rules.
      </small>
      <ButtonGroup size="sm">
        {condOperatorOptions.map((option) => (
          <Button
            key={option.value}
            variant={
              selectedOp === option.value ? 'primary' : 'outline-primary'
            }
            onClick={() => onOpChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

OperatorSelector.propTypes = {
  selectedOp: PropTypes.number.isRequired,
  onOpChange: PropTypes.func.isRequired,
};

export default OperatorSelector;
