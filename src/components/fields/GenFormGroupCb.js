import React from 'react';
import { Checkbox, FormGroup } from 'react-bootstrap';

const GenFormGroupCb = (props) => {
  const {
    label, value, name, onChange
  } = props;
  return (
    <FormGroup className="text_generic_properties">
      {label || '' }
      <Checkbox checked={value} onChange={e => onChange(e, name)} />
    </FormGroup>
  );
};

export default GenFormGroupCb;
