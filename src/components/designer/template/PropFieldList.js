/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Form, InputGroup } from 'react-bootstrap';
import renderDeleteButton from '@components/admin/renderDeleteButton';

const PropFieldList = (props) => {
  const { generic, root, fnInputChg, fnDel } = props;

  const options =
    generic?.properties_template?.select_options[root]?.options || [];
  if (options.length < 1) return null;

  const Option = ({ name, label }) => {
    return (
      <Form.Group size="sm" controlId={`_cgu_frmSelectOption_${name}`}>
        <InputGroup>
          <InputGroup.Text>{name}</InputGroup.Text>
          <Form.Control
            type="text"
            name="lf_label"
            defaultValue={label}
            onChange={(event) => fnInputChg(event, name, root)}
          />
          {renderDeleteButton(generic, 'Option', name, root, fnDel)}
        </InputGroup>
      </Form.Group>
    );
  };

  return (
    <Col md={12}>
      <Card.Body>
        {options.map((o) => (
          <div key={`${o.key}_${root}`} className="mb-2">
            <Option name={o.key} label={o.label} />
          </div>
        ))}
      </Card.Body>
    </Col>
  );
};

PropFieldList.propTypes = {
  generic: PropTypes.object.isRequired,
  root: PropTypes.string.isRequired,
  fnInputChg: PropTypes.func.isRequired,
  fnDel: PropTypes.func.isRequired,
};

export default PropFieldList;
