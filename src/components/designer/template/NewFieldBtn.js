/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputGroup } from 'react-bootstrap';
import ButtonTooltip from '../../fields/ButtonTooltip';

const NewFieldBtn = ({ fnUpdate, layer, children }) => {
  const [newFieldKey, setNewFieldKey] = useState('');

  const onInputNewField = (_e) => {
    setNewFieldKey(_e.target.value);
  };

  return (
    <InputGroup>
      <FormControl
        type="text"
        name="field_new"
        placeholder="Input new field name"
        bsSize="sm"
        onChange={(e) => onInputNewField(e)}
        style={{ maxWidth: '140px', boxShadow: 'none' }}
      />
      <span className="input-group-btn">
        <ButtonTooltip
          idf="fld_add"
          fnClick={fnUpdate}
          element={{ layer, newFieldKey }}
          fa="faPlus"
          place="top"
        />
        {children}
      </span>
    </InputGroup>
  );
};

NewFieldBtn.propTypes = {
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
  children: PropTypes.node,
};

NewFieldBtn.defaultProps = { children: null };

export default NewFieldBtn;
