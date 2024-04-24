/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputGroup } from 'react-bootstrap';
import ButtonTooltip from '../../fields/ButtonTooltip';

const NewFieldBtn = props => {
  const { fnUpdate, layer } = props;
  const [newFieldKey, setNewFieldKey] = useState('');

  const onInputNewField = _e => {
    setNewFieldKey(_e.target.value);
  };

  return (
    <>
      <FormControl
        type="text"
        name="field_new"
        placeholder="Input new field name"
        bsSize="sm"
        onChange={e => onInputNewField(e)}
        style={{ maxWidth: '140px' }}
      />
      <InputGroup.Button>
        <ButtonTooltip
          tip="Add new field"
          fnClick={fnUpdate}
          element={{ layer, newFieldKey }}
          fa="faPlus"
          place="top"
        />
      </InputGroup.Button>
    </>
  );
};

NewFieldBtn.propTypes = {
  fnUpdate: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
};

export default NewFieldBtn;
