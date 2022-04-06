import React from 'react';
import ButtonDelField from '../fields/ButtonDelField';

const renderDeleteButton = (generic, delType, delKey, delRoot, fnConfirm) => (
  <ButtonDelField
    generic={generic}
    delType={delType}
    delKey={delKey}
    delRoot={delRoot}
    fnConfirm={fnConfirm}
  />
);

export default renderDeleteButton;
