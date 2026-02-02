import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const LFormGroup = ({ children, className, ...otherProps }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Form.Group className={`mb-3 ${className || ''}`} {...otherProps}>
    {children}
  </Form.Group>
);

LFormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

LFormGroup.defaultProps = {
  className: '',
};

export default LFormGroup;
