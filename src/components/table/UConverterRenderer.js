/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { genUnit } from 'generic-ui-core';
import { genUnitSup } from '../tools/utils';

const UConverterRenderer = props => {
  const { sField, onChange, node } = props;
  if (sField.type !== 'system-defined') return null;
  const { data } = node;
  return (
    <Button
      key={`ucr_${data.id}`}
      onClick={() => onChange(sField, node)}
      variant="success"
    >
      {genUnitSup(
        genUnit(sField.option_layers, data[sField.id].value_system).label
      ) || ''}
    </Button>
  );
};

UConverterRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
};

export default UConverterRenderer;
