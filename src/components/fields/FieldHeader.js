import React from 'react';
import FieldLabel from './FieldLabel';

const FieldHeader = opt => {
  const { label, description, isSpCall, f_obj: fObj } = opt;
  if (label === '') return <FieldLabel label={' '} />;
  return <FieldLabel label={label} desc={description} isSpCall={isSpCall} ontology={fObj.ontology} />;
};

export default FieldHeader;
