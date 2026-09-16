import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

function LFormGroup({ children, className, ...otherProps }) {
  return (
    <Form.Group className={`mb-3 ${className || ''}`} {...otherProps}>
      {children}
    </Form.Group>
  );
}

LFormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

LFormGroup.defaultProps = {
  className: '',
};

export default LFormGroup;
