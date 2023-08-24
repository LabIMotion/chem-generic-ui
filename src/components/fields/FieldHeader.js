import React from 'react';
import FieldLabel from './FieldLabel';

const FieldHeader = opt => {
  const { label, description, isSpCall } = opt;
  if (label === '') return <FieldLabel label={' '} />;
  return <FieldLabel label={label} desc={description} isSpCall={isSpCall} />;
};

export default FieldHeader;
