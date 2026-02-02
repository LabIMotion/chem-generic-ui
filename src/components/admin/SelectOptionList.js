/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Form, InputGroup } from 'react-bootstrap';
import renderDeleteButton from '@components/admin/renderDeleteButton';

const OptionComponent = ({ name, label, generic, root, fnInputChg, fnDel }) => {
  const [inputValue, setInputValue] = useState(label);

  React.useEffect(() => {
    setInputValue(label);
  }, [label]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    fnInputChg(event, name, root);
  };

  return (
    <Form.Group size="sm" controlId={`_cgu_frmSelectOption_${name}`}>
      <InputGroup>
        <InputGroup.Text>{name}</InputGroup.Text>
        <Form.Control
          type="text"
          name="lf_label"
          value={inputValue}
          onChange={handleChange}
        />
        {renderDeleteButton(generic, 'Option', name, root, fnDel)}
      </InputGroup>
    </Form.Group>
  );
};

const Option = React.memo(OptionComponent);
Option.displayName = 'SelectOption';

const SelectOptionList = (props) => {
  const { generic, root, fnInputChg, fnDel } = props;

  const options =
    generic?.properties_template?.select_options[root]?.options || [];
  if (options.length < 1) return null;

  return (
    <Col md={12}>
      <Card.Body>
        {options.map((o) => (
          <div key={`${o.key}_${root}`} className="mb-2">
            <Option
              name={o.key}
              label={o.label}
              generic={generic}
              root={root}
              fnInputChg={fnInputChg}
              fnDel={fnDel}
            />
          </div>
        ))}
      </Card.Body>
    </Col>
  );
};

SelectOptionList.propTypes = {
  generic: PropTypes.object.isRequired,
  root: PropTypes.string.isRequired,
  fnInputChg: PropTypes.func.isRequired,
  fnDel: PropTypes.func.isRequired,
};

export default SelectOptionList;
