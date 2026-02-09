import React from 'react';
import PropTypes from 'prop-types';
import Constants from '@components/tools/Constants';
import SelectElement from '@components/fields/SelectElement';
import { GenPropertiesDrop } from '@components/fields/GenPropertiesFields';

function PropDrop(props) {
  const { genericType } = props;
  if (genericType === Constants.GENERIC_TYPES.DATASET) {
    return <SelectElement {...props} />;
  }
  return <GenPropertiesDrop {...props} />;
}

PropDrop.propTypes = {
  genericType: PropTypes.string.isRequired,
};

export default PropDrop;
