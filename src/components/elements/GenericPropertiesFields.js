import React from 'react';
import { Checkbox, FormGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';

const GenFormGroup = props => (
  <FormGroup className="text_generic_properties">
    {props.label || '' }
    <FormControl type="text" value={props.value || ''} onChange={e => props.onChange(e, props.name)} />
  </FormGroup>
);

const GenFormGroupSel = props => (
  <FormGroup className="text_generic_properties">
    {props.label || '' }
    <Select
      isClearable
      name={props.name}
      multi={false}
      options={props.options}
      value={props.options?.find(o => o.value === props.value)}
      onChange={e => props.onChange(e, props.name)}
    />
  </FormGroup>
);

const GenFormGroupCb = props => (
  <FormGroup className="text_generic_properties">
    {props.label || '' }
    <Checkbox checked={props.value} onChange={e => props.onChange(e, props.name)} />
  </FormGroup>
);

export { GenFormGroup, GenFormGroupCb, GenFormGroupSel };
