import React from 'react';
import FieldLabel from '@components/fields/FieldLabel';

const FieldHeader = (opt) => {
  const { label, description, isSpCall, f_obj: fObj } = opt;
  if (label === undefined) return null;
  if (label === '') return <FieldLabel label={' '} />;
  if (label !== '' && !fObj) return <FieldLabel label={label} />;
  return (
    <FieldLabel
      label={label}
      desc={description}
      isSpCall={isSpCall}
      ontology={fObj.ontology}
    />
  );
};

export default FieldHeader;
