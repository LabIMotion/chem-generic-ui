import React from 'react';
import Constants from '@components/tools/Constants';
import SelectElement from '@components/fields/SelectElement';
import { GenPropertiesDrop } from '@components/fields/GenPropertiesFields';

const PropDrop = (props) => {
  const { genericType } = props;
  if (genericType === Constants.GENERIC_TYPES.DATASET) {
    return <SelectElement {...props} />;
  }
  return <GenPropertiesDrop {...props} />;
};

export default PropDrop;
