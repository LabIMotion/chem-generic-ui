/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { genUnit, FieldTypes } from 'generic-ui-core';
import { genUnitSup } from '@components/tools/utils';

function UConverterRenderer(props) {
  const { sField, onChange, node, isPreview } = props;
  if (sField.type !== FieldTypes.F_SYSTEM_DEFINED) return null;
  const { data } = node;
  return (
    <Button
      key={`ucr_${data.id}`}
      onClick={() => onChange(sField, node)}
      variant="success"
      size="sm"
      disabled={isPreview}
    >
      {genUnitSup(
        genUnit(sField.option_layers, data[sField.id]?.value_system).label,
      ) || ''}
    </Button>
  );
}

UConverterRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  isPreview: PropTypes.bool,
};

UConverterRenderer.defaultProps = {
  isPreview: false,
};

export default UConverterRenderer;
