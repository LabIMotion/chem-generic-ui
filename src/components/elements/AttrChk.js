/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const AttrChk = (props) => {
  const { chkAttr, node, attrOpts } = props;
  return (
    <Form>
      {attrOpts.map((e) => (
        <Form.Check
          key={e.value}
          inline
          checked={node.data.value.includes(e.value)}
          onChange={() =>
            chkAttr(e.value, !node.data.value.includes(e.value), node)
          }
          type="checkbox"
          label={e.label}
          className="generic_attr_chks"
        />
      ))}
    </Form>
  );
};

AttrChk.propTypes = {
  chkAttr: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  attrOpts: PropTypes.array.isRequired,
};

export default AttrChk;
