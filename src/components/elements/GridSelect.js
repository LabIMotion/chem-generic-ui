/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const GridSelect = (props) => {
  const { all, onChange, node, dVal } = props;
  return (
    <Form.Group>
      <Form.Control
        as="select"
        placeholder="select..."
        onChange={(e) => onChange(e, node)}
        defaultValue={dVal}
        id={`${node.data.id}__${dVal}`}
      >
        {all.map((e) => (
          <option key={e.key} value={e.val}>
            {e.lab}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  );
};

GridSelect.propTypes = {
  all: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      val: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      lab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  dVal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default GridSelect;
