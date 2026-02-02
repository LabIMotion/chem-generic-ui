/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup } from 'react-bootstrap';
import ButtonTooltip from '@components/fields/ButtonTooltip';

const NewFieldBtn = ({ fnUpdate, layer, children }) => {
  const [newFieldKey, setNewFieldKey] = useState('');

  const onInputNewField = (_e) => {
    setNewFieldKey(_e.target.value);
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()} // Prevent accordion collapse on click
      onClick={(e) => e.stopPropagation()} // Prevent accordion collapse on click
      onKeyDown={(e) => e.stopPropagation()} // Add keyboard listener
      role="button" // Add role for accessibility
      tabIndex={0} // Make the div focusable
    >
      <InputGroup>
        <Form.Control
          type="text"
          name="field_new"
          placeholder="Input new field name"
          size="sm"
          onChange={(e) => onInputNewField(e)}
          onFocus={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{ maxWidth: '140px', boxShadow: 'none' }}
        />
        <ButtonTooltip
          idf="fld_add"
          fnClick={fnUpdate}
          element={{ layer, newFieldKey }}
          fa="faPlus"
          place="top"
        />
        {children}
      </InputGroup>
    </div>
  );
};

NewFieldBtn.propTypes = {
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
  children: PropTypes.node,
};

NewFieldBtn.defaultProps = { children: null };

export default NewFieldBtn;
