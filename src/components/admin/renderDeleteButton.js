import React from 'react';
import ButtonDelField from '../fields/ButtonDelField';

const renderDeleteButton = (
  generic,
  delType,
  delKey,
  delRoot,
  fnConfirm,
  as = 'button'
) => (
  <ButtonDelField
    generic={generic}
    delType={delType}
    delKey={delKey}
    delRoot={delRoot}
    fnConfirm={fnConfirm}
    as={as}
  />
);

export default renderDeleteButton;
