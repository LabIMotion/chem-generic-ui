import React from 'react';
import { Form } from 'react-bootstrap';

const GenFormGroupCb = (props) => {
  const { label, value, name, onChange } = props;
  return (
    <Form.Group className="text_generic_properties">
      {label || ''}
      <Form.Check checked={value} onChange={(e) => onChange(e, name)} />
    </Form.Group>
  );
};

export default GenFormGroupCb;
