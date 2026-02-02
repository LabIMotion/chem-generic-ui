import React from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';

const GenFormGroup = (props) => {
  const { label, value, onChange, name } = props;
  return (
    <Form.Group className="props_text">
      {label ? <Form.Label>{label}</Form.Label> : null}
      <Form.Control
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e, name)}
      />
    </Form.Group>
  );
};

const GenFormGroupSel = (props) => {
  const { label, name, onChange, options, value } = props;
  return (
    <Form.Group className="props_text">
      {label ? <Form.Label>{label}</Form.Label> : null}
      <Select
        isClearable
        name={name}
        multi={false}
        options={options}
        value={options?.find((o) => o.value === value)}
        onChange={(e) => onChange(e, name)}
        menuPlacement="auto"
        menuPortalTarget={document.body}
      />
    </Form.Group>
  );
};

const GenFormGroupCb = (props) => {
  const { label, name, onChange, value } = props;
  return (
    <Form.Group className="props_text">
      {label ? <Form.Label>{label}</Form.Label> : null}
      <Form.Check checked={value} onChange={(e) => onChange(e, name)} />
    </Form.Group>
  );
};

export { GenFormGroup, GenFormGroupCb, GenFormGroupSel };
