import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import { fnToggle } from '@ui/common/fnToggle';
import { FN_ID } from '@ui/common/fnConstants';

const RevisionSelector = ({
  isSelected,
  onChange,
  className = "me-2"
}) => {
  return (
    <Form.Check
      type="checkbox"
      checked={isSelected}
      onChange={onChange}
      className={className}
    />
  );
};

RevisionSelector.fnId = FN_ID.FN_DIFF;

RevisionSelector.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

RevisionSelector.defaultProps = {
  className: "me-2",
};

export default fnToggle(RevisionSelector);
