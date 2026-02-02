import React from 'react';
import PropTypes from 'prop-types';
import { getCondOperator } from 'generic-ui-core';
import FIcons from '@components/icons/FIcons';
import { fieldLabelFor, layerLabelFor } from '@utils/pureUtils';

function ConditionView({ conditions, layers }) {
  const { cond_fields: condFields = [], cond_operator: matchOp = 1 } =
    conditions;

  if (!condFields.length) return null;

  const availableLayers = layers
    ? Object.keys(layers).map((key) => ({
        key,
        label: layers[key].label,
        fields: layers[key].fields || [],
      }))
    : [];

  if (!availableLayers.length) return null;

  const matchOpLabel = getCondOperator[matchOp];
  return (
    <>
      <small className="text-muted d-block mb-2">
        {FIcons.faGears} Existing Conditions: {matchOpLabel}
      </small>
      {condFields.map((cond) => (
        <div
          key={cond.id}
          className="d-flex align-items-center gap-2 mb-2 p-2 border rounded bg-white"
        >
          <small className="flex-grow-1">
            <strong>{layerLabelFor(availableLayers, cond.layer)}</strong> →{' '}
            {fieldLabelFor(availableLayers, cond.layer, cond.field)} = &quot;
            {typeof cond.value === 'boolean' ? String(cond.value) : cond.value}
            &quot;
          </small>
        </div>
      ))}
    </>
  );
}

ConditionView.propTypes = {
  conditions: PropTypes.shape({
    cond_fields: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        layer: PropTypes.string,
        field: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      }),
    ),
    cond_operator: PropTypes.number,
  }).isRequired,
  layers: PropTypes.objectOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          field: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }),
      ),
    }),
  ).isRequired,
};

export default ConditionView;
